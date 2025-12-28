// services/stripe.service.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export const stripeService = {

  async createConnectAccount(email: string, metadata: { userId: string }) {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US', 
        email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata,
      });
      return account;
    } catch (error) {
      console.error('Error creating Stripe Connect account:', error);
      throw error;
    }
  },

  async createAccountLink(
    accountId: string,
    refreshUrl: string,
    returnUrl: string
  ) {
    try {
      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      });
      return accountLink;
    } catch (error) {
      console.error('Error creating account link:', error);
      throw error;
    }
  },

  async getConnectAccount(accountId: string) {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      return account;
    } catch (error) {
      console.error('Error retrieving Connect account:', error);
      throw error;
    }
  },
  async isAccountOnboarded(accountId: string): Promise<boolean> {
    try {
      const account = await stripe.accounts.retrieve(accountId);
      console.log('Stripe account status:', {
        accountId,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      });
      return account.details_submitted === true;
    } catch (error) {
      console.error('Error checking account status:', error);
      return false;
    }
  },

  async createTransfer(
    amount: number, 
    destinationAccountId: string,
    metadata: { withdrawalId: string; userId: string }
  ) {
    try {
      const transfer = await stripe.transfers.create({
        amount,
        currency: 'usd',
        destination: destinationAccountId,
        metadata,
      });
      return transfer;
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  },

  /**
   * Create a payout from connected account to their bank
   */
  async createPayout(
    amount: number, // Amount in cents (USD)
    accountId: string,
    metadata: { withdrawalId: string }
  ) {
    try {
      const payout = await stripe.payouts.create(
        {
          amount,
          currency: 'usd',
          metadata,
        },
        {
          stripeAccount: accountId,
        }
      );
      return payout;
    } catch (error) {
      console.error('Error creating payout:', error);
      throw error;
    }
  },

  /**
   * Get exchange rate (INR to USD)
   * In production, you might want to use a real-time exchange rate API
   */
  async getExchangeRate(): Promise<number> {
    // Using a default rate - in production, integrate with a forex API
    // like Open Exchange Rates, Fixer.io, or use Stripe's conversion
    const defaultRate = 83; // 1 USD = 83 INR (approximate)
    return defaultRate;
  },

  /**
   * Convert INR to USD
   */
  convertINRtoUSD(amountINR: number, exchangeRate: number): number {
    return Number((amountINR / exchangeRate).toFixed(2));
  },

  /**
   * Convert USD to cents for Stripe
   */
  usdToCents(amountUSD: number): number {
    return Math.round(amountUSD * 100);
  },

  /**
   * Get balance of connected account
   */
  async getConnectedAccountBalance(accountId: string) {
    try {
      const balance = await stripe.balance.retrieve({
        stripeAccount: accountId,
      });
      return balance;
    } catch (error) {
      console.error('Error retrieving balance:', error);
      throw error;
    }
  },

  /**
   * Create a login link for connected account dashboard
   */
  async createLoginLink(accountId: string) {
    try {
      const loginLink = await stripe.accounts.createLoginLink(accountId);
      return loginLink;
    } catch (error) {
      console.error('Error creating login link:', error);
      throw error;
    }
  },
};

export default stripeService;
