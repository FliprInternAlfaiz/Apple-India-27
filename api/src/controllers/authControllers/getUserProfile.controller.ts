// routes/user/profile.ts
import { Request, Response } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    
    const user = await models.User.findById(userId).select("-password");
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        title: "Not Found",
        message: "User not found",
      });
    }

    // Reset daily income if it's a new day
    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(user.lastIncomeResetDate).setHours(0, 0, 0, 0);
    
    if (today > lastReset) {
      user.todayIncome = 0;
      user.todayTasksCompleted = 0;
      user.lastIncomeResetDate = new Date();
      await user.save();
    }

    // Reset monthly income if it's a new month
    const currentMonth = new Date().getMonth();
    const lastMonthReset = new Date(user.lastMonthlyResetDate).getMonth();
    
    if (currentMonth !== lastMonthReset) {
      user.monthlyIncome = 0;
      user.lastMonthlyResetDate = new Date();
      await user.save();
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Profile Retrieved",
      message: "User profile fetched successfully",
      data: {
        user,
        stats: {
          todayIncome: user.todayIncome,
          monthlyIncome: user.monthlyIncome,
          totalRevenue: user.totalRevenue,
          totalWithdrawals: user.totalWithdrawals,
          mainWallet: user.mainWallet,
          commissionWallet: user.commissionWallet,
          profit: user.totalProfit,
        },
      },
    });
  } catch (err) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch profile",
    });
  }
};