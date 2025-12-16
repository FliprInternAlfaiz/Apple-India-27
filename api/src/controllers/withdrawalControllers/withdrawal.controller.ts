// controllers/withdrawalControllers/withdrawal.controller.ts
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import fs from 'fs';
import path from 'path';

const { JsonResponse } = commonsUtils;

// Get user's bank accounts
export const getBankAccounts = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const accounts = await models.bankAccount
      .find({ userId, isActive: true })
      .select("-__v")
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Bank Accounts",
      message: "Bank accounts retrieved successfully.",
      data: { accounts },
    });
  } catch (error) {
    console.error("Error fetching bank accounts:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching bank accounts.",
      title: "Bank Accounts",
    });
  }
};

// Add bank account
export const addBankAccount = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const {
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode,
      branchName,
      accountType,
      isDefault,
    } = req.body;

    // Check if user already has 4 accounts
    const accountCount = await models.bankAccount.countDocuments({
      userId,
      isActive: true,
    });

    if (accountCount >= 4) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Maximum 4 bank accounts allowed.",
        title: "Bank Account",
      });
    }

    // Check if account already exists
    const existingAccount = await models.bankAccount.findOne({
      userId,
      accountNumber,
      isActive: true,
    });

    if (existingAccount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This account is already added.",
        title: "Bank Account",
      });
    }

    // If this is set as default, remove default from other accounts
    if (isDefault) {
      await models.bankAccount.updateMany(
        { userId, isActive: true },
        { $set: { isDefault: false } }
      );
    }

    // Create new bank account
    const newAccount = await models.bankAccount.create({
      userId,
      accountHolderName,
      bankName,
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      branchName,
      accountType: accountType || "savings",
      isDefault: isDefault || accountCount === 0,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Bank Account",
      message: "Bank account added successfully.",
      data: { account: newAccount },
    });
  } catch (error) {
    console.error("Error adding bank account:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while adding bank account.",
      title: "Bank Account",
    });
  }
};

export const addQRCode = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { qrName, upiId, isDefault } = req.body;

    if (!req.file) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "QR code image is required.",
        title: "QR Code",
      });
    }

    // Check if user already has 4 QR codes
    const qrCount = await models.bankAccount.countDocuments({
      userId,
      isActive: true,
      accountType: 'qr',
    });

    if (qrCount >= 4) {
      // Delete uploaded file if limit exceeded
      fs.unlinkSync(req.file.path);
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Maximum 4 QR codes allowed.",
        title: "QR Code",
      });
    }

    // If this is set as default, remove default from other accounts
    if (isDefault) {
      await models.bankAccount.updateMany(
        { userId, isActive: true },
        { $set: { isDefault: false } }
      );
    }

    // Create QR code entry
    const qrCodePath = req.file.path.replace(/\\/g, '/');
    const newQRCode = await models.bankAccount.create({
      userId,
      accountHolderName: qrName,
      bankName: upiId || 'UPI',
      accountNumber: 'QR_' + Date.now(),
      ifscCode: 'QR',
      accountType: 'qr',
      qrCodeImage: qrCodePath,
      isDefault: isDefault || qrCount === 0,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "QR Code",
      message: "QR code added successfully.",
      data: { qrCode: newQRCode },
    });
  } catch (error) {
    console.error("Error adding QR code:", error);
    // Delete uploaded file on error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while adding QR code.",
      title: "QR Code",
    });
  }
};

// Delete bank account or QR code
export const deleteBankAccount = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { accountId } = req.params;

    const account = await models.bankAccount.findOne({
      _id: accountId,
      userId,
      isActive: true,
    });

    if (!account) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Account not found.",
        title: "Bank Account",
      });
    }

    // Delete QR image file if it's a QR code
    if (account.accountType === 'qr' && account.qrCodeImage) {
      try {
        if (fs.existsSync(account.qrCodeImage)) {
          fs.unlinkSync(account.qrCodeImage);
        }
      } catch (err) {
        console.error('Error deleting QR image:', err);
      }
    }

    // Soft delete
    account.isActive = false;
    await account.save();

    // If deleted account was default, set another as default
    if (account.isDefault) {
      const nextAccount = await models.bankAccount.findOne({
        userId,
        isActive: true,
      });
      if (nextAccount) {
        nextAccount.isDefault = true;
        await nextAccount.save();
      }
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Account",
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while deleting account.",
      title: "Account",
    });
  }
};

// Set default account
export const setDefaultAccount = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { accountId } = req.params;

    const account = await models.bankAccount.findOne({
      _id: accountId,
      userId,
      isActive: true,
    });

    if (!account) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Account not found.",
        title: "Account",
      });
    }

    // Remove default from all accounts
    await models.bankAccount.updateMany(
      { userId, isActive: true },
      { $set: { isDefault: false } }
    );

    // Set this as default
    account.isDefault = true;
    await account.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Account",
      message: "Default account updated successfully.",
      data: { account },
    });
  } catch (error) {
    console.error("Error setting default account:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while setting default account.",
      title: "Account",
    });
  }
};

// Get wallet info
export const getWalletInfo = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const user = await models.User
      .findById(userId)
      .select("mainWallet commissionWallet totalWithdrawals");

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Wallet",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Wallet",
      message: "Wallet info retrieved successfully.",
      data: {
        mainWallet: user.mainWallet,
        commissionWallet: user.commissionWallet,
        totalWithdrawals: user.totalWithdrawals,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching wallet info.",
      title: "Wallet",
    });
  }
};

export const createWithdrawal = async (req: Request, res: Response, __: NextFunction) => {
  try {
    const userId = res.locals.userId;
    const { walletType, amount, bankAccountId, withdrawalPassword } = req.body;

    if (isNaN(amount) || amount < 280) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Minimum withdrawal amount is Rs 280.",
        title: "Withdrawal",
      });
    }

    const user = await models.User.findById(userId)
      .select("+withdrawalPassword mainWallet commissionWallet totalWithdrawals");

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Withdrawal",
      });
    }

    user.mainWallet = Number(user.mainWallet) || 0;
    user.commissionWallet = Number(user.commissionWallet) || 0;
    user.totalWithdrawals = Number(user.totalWithdrawals) || 0;

    if (user.withdrawalPassword) {
      const isPasswordValid = await bcrypt.compare(withdrawalPassword, user.withdrawalPassword);
      if (!isPasswordValid) {
        return JsonResponse(res, {
          status: "error",
          statusCode: 401,
          message: "Invalid withdrawal password.",
          title: "Withdrawal",
        });
      }
    }

    const walletBalance = walletType === "mainWallet" ? user.mainWallet : user.commissionWallet;
    if (walletBalance < amount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Insufficient wallet balance.",
        title: "Withdrawal",
      });
    }

    const bankAccount = await models.bankAccount.findOne({
      _id: bankAccountId,
      userId,
      isActive: true,
    });

    if (!bankAccount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Account not found.",
        title: "Withdrawal",
      });
    }

    if (walletType === "mainWallet") {
      user.mainWallet -= amount;
    } else {
      user.commissionWallet -= amount;
    }

    user.totalWithdrawals += amount;
    await user.save();

    const withdrawal = await models.withdrawal.create({
      userId,
      walletType,
      amount,
      bankAccountId,
      ifscCode: bankAccount.ifscCode,
      accountNumber: bankAccount.accountNumber,
      accountHolderName: bankAccount.accountHolderName,
      bankName: bankAccount.bankName,
      accountType: bankAccount.accountType,
      qrCodeImage: bankAccount.qrCodeImage || null,
      status: "pending",
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Withdrawal",
      message: "Withdrawal request created successfully.",
      data: { withdrawal },
    });

  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating withdrawal request.",
      title: "Withdrawal",
    });
  }
};

export const getWithdrawalHistory = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const withdrawals = await models.withdrawal
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v")
      .lean();

    const totalWithdrawals = await models.withdrawal.countDocuments(query);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal History",
      message: "Withdrawal history retrieved successfully.",
      data: {
        withdrawals,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalWithdrawals / Number(limit)),
          totalWithdrawals,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawal history:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching withdrawal history.",
      title: "Withdrawal History",
    });
  }
};

export const setWithdrawalPassword = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await models.User
      .findById(userId)
      .select("+withdrawalPassword");

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Withdrawal Password",
      });
    }

    if (user.withdrawalPassword && currentPassword) {
      const isValid = await bcrypt.compare(
        currentPassword,
        user.withdrawalPassword
      );
      if (!isValid) {
        return JsonResponse(res, {
          status: "error",
          statusCode: 401,
          message: "Current password is incorrect.",
          title: "Withdrawal Password",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.withdrawalPassword = hashedPassword;
    await user.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal Password",
      message: "Withdrawal password set successfully.",
    });
  } catch (error) {
    console.error("Error setting withdrawal password:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while setting withdrawal password.",
      title: "Withdrawal Password",
    });
  }
};

const getAllWithdrawals = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      walletType = ""
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (walletType && walletType !== "all") {
      filter.walletType = walletType;
    }

    let userIds: any[] = [];
    if (search) {
      const users = await models.User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select('_id');

      userIds = users.map(u => u._id);
      filter.userId = { $in: userIds };
    }

    const [withdrawals, totalCount] = await Promise.all([
      models.withdrawal.find(filter)
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.withdrawal.countDocuments(filter)
    ]);

    const stats = await models.withdrawal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const statistics = {
      totalAmount: stats.reduce((acc, curr) => acc + curr.totalAmount, 0),
      pendingCount: stats.find(s => s._id === 'pending')?.count || 0,
      completedCount: stats.find(s => s._id === 'completed')?.count || 0,
      rejectedCount: stats.find(s => s._id === 'rejected')?.count || 0
    };

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawals Retrieved",
      message: "Withdrawals fetched successfully.",
      data: {
        withdrawals,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        },
        statistics
      }
    });
  } catch (err) {
    console.error("💥 Get all withdrawals error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch withdrawals.",
    });
  }
};

const getWithdrawalStatistics = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const stats = await models.withdrawal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const statistics = {
      totalAmount: stats.reduce((acc, curr) => acc + curr.totalAmount, 0),
      pendingCount: stats.find(s => s._id === 'pending')?.count || 0,
      completedCount: stats.find(s => s._id === 'completed')?.count || 0,
      rejectedCount: stats.find(s => s._id === 'rejected')?.count || 0
    };

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Statistics",
      message: "Statistics retrieved successfully.",
      data: statistics
    });
  } catch (err) {
    console.error("💥 Get withdrawal statistics error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch statistics.",
    });
  }
};

const approveWithdrawal = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionId, remarks } = req.body;

    const withdrawal = await models.withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Withdrawal not found.",
        title: "Withdrawal",
      });
    }

    if (withdrawal.status !== "pending") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This withdrawal has already been processed.",
        title: "Withdrawal",
      });
    }

    withdrawal.status = "completed";
    withdrawal.transactionId = transactionId;
    withdrawal.remarks = remarks;
    await withdrawal.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal",
      message: "Withdrawal approved successfully.",
      data: { withdrawal },
    });
  } catch (error) {
    console.error("Error approving withdrawal:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while approving withdrawal.",
      title: "Withdrawal",
    });
  }
};

const rejectWithdrawal = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { withdrawalId } = req.params;
    const { remarks } = req.body;

    const withdrawal = await models.withdrawal.findById(withdrawalId);

    if (!withdrawal) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Withdrawal not found.",
        title: "Withdrawal",
      });
    }

    if (withdrawal.status !== "pending") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This withdrawal has already been processed.",
        title: "Withdrawal",
      });
    }

    const user = await models.User.findById(withdrawal.userId);
    if (user) {
      if (withdrawal.walletType === "mainWallet") {
        user.mainWallet += withdrawal.amount;
      } else {
        user.commissionWallet += withdrawal.amount;
      }
      user.totalWithdrawals -= withdrawal.amount;
      await user.save();
    }

    withdrawal.status = "rejected";
    withdrawal.remarks = remarks;
    await withdrawal.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal",
      message: "Withdrawal rejected and amount refunded.",
      data: { withdrawal },
    });
  } catch (error) {
    console.error("Error rejecting withdrawal:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while rejecting withdrawal.",
      title: "Withdrawal",
    });
  }
};

// Helper function to convert time string (HH:MM) to minutes since midnight
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const checkWithdrawalAvailability = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Withdrawal",
      });
    }

    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;

    const config = await models.withdrawalConfig.findOne({ dayOfWeek });

    if (!config || !config.isActive) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: "Withdrawals are not allowed today.",
        title: "Withdrawal",
        data: {
          canWithdraw: false,
          reason: "Day not active",
          dayOfWeek,
        },
      });
    }

    const userLevel = user.currentLevelNumber;
    if (!config.allowedLevels.includes(userLevel)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: `Apple Level ${userLevel} cannot withdraw today. Please check your withdrawal schedule.`,
        title: "Withdrawal",
        data: {
          canWithdraw: false,
          reason: "Level not allowed",
          userLevel,
          allowedLevels: config.allowedLevels,
        },
      });
    }

    // Convert times to minutes for proper comparison
    const currentMinutes = timeToMinutes(currentTime);
    const startMinutes = timeToMinutes(config.startTime);
    const endMinutes = timeToMinutes(config.endTime);

    if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: `Withdrawals are only allowed between ${config.startTime} and ${config.endTime}.`,
        title: "Withdrawal",
        data: {
          canWithdraw: false,
          reason: "Outside time range",
          startTime: config.startTime,
          endTime: config.endTime,
          currentTime,
        },
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal",
      message: "You can make a withdrawal now.",
      data: {
        canWithdraw: true,
        startTime: config.startTime,
        endTime: config.endTime,
        currentTime,
      },
    });
  } catch (error) {
    console.error("Error checking withdrawal availability:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to check withdrawal availability.",
      title: "Withdrawal",
    });
  }
};

export const getWithdrawalSchedule = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Withdrawal Schedule",
      });
    }

    const userLevel = user.currentLevelNumber;
    const configs = await models.withdrawalConfig.find().sort({ dayOfWeek: 1 }).lean();

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const schedule = configs.map((config: any) => ({
      day: dayNames[config.dayOfWeek],
      dayOfWeek: config.dayOfWeek,
      isActive: config.isActive,
      canWithdraw: config.isActive && config.allowedLevels.includes(userLevel),
      startTime: config.startTime,
      endTime: config.endTime,
      allowedLevels: config.allowedLevels,
    }));

    const today = new Date().getDay();
    const todaySchedule = schedule.find(s => s.dayOfWeek === today);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Withdrawal Schedule",
      message: "Schedule retrieved successfully.",
      data: {
        userLevel,
        schedule,
        today: todaySchedule,
      },
    });
  } catch (error) {
    console.error("Error fetching withdrawal schedule:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to fetch withdrawal schedule.",
      title: "Withdrawal Schedule",
    });
  }
};

export default {
  getBankAccounts,
  addBankAccount,
  addQRCode,
  deleteBankAccount,
  setDefaultAccount,
  getWalletInfo,
  createWithdrawal,
  getWithdrawalHistory,
  setWithdrawalPassword,
  checkWithdrawalAvailability,
  getWithdrawalSchedule,
  getAllWithdrawals,
  getWithdrawalStatistics,
  approveWithdrawal,
  rejectWithdrawal,
};