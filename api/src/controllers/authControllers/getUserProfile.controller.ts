import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import { jwtConfig } from "../../services";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.userAuth;
    if (!token) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "No token provided",
      });
    }

    const decoded = jwtConfig.jwtService.verifyJWT(token);
    if (!decoded?.id) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "Invalid token",
      });
    }

    const user = await models.User.findById(decoded.id).select("-password");
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        title: "Not Found",
        message: "User not found",
      });
    }

    res.locals.userId = user._id;

   const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(user.lastIncomeResetDate).setHours(0, 0, 0, 0);
    
    if (today > lastReset) {
      user.todayIncome = 0;
      user.todayTasksCompleted = 0;
      user.lastIncomeResetDate = new Date();
      await user.save();
    }

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
