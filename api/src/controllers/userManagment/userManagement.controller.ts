import bcrypt from 'bcrypt';
import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';
import { IUser } from '../../interface/user.interface';

const { JsonResponse } = commonsUtils;



interface AddWalletAmountBody {
  walletType: 'mainWallet' | 'commissionWallet';
  amount: number;
  currency?: 'INR' | 'USDT';
}

interface DeductWalletAmountBody {
  walletType: 'mainWallet' | 'commissionWallet';
  amount: number;
  reason?: string;
  currency?: 'INR' | 'USDT';
}

const toggleUsdtStatus = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { isUsdtEnabled } = req.body;

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Toggle USDT',
      });
    }

    user.isUsdtEnabled = isUsdtEnabled;
    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'USDT Status Updated',
      message: `User USDT wallet ${isUsdtEnabled ? 'enabled' : 'disabled'} successfully.`,
      data: { user },
    });
  } catch (err) {
    console.error('💥 Toggle USDT status error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update USDT status.',
    });
  }
};

const getAllUsers = async (req: Request, res: Response, __: NextFunction) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      verificationStatus = 'all',
      userLevel = 'all',
      teamLevel = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Verification filter
    if (verificationStatus !== 'all') {
      filter.isVerified = verificationStatus === 'verified';
    }

    // User level filter
    if (userLevel !== 'all') {
      filter.currentLevel = userLevel;
    }

    // Team level filter
    if (teamLevel !== 'all') {
      filter.teamLevel = teamLevel;
    }

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [users, totalCount] = await Promise.all([
      models.User.find(filter)
        .select('-password -withdrawalPassword +plainPassword')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.User.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await models.User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: ['$isVerified', 1, 0] },
          },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
          totalWalletBalance: { $sum: '$mainWallet' },
          totalCommissions: { $sum: '$commissionWallet' },
        },
      },
    ]);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Users Retrieved',
      message: 'Users fetched successfully.',
      data: {
        users,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
        statistics: stats[0] || {
          totalUsers: 0,
          verifiedUsers: 0,
          activeUsers: 0,
          totalWalletBalance: 0,
          totalCommissions: 0,
        },
      },
    });
  } catch (err) {
    console.error('💥 Get all users error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to fetch users.',
    });
  }
};

/**
 * Get single user details
 */
const getUserById = async (req: Request, res: Response, __: NextFunction) => {
  try {
    const { userId } = req.params;

    const user = await models.User.findById(userId)
      .select('-password -withdrawalPassword')
      .populate('referredBy', 'name phone')
      .lean();

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'User Details',
      });
    }

    // Get user's referrals
    const referrals = await models.User.find({ referredBy: userId })
      .select('name phone userLevel isVerified createdAt')
      .lean();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'User Details',
      message: 'User details fetched successfully.',
      data: {
        user,
        referrals,
      },
    });
  } catch (err) {
    console.error('💥 Get user by ID error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to fetch user details.',
    });
  }
};

/**
 * Reset user password
 */
const resetUserPassword = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Password must be at least 6 characters long.',
        title: 'Password Reset',
      });
    }

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Password Reset',
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.plainPassword = newPassword;
    await user.save();

    // Optional: Log password reset action
    // await models.AdminLog.create({
    //   adminId: req.admin._id,
    //   action: "PASSWORD_RESET",
    //   targetUserId: userId,
    //   timestamp: new Date()
    // });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Password Reset',
      message: `Password reset successfully for user ${user.name}.`,
    });
  } catch (err) {
    console.error('💥 Reset password error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to reset password.',
    });
  }
};

/**
 * Update user verification status
 */
const updateUserVerification = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { isVerified } = req.body;

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Update Verification',
      });
    }

    user.isVerified = isVerified;
    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Verification Updated',
      message: `User verification status updated successfully.`,
      data: { user },
    });
  } catch (err) {
    console.error('💥 Update verification error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update verification status.',
    });
  }
};

/**
 * Update Aadhaar verification status
 */
const updateAadhaarVerification = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid status. Must be approved, rejected, or pending.',
        title: 'Aadhaar Verification',
      });
    }

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Aadhaar Verification',
      });
    }

    user.aadhaarVerificationStatus = status;

    if (status === 'approved') {
      user.aadhaarVerifiedAt = new Date();
      user.aadhaarRejectionReason = null;
    } else if (status === 'rejected') {
      user.aadhaarRejectionReason =
        rejectionReason || 'Document verification failed';
    }

    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Aadhaar Verification',
      message: `Aadhaar verification status updated to ${status}.`,
      data: { user },
    });
  } catch (err) {
    console.error('💥 Update Aadhaar verification error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update Aadhaar verification.',
    });
  }
};

/**
 * Update user active status
 */
const toggleUserStatus = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Toggle Status',
      });
    }

    user.isActive = isActive;
    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Status Updated',
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { user },
    });
  } catch (err) {
    console.error('💥 Toggle user status error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update user status.',
    });
  }
};

/**
 * Update user level
 */
const updateUserLevel = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { userLevel, currentLevel, levelName } = req.body;

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Update Level',
      });
    }

    user.userLevel = userLevel;
    user.currentLevel = currentLevel;
    user.levelName = levelName;
    user.levelUpgradedAt = new Date();
    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Level Updated',
      message: `User level updated successfully to ${levelName}.`,
      data: { user },
    });
  } catch (err) {
    console.error('💥 Update user level error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update user level.',
    });
  }
};

const addWalletAmount = async (
  req: Request<{ userId: string }, {}, AddWalletAmountBody>,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { walletType, amount, currency = 'INR' } = req.body;

    if (
      !walletType ||
      !['mainWallet', 'commissionWallet'].includes(walletType)
    ) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid wallet type. Must be mainWallet or commissionWallet.',
        title: 'Add Wallet Amount',
      });
    }

    if (!amount || Number(amount) <= 0) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Amount must be greater than 0.',
        title: 'Add Wallet Amount',
      });
    }

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Add Wallet Amount',
      });
    }

    const key = currency === 'USDT' 
      ? (walletType === 'mainWallet' ? 'mainWalletUsdt' : 'commissionWalletUsdt')
      : walletType;

    const previousBalance = Number((user as any)[key] ?? 0);
    const newBalance = previousBalance + Number(amount);
    (user as any)[key] = newBalance;

    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Amount Added',
      message: `${currency === 'USDT' ? '$' : '₹'}${amount} added successfully to ${
        walletType === 'mainWallet' ? 'Main Wallet' : 'Commission Wallet'
      }${currency === 'USDT' ? ' (USDT)' : ''}.`,
      data: {
        userId: user._id,
        walletType,
        amountAdded: Number(amount),
        previousBalance,
        newBalance,
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('💥 Add wallet amount error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to add amount to wallet.',
    });
  }
};

const deductWalletAmount = async (
  req: Request<{ userId: string }, {}, DeductWalletAmountBody>,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { userId } = req.params;
    const { walletType, amount, reason, currency = 'INR' } = req.body;

    if (
      !walletType ||
      !['mainWallet', 'commissionWallet'].includes(walletType)
    ) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid wallet type. Must be mainWallet or commissionWallet.',
        title: 'Deduct Wallet Amount',
      });
    }

    if (!amount || Number(amount) <= 0) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Amount must be greater than 0.',
        title: 'Deduct Wallet Amount',
      });
    }

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'User not found.',
        title: 'Deduct Wallet Amount',
      });
    }

    const key = currency === 'USDT' 
      ? (walletType === 'mainWallet' ? 'mainWalletUsdt' : 'commissionWalletUsdt')
      : walletType;
      
    const previousBalance = Number((user as any)[key] ?? 0);

    // Check if user has sufficient balance
    if (previousBalance < Number(amount)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: `Insufficient balance. Current balance: ${currency === 'USDT' ? '$' : '₹'}${previousBalance}`,
        title: 'Deduct Wallet Amount',
      });
    }

    const newBalance = previousBalance - Number(amount);
    (user as any)[key] = newBalance;

    await user.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Amount Deducted',
      message: `${currency === 'USDT' ? '$' : '₹'}${amount} deducted successfully from ${
        walletType === 'mainWallet' ? 'Main Wallet' : 'Commission Wallet'
      }${currency === 'USDT' ? ' (USDT)' : ''}.`,
      data: {
        userId: user._id,
        walletType,
        amountDeducted: Number(amount),
        previousBalance,
        newBalance,
        reason: reason || 'Admin deduction',
        updatedAt: new Date(),
      },
    });
  } catch (err) {
    console.error('💥 Deduct wallet amount error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to deduct amount from wallet.',
    });
  }
};


export default {
  updateAadhaarVerification,
  updateUserLevel,
  toggleUserStatus,
  updateUserVerification,
  resetUserPassword,
  getAllUsers,
  getUserById,
  addWalletAmount,
  deductWalletAmount,
  toggleUsdtStatus
};
