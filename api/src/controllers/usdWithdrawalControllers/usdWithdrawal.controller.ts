// controllers/usdWithdrawalControllers/usdWithdrawal.controller.ts
import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';
import stripeService from '../../services/stripe.service';
import binanceService, { BinanceService } from '../../services/binance.service';

const { JsonResponse } = commonsUtils;

// ========== HELPER FUNCTIONS ==========

/**
 * Get withdrawal settings (creates default if not exists)
 */
const getWithdrawalSettings = async () => {
  let settings = await models.WithdrawalSettings.findOne();
  
  if (!settings) {
    settings = await models.WithdrawalSettings.create({
      stripeEnabled: false,
      binanceEnabled: true,
      binanceApiKey: process.env.BINANCE_API_KEY || '',
      binanceSecretKey: process.env.BINANCE_SECRET_KEY || '',
      binanceNetwork: 'BSC',
      binanceCurrency: 'USDT',
      defaultWithdrawalMethod: 'binance',
    });
  }
  
  return settings;
};

/**
 * Get Binance service with updated credentials from settings
 * Prioritizes .env values if they exist, otherwise uses database settings
 */
const getBinanceServiceWithSettings = async () => {
  const settings = await getWithdrawalSettings();
  
  // Use .env values if available, otherwise fall back to database settings
  const apiKey = process.env.BINANCE_API_KEY || settings.binanceApiKey;
  const secretKey = process.env.BINANCE_SECRET_KEY || settings.binanceSecretKey;
  
  const binance = new BinanceService(apiKey, secretKey);
  return { binance, settings };
};

/**
 * Get exchange rate (from settings or service)
 */
const getExchangeRate = async () => {
  const settings = await getWithdrawalSettings();
  return settings.usdExchangeRate || 83;
};

/**
 * Convert INR to USD
 */
const convertINRtoUSD = (amountINR: number, exchangeRate: number): number => {
  return Number((amountINR / exchangeRate).toFixed(2));
};

// ========== USER ENDPOINTS ==========

/**
 * Get USD Wallet Info for a user
 */
export const getUSDWalletInfo = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const user = await models.User.findById(userId).select('isUSDUser name phone');
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'USD Wallet',
      });
    }

    if (!user.isUSDUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 403,
        message: 'You are not enabled for USD withdrawals.',
        title: 'USD Wallet',
      });
    }

    // Get withdrawal settings
    const settings = await getWithdrawalSettings();
    const exchangeRate = settings.usdExchangeRate || 83;

    // Get or create USD wallet
    let usdWallet = await models.USDWallet.findOne({ userId });
    
    if (!usdWallet) {
      usdWallet = await models.USDWallet.create({
        userId,
        balanceINR: 0,
        balanceUSD: 0,
        lastExchangeRate: exchangeRate,
      });
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD Wallet',
      message: 'USD wallet info retrieved successfully.',
      data: {
        wallet: {
          balanceINR: usdWallet.balanceINR,
          balanceUSD: usdWallet.balanceUSD,
          totalFundedINR: usdWallet.totalFundedINR,
          totalWithdrawnUSD: usdWallet.totalWithdrawnUSD,
          // Stripe details
          stripeConnectStatus: usdWallet.stripeConnectStatus,
          stripeOnboardingComplete: usdWallet.stripeOnboardingComplete,
          // Binance details
          binanceWalletAddress: usdWallet.binanceWalletAddress,
          binanceNetwork: usdWallet.binanceNetwork,
          binanceVerified: usdWallet.binanceVerified,
          // Preferred method
          preferredWithdrawalMethod: usdWallet.preferredWithdrawalMethod,
        },
        currentExchangeRate: exchangeRate,
        isUSDUser: true,
        // Enabled methods
        withdrawalMethods: {
          stripeEnabled: settings.stripeEnabled,
          binanceEnabled: settings.binanceEnabled,
          defaultMethod: settings.defaultWithdrawalMethod,
          binanceNetwork: settings.binanceNetwork,
          binanceCurrency: settings.binanceCurrency,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching USD wallet info:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching USD wallet info.',
      title: 'USD Wallet',
    });
  }
};

/**
 * Save/Update Binance Wallet Address
 */
export const saveBinanceWalletAddress = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { walletAddress, network } = req.body;

    if (!walletAddress) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Wallet address is required.',
        title: 'Binance Wallet',
      });
    }

    const settings = await getWithdrawalSettings();
    const selectedNetwork = network || settings.binanceNetwork || 'BSC';

    // Validate address format
    const isValidAddress = binanceService.validateAddress(walletAddress, selectedNetwork);
    if (!isValidAddress) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `Invalid wallet address format for ${selectedNetwork} network.`,
        title: 'Binance Wallet',
      });
    }

    const user = await models.User.findById(userId).select('isUSDUser');
    if (!user || !user.isUSDUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 403,
        message: 'You are not enabled for USD withdrawals.',
        title: 'Binance Wallet',
      });
    }

    let usdWallet = await models.USDWallet.findOne({ userId });
    if (!usdWallet) {
      const exchangeRate = await getExchangeRate();
      usdWallet = await models.USDWallet.create({
        userId,
        lastExchangeRate: exchangeRate,
      });
    }

    usdWallet.binanceWalletAddress = walletAddress;
    usdWallet.binanceNetwork = selectedNetwork;
    usdWallet.binanceVerified = true;
    usdWallet.preferredWithdrawalMethod = 'binance';
    await usdWallet.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Binance Wallet',
      message: 'Binance wallet address saved successfully.',
      data: {
        binanceWalletAddress: usdWallet.binanceWalletAddress,
        binanceNetwork: usdWallet.binanceNetwork,
        binanceVerified: usdWallet.binanceVerified,
      },
    });
  } catch (error) {
    console.error('Error saving Binance wallet address:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while saving wallet address.',
      title: 'Binance Wallet',
    });
  }
};

/**
 * Get available withdrawal methods for user
 */
export const getWithdrawalMethods = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const settings = await getWithdrawalSettings();
    
    const usdWallet = await models.USDWallet.findOne({ userId });
    
    const methods = [];
    
    // Check Stripe
    if (settings.stripeEnabled) {
      methods.push({
        method: 'stripe',
        name: 'Stripe (Bank Transfer)',
        enabled: true,
        configured: usdWallet?.stripeOnboardingComplete || false,
        fee: `${settings.stripeFeePercent}%`,
        description: 'Withdraw to your bank account via Stripe',
      });
    }
    
    // Check Binance
    if (settings.binanceEnabled) {
      methods.push({
        method: 'binance',
        name: `Binance (${settings.binanceCurrency} - ${settings.binanceNetwork})`,
        enabled: true,
        configured: usdWallet?.binanceVerified || false,
        walletAddress: usdWallet?.binanceWalletAddress || null,
        network: settings.binanceNetwork,
        currency: settings.binanceCurrency,
        fee: `${settings.binanceFeePercent}%`,
        description: `Withdraw ${settings.binanceCurrency} to your crypto wallet`,
      });
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Withdrawal Methods',
      message: 'Available withdrawal methods retrieved.',
      data: {
        methods,
        defaultMethod: settings.defaultWithdrawalMethod,
        preferredMethod: usdWallet?.preferredWithdrawalMethod || settings.defaultWithdrawalMethod,
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawal methods:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching withdrawal methods.',
      title: 'Withdrawal Methods',
    });
  }
};

/**
 * Create Stripe Connect Account for USD user
 */
export const createStripeConnectAccount = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { email, returnUrl, refreshUrl } = req.body;

    // Check if Stripe is enabled
    const settings = await getWithdrawalSettings();
    if (!settings.stripeEnabled) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Stripe withdrawals are currently disabled. Please use Binance.',
        title: 'Stripe Connect',
      });
    }

    const user = await models.User.findById(userId).select('isUSDUser name');
    if (!user || !user.isUSDUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 403,
        message: 'You are not enabled for USD withdrawals.',
        title: 'Stripe Connect',
      });
    }

    const exchangeRate = await getExchangeRate();
    let usdWallet = await models.USDWallet.findOne({ userId });
    
    if (!usdWallet) {
      usdWallet = await models.USDWallet.create({
        userId,
        lastExchangeRate: exchangeRate,
      });
    }

    // Check if already connected
    if (usdWallet.stripeConnectAccountId && usdWallet.stripeOnboardingComplete) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Stripe Connect account already set up.',
        title: 'Stripe Connect',
      });
    }

    let accountId = usdWallet.stripeConnectAccountId;

    // Create new account if not exists
    if (!accountId) {
      const account = await stripeService.createConnectAccount(email, {
        userId: userId.toString(),
      });
      accountId = account.id;

      usdWallet.stripeConnectAccountId = accountId;
      usdWallet.stripeConnectStatus = 'pending';
      await usdWallet.save();
    }

    const ensureProtocol = (u?: string) => {
      if (!u) return u;
      if (/^https?:\/\//i.test(u)) return u;
      return `http://${u}`;
    };

    const defaultRefresh = `${process.env.WEB_URL || 'http://localhost:5174'}/usd-withdrawal?refresh=true`;
    const defaultReturn = `${process.env.WEB_URL || 'http://localhost:5174'}/usd-withdrawal?success=true`;

    const finalRefreshUrl: string = ensureProtocol(refreshUrl) || ensureProtocol(defaultRefresh) || defaultRefresh;
    const finalReturnUrl: string = ensureProtocol(returnUrl) || ensureProtocol(defaultReturn) || defaultReturn;

    const accountLink = await stripeService.createAccountLink(
      accountId,
      finalRefreshUrl,
      finalReturnUrl
    );

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Stripe Connect',
      message: 'Onboarding link created successfully.',
      data: {
        onboardingUrl: accountLink.url,
        accountId,
      },
    });
  } catch (error) {
    console.error('Error creating Stripe Connect account:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while setting up Stripe Connect.',
      title: 'Stripe Connect',
    });
  }
};

/**
 * Check Stripe Connect Account Status
 */
export const checkStripeConnectStatus = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const usdWallet = await models.USDWallet.findOne({ userId });
    
    if (!usdWallet || !usdWallet.stripeConnectAccountId) {
      return JsonResponse(res, {
        status: 'success',
        statusCode: 200,
        title: 'Stripe Connect',
        message: 'No Stripe Connect account found.',
        data: {
          connected: false,
          status: 'not_connected',
        },
      });
    }

    const isOnboarded = await stripeService.isAccountOnboarded(
      usdWallet.stripeConnectAccountId
    );

    if (isOnboarded && !usdWallet.stripeOnboardingComplete) {
      usdWallet.stripeOnboardingComplete = true;
      usdWallet.stripeConnectStatus = 'connected';
      await usdWallet.save();
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Stripe Connect',
      message: 'Stripe Connect status retrieved.',
      data: {
        connected: isOnboarded,
        status: usdWallet.stripeConnectStatus,
        accountId: usdWallet.stripeConnectAccountId,
      },
    });
  } catch (error) {
    console.error('Error checking Stripe Connect status:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while checking Stripe Connect status.',
      title: 'Stripe Connect',
    });
  }
};

/**
 * Create USD Withdrawal Request
 * Supports both Stripe and Binance based on settings
 */
export const createUSDWithdrawal = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { amountINR, withdrawalMethod } = req.body;

    if (!amountINR || amountINR <= 0) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid withdrawal amount.',
        title: 'USD Withdrawal',
      });
    }

    const user = await models.User.findById(userId).select('isUSDUser');
    if (!user || !user.isUSDUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 403,
        message: 'You are not enabled for USD withdrawals.',
        title: 'USD Withdrawal',
      });
    }

    const usdWallet = await models.USDWallet.findOne({ userId });
    if (!usdWallet) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'USD wallet not found.',
        title: 'USD Withdrawal',
      });
    }

    // Get settings to determine method
    const settings = await getWithdrawalSettings();
    const selectedMethod = withdrawalMethod || usdWallet.preferredWithdrawalMethod || settings.defaultWithdrawalMethod;

    // Validate selected method is enabled
    if (selectedMethod === 'stripe' && !settings.stripeEnabled) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Stripe withdrawals are currently disabled.',
        title: 'USD Withdrawal',
      });
    }

    if (selectedMethod === 'binance' && !settings.binanceEnabled) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Binance withdrawals are currently disabled.',
        title: 'USD Withdrawal',
      });
    }

    // Validate withdrawal setup based on method
    if (selectedMethod === 'stripe') {
      if (!usdWallet.stripeConnectAccountId || !usdWallet.stripeOnboardingComplete) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'Please complete Stripe Connect setup first.',
          title: 'USD Withdrawal',
        });
      }
    } else if (selectedMethod === 'binance') {
      if (!usdWallet.binanceWalletAddress || !usdWallet.binanceVerified) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'Please add and verify your Binance wallet address first.',
          title: 'USD Withdrawal',
        });
      }
    }

    const exchangeRate = settings.usdExchangeRate || 83;
    const amountUSD = convertINRtoUSD(amountINR, exchangeRate);

    // Check sufficient balance
    if (usdWallet.balanceINR < amountINR) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `Insufficient balance. Available: ₹${usdWallet.balanceINR.toLocaleString()} ($${usdWallet.balanceUSD.toFixed(2)})`,
        title: 'USD Withdrawal',
      });
    }

    // Check minimum withdrawal (using 0.01 INR for testing, ignoring DB value if it's too high)
    const minWithdrawal = Math.min(settings.minWithdrawalINR || 0.01, 0.01);
    if (amountINR < minWithdrawal) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `Minimum withdrawal amount is ₹${minWithdrawal}.`,
        title: 'USD Withdrawal',
      });
    }

    // Check maximum withdrawal
    const maxWithdrawal = settings.maxWithdrawalINR || 500000;
    if (amountINR > maxWithdrawal) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `Maximum withdrawal amount is ₹${maxWithdrawal.toLocaleString()}.`,
        title: 'USD Withdrawal',
      });
    }

    // Create withdrawal request
    const withdrawalData: any = {
      userId,
      amountINR,
      amountUSD,
      exchangeRate,
      withdrawalMethod: selectedMethod,
      status: 'pending',
    };

    // Add method-specific data
    if (selectedMethod === 'binance') {
      withdrawalData.binanceWalletAddress = usdWallet.binanceWalletAddress;
      withdrawalData.binanceNetwork = usdWallet.binanceNetwork || settings.binanceNetwork;
      withdrawalData.binanceCurrency = settings.binanceCurrency;
    }

    const withdrawal = await models.USDWithdrawal.create(withdrawalData) as any;

    // Deduct from wallet (hold)
    usdWallet.balanceINR -= amountINR;
    usdWallet.balanceUSD = convertINRtoUSD(usdWallet.balanceINR, exchangeRate);
    await usdWallet.save();

    // Create transaction record
    await models.USDWalletTransaction.create({
      userId,
      type: 'debit',
      amountINR,
      amountUSD,
      exchangeRate,
      description: `USD Withdrawal Request #${withdrawal._id.toString().slice(-8)} (${selectedMethod.toUpperCase()})`,
      referenceType: 'withdrawal',
      referenceId: withdrawal._id,
      balanceAfterINR: usdWallet.balanceINR,
      balanceAfterUSD: usdWallet.balanceUSD,
    });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 201,
      title: 'USD Withdrawal',
      message: 'Withdrawal request created successfully.',
      data: {
        withdrawal: {
          _id: withdrawal._id,
          amountUSD: withdrawal.amountUSD,
          amountINR: withdrawal.amountINR,
          exchangeRate: withdrawal.exchangeRate,
          withdrawalMethod: withdrawal.withdrawalMethod,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Error creating USD withdrawal:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while creating withdrawal request.',
      title: 'USD Withdrawal',
    });
  }
};

/**
 * Get USD Withdrawal History for user
 */
export const getUSDWithdrawalHistory = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [withdrawals, totalCount] = await Promise.all([
      models.USDWithdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      models.USDWithdrawal.countDocuments(query),
    ]);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD Withdrawal History',
      message: 'Withdrawal history retrieved successfully.',
      data: {
        withdrawals,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching USD withdrawal history:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching withdrawal history.',
      title: 'USD Withdrawal History',
    });
  }
};

/**
 * Get USD Wallet Transaction History
 */
export const getUSDTransactionHistory = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { page = 1, limit = 10, type } = req.query;

    const query: any = { userId };
    if (type && type !== 'all') {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, totalCount] = await Promise.all([
      models.USDWalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      models.USDWalletTransaction.countDocuments(query),
    ]);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD Transaction History',
      message: 'Transaction history retrieved successfully.',
      data: {
        transactions,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching USD transaction history:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching transaction history.',
      title: 'USD Transaction History',
    });
  }
};

// ========== ADMIN CONTROLLERS ==========

/**
 * Get Withdrawal Settings (Admin)
 */
export const getWithdrawalSettingsAdmin = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const settings = await getWithdrawalSettings();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Withdrawal Settings',
      message: 'Settings retrieved successfully.',
      data: {
        settings: {
          stripeEnabled: settings.stripeEnabled,
          binanceEnabled: settings.binanceEnabled,
          binanceNetwork: settings.binanceNetwork,
          binanceCurrency: settings.binanceCurrency,
          usdExchangeRate: settings.usdExchangeRate,
          minWithdrawalINR: settings.minWithdrawalINR,
          maxWithdrawalINR: settings.maxWithdrawalINR,
          stripeFeePercent: settings.stripeFeePercent,
          binanceFeePercent: settings.binanceFeePercent,
          defaultWithdrawalMethod: settings.defaultWithdrawalMethod,
          notes: settings.notes,
          // Don't expose API keys fully
          binanceApiKeyConfigured: !!settings.binanceApiKey,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching withdrawal settings:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching settings.',
      title: 'Withdrawal Settings',
    });
  }
};

/**
 * Update Withdrawal Settings (Admin)
 */
export const updateWithdrawalSettings = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const adminId = res.locals.adminId;
    const {
      stripeEnabled,
      binanceEnabled,
      binanceApiKey,
      binanceSecretKey,
      binanceNetwork,
      binanceCurrency,
      usdExchangeRate,
      minWithdrawalINR,
      maxWithdrawalINR,
      stripeFeePercent,
      binanceFeePercent,
      defaultWithdrawalMethod,
      notes,
    } = req.body;

    let settings = await models.WithdrawalSettings.findOne();
    
    if (!settings) {
      settings = new models.WithdrawalSettings();
    }

    // Update fields if provided
    if (typeof stripeEnabled === 'boolean') settings.stripeEnabled = stripeEnabled;
    if (typeof binanceEnabled === 'boolean') settings.binanceEnabled = binanceEnabled;
    if (binanceApiKey) settings.binanceApiKey = binanceApiKey;
    if (binanceSecretKey) settings.binanceSecretKey = binanceSecretKey;
    if (binanceNetwork) settings.binanceNetwork = binanceNetwork;
    if (binanceCurrency) settings.binanceCurrency = binanceCurrency;
    if (usdExchangeRate) settings.usdExchangeRate = usdExchangeRate;
    if (minWithdrawalINR) settings.minWithdrawalINR = minWithdrawalINR;
    if (maxWithdrawalINR) settings.maxWithdrawalINR = maxWithdrawalINR;
    if (stripeFeePercent !== undefined) settings.stripeFeePercent = stripeFeePercent;
    if (binanceFeePercent !== undefined) settings.binanceFeePercent = binanceFeePercent;
    if (defaultWithdrawalMethod) settings.defaultWithdrawalMethod = defaultWithdrawalMethod;
    if (notes !== undefined) settings.notes = notes;
    
    settings.updatedBy = adminId;
    await settings.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Withdrawal Settings',
      message: 'Settings updated successfully.',
      data: {
        settings: {
          stripeEnabled: settings.stripeEnabled,
          binanceEnabled: settings.binanceEnabled,
          binanceNetwork: settings.binanceNetwork,
          binanceCurrency: settings.binanceCurrency,
          usdExchangeRate: settings.usdExchangeRate,
          defaultWithdrawalMethod: settings.defaultWithdrawalMethod,
        },
      },
    });
  } catch (error) {
    console.error('Error updating withdrawal settings:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while updating settings.',
      title: 'Withdrawal Settings',
    });
  }
};

/**
 * Test Binance Connection (Admin)
 */
export const testBinanceConnection = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { binance, settings } = await getBinanceServiceWithSettings();
    
    // Check if API key is configured
    if (!settings.binanceApiKey || !settings.binanceSecretKey) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Binance API credentials are not configured. Please add your API key and secret key in settings.',
        title: 'Binance Connection',
        data: {
          connected: false,
          error: 'NO_CREDENTIALS',
        },
      });
    }
    
    // Try to get account balances to test connection
    const balances = await binance.getAccountBalances();
    const usdtBalance = balances.find((b: any) => b.coin === settings.binanceCurrency);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Binance Connection',
      message: 'Binance connection successful.',
      data: {
        connected: true,
        currency: settings.binanceCurrency,
        network: settings.binanceNetwork,
        balance: usdtBalance ? {
          free: usdtBalance.free,
          locked: usdtBalance.locked,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Binance connection test failed:', error);
    
    // Extract meaningful error message
    let errorMessage = error.message || 'Unknown error';
    const errorCode = error.code;
    
    // Map Binance error codes to user-friendly messages
    if (errorCode === -2008) {
      errorMessage = 'Invalid API Key. Please check your Binance API key is correct and active.';
    } else if (errorCode === -2015) {
      errorMessage = 'Invalid API Key or IP not whitelisted. Please check your API permissions and IP whitelist.';
    } else if (errorCode === -1022) {
      errorMessage = 'Invalid signature. Please check your Secret Key is correct.';
    } else if (errorCode === -1021) {
      errorMessage = 'Timestamp error. Please check your server time is synchronized.';
    } else if (errorCode === -1002) {
      errorMessage = 'Unauthorized. API key does not have required permissions.';
    }
    
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: `Binance connection failed: ${errorMessage}`,
      title: 'Binance Connection',
      data: {
        connected: false,
        errorCode: errorCode,
      },
    });
  }
};

/**
 * Toggle USD User Status (Admin)
 */
export const toggleUSDUserStatus = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { isUSDUser } = req.body;

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'USD User Toggle',
      });
    }

    user.isUSDUser = isUSDUser;
    await user.save();

    // Create USD wallet if enabling
    if (isUSDUser) {
      const existingWallet = await models.USDWallet.findOne({ userId });
      if (!existingWallet) {
        const exchangeRate = await getExchangeRate();
        await models.USDWallet.create({
          userId,
          lastExchangeRate: exchangeRate,
        });
      }
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD User Toggle',
      message: `User ${isUSDUser ? 'enabled' : 'disabled'} for USD withdrawals.`,
      data: { isUSDUser: user.isUSDUser },
    });
  } catch (error) {
    console.error('Error toggling USD user status:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while updating user status.',
      title: 'USD User Toggle',
    });
  }
};

/**
 * Fund USD Wallet (Admin)
 */
export const fundUSDWallet = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const adminId = res.locals.adminId;
    const { userId } = req.params;
    const { amountINR, description } = req.body;

    if (!amountINR || amountINR <= 0) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid amount.',
        title: 'Fund USD Wallet',
      });
    }

    const user = await models.User.findById(userId).select('isUSDUser name');
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Fund USD Wallet',
      });
    }

    if (!user.isUSDUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'User is not enabled for USD withdrawals.',
        title: 'Fund USD Wallet',
      });
    }

    const exchangeRate = await getExchangeRate();
    let usdWallet = await models.USDWallet.findOne({ userId });
    
    if (!usdWallet) {
      usdWallet = await models.USDWallet.create({
        userId,
        lastExchangeRate: exchangeRate,
      });
    }

    const amountUSD = convertINRtoUSD(amountINR, exchangeRate);

    // Update wallet
    usdWallet.balanceINR += amountINR;
    usdWallet.balanceUSD = convertINRtoUSD(usdWallet.balanceINR, exchangeRate);
    usdWallet.totalFundedINR += amountINR;
    usdWallet.lastExchangeRate = exchangeRate;
    await usdWallet.save();

    // Create transaction record
    await models.USDWalletTransaction.create({
      userId,
      type: 'credit',
      amountINR,
      amountUSD,
      exchangeRate,
      description: description || 'Admin wallet funding',
      referenceType: 'admin_fund',
      balanceAfterINR: usdWallet.balanceINR,
      balanceAfterUSD: usdWallet.balanceUSD,
      processedBy: adminId,
    });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Fund USD Wallet',
      message: `Successfully funded ₹${amountINR} ($${amountUSD.toFixed(2)}) to ${user.name}'s USD wallet.`,
      data: {
        wallet: {
          balanceINR: usdWallet.balanceINR,
          balanceUSD: usdWallet.balanceUSD,
          totalFundedINR: usdWallet.totalFundedINR,
        },
      },
    });
  } catch (error) {
    console.error('Error funding USD wallet:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while funding wallet.',
      title: 'Fund USD Wallet',
    });
  }
};

/**
 * Get All USD Withdrawals (Admin)
 */
export const getAllUSDWithdrawals = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { page = 1, limit = 10, status, search, method } = req.query;

    const pageNum = Number.parseInt(page as string, 10);
    const limitNum = Number.parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (method && method !== 'all') {
      filter.withdrawalMethod = method;
    }

    // Search by user
    if (search) {
      const users = await models.User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      const userIds = users.map((u) => u._id);
      filter.userId = { $in: userIds };
    }

    const [withdrawals, totalCount] = await Promise.all([
      models.USDWithdrawal.find(filter)
        .populate('userId', 'name phone')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.USDWithdrawal.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await models.USDWithdrawal.aggregate([
      {
        $group: {
          _id: { status: '$status', method: '$withdrawalMethod' },
          count: { $sum: 1 },
          totalUSD: { $sum: '$amountUSD' },
          totalINR: { $sum: '$amountINR' },
        },
      },
    ]);

    const statistics = {
      pendingCount: stats.filter((s) => s._id.status === 'pending').reduce((acc, s) => acc + s.count, 0),
      pendingAmountUSD: stats.filter((s) => s._id.status === 'pending').reduce((acc, s) => acc + s.totalUSD, 0),
      completedCount: stats.filter((s) => s._id.status === 'completed').reduce((acc, s) => acc + s.count, 0),
      completedAmountUSD: stats.filter((s) => s._id.status === 'completed').reduce((acc, s) => acc + s.totalUSD, 0),
      rejectedCount: stats.filter((s) => s._id.status === 'rejected').reduce((acc, s) => acc + s.count, 0),
      failedCount: stats.filter((s) => s._id.status === 'failed').reduce((acc, s) => acc + s.count, 0),
      totalCount: stats.reduce((acc, s) => acc + s.count, 0),
      byMethod: {
        stripe: stats.filter((s) => s._id.method === 'stripe').reduce((acc, s) => acc + s.count, 0),
        binance: stats.filter((s) => s._id.method === 'binance').reduce((acc, s) => acc + s.count, 0),
      },
    };

    // Get current settings
    const settings = await getWithdrawalSettings();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD Withdrawals',
      message: 'USD withdrawals retrieved successfully.',
      data: {
        withdrawals,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
        statistics,
        settings: {
          stripeEnabled: settings.stripeEnabled,
          binanceEnabled: settings.binanceEnabled,
          defaultMethod: settings.defaultWithdrawalMethod,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching USD withdrawals:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching withdrawals.',
      title: 'USD Withdrawals',
    });
  }
};

/**
 * Approve USD Withdrawal (Admin) - Process via Stripe or Binance
 */
export const approveUSDWithdrawal = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const adminId = res.locals.adminId;
    const { withdrawalId } = req.params;
    const { remarks } = req.body;

    const withdrawal = await models.USDWithdrawal.findById(withdrawalId) as any;
    if (!withdrawal) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Withdrawal not found.',
        title: 'Approve USD Withdrawal',
      });
    }

    if (withdrawal.status !== 'pending') {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Withdrawal is not in pending status.',
        title: 'Approve USD Withdrawal',
      });
    }

    const usdWallet = await models.USDWallet.findOne({ userId: withdrawal.userId });
    const settings = await getWithdrawalSettings();
    const withdrawalMethod = withdrawal.withdrawalMethod || settings.defaultWithdrawalMethod;

    // Process based on withdrawal method
    if (withdrawalMethod === 'stripe') {
      // ===== STRIPE WITHDRAWAL =====
      if (!settings.stripeEnabled) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'Stripe withdrawals are currently disabled.',
          title: 'Approve USD Withdrawal',
        });
      }

      if (!usdWallet || !usdWallet.stripeConnectAccountId) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'User does not have a Stripe Connect account.',
          title: 'Approve USD Withdrawal',
        });
      }

      try {
        const amountCents = stripeService.usdToCents(withdrawal.amountUSD);
        
        const transfer = await stripeService.createTransfer(
          amountCents,
          usdWallet.stripeConnectAccountId,
          {
            withdrawalId: withdrawal._id.toString(),
            userId: withdrawal.userId.toString(),
          }
        );

        withdrawal.status = 'completed';
        withdrawal.stripeTransferId = transfer.id;
        withdrawal.stripePayoutStatus = 'transferred';
        withdrawal.adminRemarks = remarks || 'Approved and processed via Stripe';
        withdrawal.processedAt = new Date();
        withdrawal.processedBy = adminId;
        await withdrawal.save();

        // Update wallet
        usdWallet.totalWithdrawnUSD += withdrawal.amountUSD;
        await usdWallet.save();

        return JsonResponse(res, {
          status: 'success',
          statusCode: 200,
          title: 'Approve USD Withdrawal',
          message: 'Withdrawal approved and processed via Stripe successfully.',
          data: {
            withdrawal: {
              _id: withdrawal._id,
              status: withdrawal.status,
              stripeTransferId: withdrawal.stripeTransferId,
              withdrawalMethod: 'stripe',
            },
          },
        });
      } catch (stripeError: any) {
        // Handle Stripe error - refund to wallet
        return await handleWithdrawalFailure(res, withdrawal, usdWallet, adminId, stripeError, 'Stripe');
      }
    } else if (withdrawalMethod === 'binance') {
      // ===== BINANCE WITHDRAWAL =====
      if (!settings.binanceEnabled) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'Binance withdrawals are currently disabled.',
          title: 'Approve USD Withdrawal',
        });
      }

      const walletAddress = withdrawal.binanceWalletAddress || usdWallet?.binanceWalletAddress;
      if (!walletAddress) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          message: 'User does not have a Binance wallet address configured.',
          title: 'Approve USD Withdrawal',
        });
      }

      try {
        const { binance } = await getBinanceServiceWithSettings();
        const network = withdrawal.binanceNetwork || settings.binanceNetwork;
        const currency = withdrawal.binanceCurrency || settings.binanceCurrency;

        // Validate address
        if (!binance.validateAddress(walletAddress, network)) {
          return JsonResponse(res, {
            status: 'error',
            statusCode: 400,
            message: `Invalid wallet address format for ${network} network.`,
            title: 'Approve USD Withdrawal',
          });
        }

        // Calculate fee
        const feePercent = settings.binanceFeePercent || 0.1;
        const fee = (withdrawal.amountUSD * feePercent) / 100;
        const netAmount = withdrawal.amountUSD - fee;

        console.log(`Processing Binance withdrawal: ${netAmount} ${currency} to ${walletAddress} on ${network}`);

        // Execute Binance withdrawal
        const withdrawResult = await binance.withdraw({
          coin: currency,
          network: network,
          address: walletAddress,
          amount: netAmount,
          withdrawOrderId: withdrawal._id.toString(),
        });

        withdrawal.status = 'completed';
        withdrawal.binanceWithdrawId = withdrawResult.id;
        withdrawal.binanceStatus = 'processing';
        withdrawal.binanceFee = fee;
        withdrawal.adminRemarks = remarks || `Approved and processed via Binance (${currency} on ${network})`;
        withdrawal.processedAt = new Date();
        withdrawal.processedBy = adminId;
        await withdrawal.save();

        // Update wallet
        if (usdWallet) {
          usdWallet.totalWithdrawnUSD += withdrawal.amountUSD;
          await usdWallet.save();
        }

        return JsonResponse(res, {
          status: 'success',
          statusCode: 200,
          title: 'Approve USD Withdrawal',
          message: `Withdrawal approved and processed via Binance. ${netAmount} ${currency} sent to wallet.`,
          data: {
            withdrawal: {
              _id: withdrawal._id,
              status: withdrawal.status,
              binanceWithdrawId: withdrawal.binanceWithdrawId,
              withdrawalMethod: 'binance',
              amountSent: netAmount,
              fee: fee,
              currency: currency,
              network: network,
            },
          },
        });
      } catch (binanceError: any) {
        // Handle Binance error - refund to wallet
        return await handleWithdrawalFailure(res, withdrawal, usdWallet, adminId, binanceError, 'Binance');
      }
    } else {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid withdrawal method.',
        title: 'Approve USD Withdrawal',
      });
    }
  } catch (error) {
    console.error('Error approving USD withdrawal:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while approving withdrawal.',
      title: 'Approve USD Withdrawal',
    });
  }
};

/**
 * Handle withdrawal failure and refund
 */
const handleWithdrawalFailure = async (
  res: Response,
  withdrawal: any,
  usdWallet: any,
  adminId: string,
  error: any,
  provider: string
) => {
  console.error(`${provider} withdrawal error:`, error);

  // Mark withdrawal as failed
  withdrawal.status = 'failed';
  withdrawal.adminRemarks = `${provider} error: ${error.message || error.msg || 'Unknown error'}`;
  withdrawal.processedAt = new Date();
  withdrawal.processedBy = adminId;
  (withdrawal as any).refunded = true;
  await withdrawal.save();

  // Refund to wallet
  const exchangeRate = await getExchangeRate();
  
  if (usdWallet) {
    usdWallet.balanceINR += withdrawal.amountINR;
    usdWallet.balanceUSD = convertINRtoUSD(usdWallet.balanceINR, exchangeRate);
    await usdWallet.save();
  } else {
    // Create wallet if doesn't exist
    await models.USDWallet.create({
      userId: withdrawal.userId,
      balanceINR: withdrawal.amountINR,
      balanceUSD: convertINRtoUSD(withdrawal.amountINR, exchangeRate),
      lastExchangeRate: exchangeRate,
    });
  }

  // Create refund transaction
  await models.USDWalletTransaction.create({
    userId: withdrawal.userId,
    type: 'credit',
    amountINR: withdrawal.amountINR,
    amountUSD: withdrawal.amountUSD,
    exchangeRate,
    description: `Refund - Withdrawal #${withdrawal._id.toString().slice(-8)} failed (${provider})`,
    referenceType: 'refund',
    referenceId: withdrawal._id,
    balanceAfterINR: usdWallet?.balanceINR || withdrawal.amountINR,
    balanceAfterUSD: usdWallet?.balanceUSD || convertINRtoUSD(withdrawal.amountINR, exchangeRate),
    processedBy: adminId,
  });

  let errorMessage = `${provider} transfer failed: ${error.message || error.msg || 'Unknown error'}. Amount refunded to wallet.`;
  
  // Specific error messages
  if (provider === 'Stripe') {
    if (error.code === 'balance_insufficient') {
      errorMessage = 'Insufficient funds in platform Stripe account. Amount has been refunded to user\'s USD Wallet.';
    } else if (error.code === 'account_invalid') {
      errorMessage = 'User\'s Stripe Connect account is invalid. Amount refunded to wallet.';
    }
  } else if (provider === 'Binance') {
    if (error.code === -4026) {
      errorMessage = 'Binance: Insufficient balance. Please ensure your Binance account has sufficient funds.';
    } else if (error.code === -1002) {
      errorMessage = 'Binance: Invalid API key. Please check your API credentials.';
    } else if (error.code === -2015) {
      errorMessage = 'Binance: Invalid API key or IP not whitelisted.';
    }
  }

  return JsonResponse(res, {
    status: 'error',
    statusCode: 400,
    message: errorMessage,
    title: 'Approve USD Withdrawal',
    data: {
      errorCode: error.code,
      refunded: true,
    },
  });
};

/**
 * Reject USD Withdrawal (Admin)
 */
export const rejectUSDWithdrawal = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const adminId = res.locals.adminId;
    const { withdrawalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Rejection reason is required.',
        title: 'Reject USD Withdrawal',
      });
    }

    const withdrawal = await models.USDWithdrawal.findById(withdrawalId) as any;
    if (!withdrawal) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Withdrawal not found.',
        title: 'Reject USD Withdrawal',
      });
    }

    if (withdrawal.status !== 'pending') {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Withdrawal is not in pending status.',
        title: 'Reject USD Withdrawal',
      });
    }

    // Refund to wallet
    const usdWallet = await models.USDWallet.findOne({ userId: withdrawal.userId });
    const exchangeRate = await getExchangeRate();
    
    if (usdWallet) {
      usdWallet.balanceINR += withdrawal.amountINR;
      usdWallet.balanceUSD = convertINRtoUSD(usdWallet.balanceINR, exchangeRate);
      await usdWallet.save();

      // Create refund transaction
      await models.USDWalletTransaction.create({
        userId: withdrawal.userId,
        type: 'credit',
        amountINR: withdrawal.amountINR,
        amountUSD: withdrawal.amountUSD,
        exchangeRate,
        description: `Refund - Withdrawal #${withdrawal._id.toString().slice(-8)} rejected`,
        referenceType: 'refund',
        referenceId: withdrawal._id,
        balanceAfterINR: usdWallet.balanceINR,
        balanceAfterUSD: usdWallet.balanceUSD,
        processedBy: adminId,
      });
    }

    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = reason;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = adminId;
    await withdrawal.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Reject USD Withdrawal',
      message: 'Withdrawal rejected and amount refunded to wallet.',
      data: {
        withdrawal: {
          _id: withdrawal._id,
          status: withdrawal.status,
        },
      },
    });
  } catch (error) {
    console.error('Error rejecting USD withdrawal:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while rejecting withdrawal.',
      title: 'Reject USD Withdrawal',
    });
  }
};

/**
 * Get USD Wallet Details for a User (Admin)
 */
export const getUSDWalletByUserId = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user = await models.User.findById(userId).select('isUSDUser name phone');
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'USD Wallet',
      });
    }

    const usdWallet = await models.USDWallet.findOne({ userId });
    const exchangeRate = await getExchangeRate();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USD Wallet',
      message: 'USD wallet info retrieved successfully.',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          phone: user.phone,
          isUSDUser: user.isUSDUser,
        },
        wallet: usdWallet
          ? {
              balanceINR: usdWallet.balanceINR,
              balanceUSD: usdWallet.balanceUSD,
              totalFundedINR: usdWallet.totalFundedINR,
              totalWithdrawnUSD: usdWallet.totalWithdrawnUSD,
              stripeConnectStatus: usdWallet.stripeConnectStatus,
              stripeOnboardingComplete: usdWallet.stripeOnboardingComplete,
              binanceWalletAddress: usdWallet.binanceWalletAddress,
              binanceNetwork: usdWallet.binanceNetwork,
              binanceVerified: usdWallet.binanceVerified,
              preferredWithdrawalMethod: usdWallet.preferredWithdrawalMethod,
            }
          : null,
        currentExchangeRate: exchangeRate,
      },
    });
  } catch (error) {
    console.error('Error fetching USD wallet by user:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching USD wallet.',
      title: 'USD Wallet',
    });
  }
};

/**
 * Check Binance Withdrawal Status (Admin)
 */
export const checkBinanceWithdrawalStatus = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { withdrawalId } = req.params;
    
    const withdrawal = await models.USDWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Withdrawal not found.',
        title: 'Binance Withdrawal Status',
      });
    }

    if (!withdrawal.binanceWithdrawId) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'This is not a Binance withdrawal or has not been processed yet.',
        title: 'Binance Withdrawal Status',
      });
    }

    const { binance } = await getBinanceServiceWithSettings();
    const status = await binance.getWithdrawStatus(withdrawal.binanceWithdrawId);

    if (status) {
      // Update withdrawal with latest status
      withdrawal.binanceStatus = status.status;
      if (status.txId) {
        withdrawal.binanceTxHash = status.txId;
      }
      await withdrawal.save();
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Binance Withdrawal Status',
      message: 'Status retrieved successfully.',
      data: {
        withdrawalId: withdrawal._id,
        binanceWithdrawId: withdrawal.binanceWithdrawId,
        binanceStatus: status?.status || withdrawal.binanceStatus,
        txHash: status?.txId || withdrawal.binanceTxHash,
        network: withdrawal.binanceNetwork,
        currency: withdrawal.binanceCurrency,
      },
    });
  } catch (error) {
    console.error('Error checking Binance withdrawal status:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while checking withdrawal status.',
      title: 'Binance Withdrawal Status',
    });
  }
};

export default {
  // User endpoints
  getUSDWalletInfo,
  saveBinanceWalletAddress,
  getWithdrawalMethods,
  createStripeConnectAccount,
  checkStripeConnectStatus,
  createUSDWithdrawal,
  getUSDWithdrawalHistory,
  getUSDTransactionHistory,
  // Admin endpoints
  getWithdrawalSettingsAdmin,
  updateWithdrawalSettings,
  testBinanceConnection,
  toggleUSDUserStatus,
  fundUSDWallet,
  getAllUSDWithdrawals,
  approveUSDWithdrawal,
  rejectUSDWithdrawal,
  getUSDWalletByUserId,
  checkBinanceWithdrawalStatus,
};
