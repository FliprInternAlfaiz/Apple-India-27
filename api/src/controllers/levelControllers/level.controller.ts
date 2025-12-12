import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";
import { processReferralCommissions } from "../authControllers/referral.controller";

const { JsonResponse } = commonsUtils;

// ==================== USER ENDPOINTS ====================

// Get all levels with user progress (USER)
export const getAllLevels = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const levels = await models.level
      .find({ isActive: true })
      .sort({ order: 1, levelNumber: 1 })
      .lean();

    let userCurrentLevel = null;
    let userTaskStats = null;

    if (userId) {
      const user = await models.User.findById(userId).select(
        "currentLevel currentLevelNumber investmentAmount todayTasksCompleted mainWallet"
      );

      if (user) {
        userCurrentLevel = {
          currentLevel: user.currentLevel,
          currentLevelNumber: user.currentLevelNumber,
          investmentAmount: user.investmentAmount || 0,
          todayTasksCompleted: user.todayTasksCompleted || 0,
          mainWallet: user.mainWallet || 0,
          hasLevel: user.currentLevel !== null && user.currentLevel !== undefined,
        };

        if (userCurrentLevel.hasLevel) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const completedToday = await models.taskCompletion.countDocuments({
            userId,
            completedAt: { $gte: today },
          });

          userTaskStats = {
            completedToday,
          };
        }
      }
    }

    const formattedLevels = levels.map((level) => {
      const isUserLevel = userCurrentLevel?.currentLevelNumber === level.levelNumber;
      const tasksCompleted = isUserLevel ? (userTaskStats?.completedToday || 0) : 0;
      const tasksRemaining = level.dailyTaskLimit - tasksCompleted;

      const canPurchase = userCurrentLevel
        ? !userCurrentLevel.hasLevel
          ? level.levelNumber === 0 && userCurrentLevel.mainWallet >= level.investmentAmount
          : level.levelNumber === userCurrentLevel.currentLevelNumber + 1 && 
            userCurrentLevel.mainWallet >= level.investmentAmount
        : false;

      return {
        level: level.levelName,
        levelNumber: level.levelNumber,
        remaining: Math.max(0, tasksRemaining),
        completed: tasksCompleted,
        target: level.investmentAmount,
        purchasePrice: level.investmentAmount,
        dailyTasks: `${Math.floor(level.dailyTaskLimit * 0.5)}-${level.dailyTaskLimit}`,
        commission: `₹${level.rewardPerTask * Math.floor(level.dailyTaskLimit * 0.5)}-₹${level.rewardPerTask * level.dailyTaskLimit}`,
        rewardPerTask: level.rewardPerTask,
        dailyTaskLimit: level.dailyTaskLimit,
        icon: level.icon,
        description: level.description,
        isUnlocked: userCurrentLevel 
          ? userCurrentLevel.hasLevel 
            ? level.levelNumber <= userCurrentLevel.currentLevelNumber
            : false
          : false,
        isCurrent: isUserLevel,
        canPurchase,
        invitations: [
          {
            method: "Invite A-level to join",
            rate: `${level.aLevelCommissionRate}%`,
            amount: ((level.investmentAmount * level.aLevelCommissionRate) / 100).toFixed(2),
          },
          {
            method: "Invite B-level to join",
            rate: `${level.bLevelCommissionRate}%`,
            amount: ((level.investmentAmount * level.bLevelCommissionRate) / 100).toFixed(2),
          },
          {
            method: "Invite C-level to join",
            rate: `${level.cLevelCommissionRate}%`,
            amount: ((level.investmentAmount * level.cLevelCommissionRate) / 100).toFixed(2),
          },
        ],
      };
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Levels",
      message: "Levels retrieved successfully.",
      data: {
        levels: formattedLevels,
        userLevel: userCurrentLevel,
        requiresLevelPurchase: userCurrentLevel ? !userCurrentLevel.hasLevel : true,
      },
    });
  } catch (error) {
    console.error("Error fetching levels:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching levels.",
      title: "Levels",
    });
  }
};

// Upgrade user level (USER)
export const upgradeUserLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const newLevelNumber = Number(req.body.newLevelNumber);

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "User not authenticated.",
        title: "Purchase Level",
      });
    }

    const user = await models.User.findById(userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Purchase Level",
      });
    }

    const targetLevel = await models.level.findOne({
      levelNumber: newLevelNumber,
      isActive: true,
    });

    if (!targetLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: `Target level ${newLevelNumber} not found.`,
        title: "Purchase Level",
      });
    }

    if (user.mainWallet < targetLevel.investmentAmount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Insufficient balance. Required: ₹${targetLevel.investmentAmount}, Available: ₹${user.mainWallet}`,
        title: "Purchase Level",
      });
    }

    const isFirstLevelPurchase = user.currentLevelNumber === -1 || user.currentLevelNumber === null;

    user.mainWallet -= targetLevel.investmentAmount;
    user.investmentAmount = (user.investmentAmount || 0) + targetLevel.investmentAmount;
    user.currentLevel = targetLevel.levelName;
    user.currentLevelNumber = targetLevel.levelNumber;
    user.levelName = targetLevel.levelName;
    user.userLevel = targetLevel.levelNumber;
    user.levelUpgradedAt = new Date();
    user.todayTasksCompleted = 0;

    await user.save();

    if (isFirstLevelPurchase) {
      console.log(`🎯 First level purchase detected for user: ${userId}`);
      try {
        const commissionResult = await processReferralCommissions(userId, targetLevel);
        console.log(`✅ Referral commission processing result:`, commissionResult);
      } catch (error) {
        console.error(`❌ Error processing referral commissions:`, error);
      }
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Purchase Level",
      message: `Successfully purchased ${targetLevel.levelName}! Start watching videos to earn ₹${targetLevel.rewardPerTask} per task.`,
      data: {
        newLevel: targetLevel.levelName,
        levelNumber: targetLevel.levelNumber,
        investmentAmount: targetLevel.investmentAmount,
        rewardPerTask: targetLevel.rewardPerTask,
        dailyTaskLimit: targetLevel.dailyTaskLimit,
        maxDailyEarning: targetLevel.rewardPerTask * targetLevel.dailyTaskLimit,
        remainingBalance: user.mainWallet,
        totalInvestment: user.investmentAmount,
      },
    });
  } catch (error) {
    console.error("Error purchasing level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while purchasing level.",
      title: "Purchase Level",
    });
  }
};

// Get level by name (USER)
export const getLevelByName = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelName } = req.params;

    const level = await models.level.findOne({
      levelName,
      isActive: true,
    });

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Get Level",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Get Level",
      message: "Level retrieved successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error fetching level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching the level.",
      title: "Get Level",
    });
  }
};

// Get level by number (USER)
export const getLevelByNumber = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelNumber } = req.params;

    const level = await models.level.findOne({
      levelNumber: Number(levelNumber),
      isActive: true,
    });

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Get Level",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Get Level",
      message: "Level retrieved successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error fetching level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching the level.",
      title: "Get Level",
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

// Get all levels for admin with pagination and statistics (ADMIN)
export const getAllLevelsAdmin = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive = ""
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { levelName: { $regex: search, $options: "i" } },
        { levelNumber: isNaN(Number(search)) ? undefined : Number(search) }
      ].filter(Boolean);
    }

    if (isActive !== "" && isActive !== "all") {
      filter.isActive = isActive === "true";
    }

    // Fetch levels
    const [levels, totalCount] = await Promise.all([
      models.level.find(filter)
        .sort({ order: 1, levelNumber: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.level.countDocuments(filter)
    ]);

    // Get statistics
    const stats = await models.level.aggregate([
      {
        $group: {
          _id: null,
          totalLevels: { $sum: 1 },
          activeLevels: {
            $sum: { $cond: ["$isActive", 1, 0] }
          },
          totalInvestment: { $sum: "$investmentAmount" }
        }
      }
    ]);

    // Get user count per level
    const userStats = await models.User.aggregate([
      {
        $group: {
          _id: "$currentLevelNumber",
          count: { $sum: 1 }
        }
      }
    ]);

    // Merge user counts with levels
    const levelsWithUserCount = levels.map((level: any) => {
      const userStat = userStats.find((s: any) => s._id === level.levelNumber);
      return {
        ...level,
        userCount: userStat?.count || 0
      };
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Levels Retrieved",
      message: "Levels fetched successfully.",
      data: {
        levels: levelsWithUserCount,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        },
        statistics: {
          ...stats[0],
          totalUsers: userStats.reduce((acc: number, curr: any) => acc + curr.count, 0)
        }
      }
    });
  } catch (err) {
    console.error("💥 Get all levels error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch levels.",
    });
  }
};

// Create new level (ADMIN)
export const createLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      levelNumber,
      levelName,
      investmentAmount,
      rewardPerTask,
      dailyTaskLimit,
      aLevelCommissionRate,
      bLevelCommissionRate,
      cLevelCommissionRate,
      icon,
      description,
      order,
    } = req.body;

    // Validation
    if (levelNumber === undefined || !levelName || rewardPerTask === undefined || !dailyTaskLimit) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level number, name, reward per task, and daily task limit are required.",
        title: "Create Level",
      });
    }

    // Check if level already exists
    const existingLevel = await models.level.findOne({
      $or: [{ levelNumber }, { levelName }],
    });

    if (existingLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level with this number or name already exists.",
        title: "Create Level",
      });
    }

    const level = await models.level.create({
      levelNumber,
      levelName,
      investmentAmount: investmentAmount || 0,
      rewardPerTask,
      dailyTaskLimit,
      aLevelCommissionRate: aLevelCommissionRate || 0,
      bLevelCommissionRate: bLevelCommissionRate || 0,
      cLevelCommissionRate: cLevelCommissionRate || 0,
      icon: icon || '🍎',
      description: description || '',
      order: order !== undefined ? order : levelNumber,
      isActive: true,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Create Level",
      message: "Level created successfully.",
      data: { level },
    });
  } catch (error: any) {
    console.error("Error creating level:", error);

    if (error.code === 11000) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Level with this number or name already exists.",
        title: "Create Level",
      });
    }

    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating the level.",
      title: "Create Level",
    });
  }
};

// Update level (ADMIN)
export const updateLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid level ID.",
        title: "Update Level",
      });
    }

    const level = await models.level.findById(levelId);

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Update Level",
      });
    }

    const allowedUpdates = [
      "investmentAmount",
      "rewardPerTask",
      "dailyTaskLimit",
      "aLevelCommissionRate",
      "bLevelCommissionRate",
      "cLevelCommissionRate",
      "icon",
      "description",
      "order",
      "isActive",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (level as any)[field] = req.body[field];
      }
    });

    await level.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Update Level",
      message: "Level updated successfully.",
      data: { level },
    });
  } catch (error) {
    console.error("Error updating level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while updating the level.",
      title: "Update Level",
    });
  }
};

// Delete level (ADMIN)
export const deleteLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { levelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(levelId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid level ID.",
        title: "Delete Level",
      });
    }

    const level = await models.level.findById(levelId);

    if (!level) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level not found.",
        title: "Delete Level",
      });
    }

    // Check if any users are using this level
    const usersCount = await models.User.countDocuments({
      currentLevelNumber: level.levelNumber
    });

    if (usersCount > 0) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Cannot delete level. ${usersCount} users are currently using this level.`,
        title: "Delete Level",
      });
    }

    await models.level.findByIdAndDelete(levelId);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Delete Level",
      message: "Level deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting level:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while deleting the level.",
      title: "Delete Level",
    });
  }
};

export default {
  // User endpoints
  getAllLevels,
  getLevelByName,
  getLevelByNumber,
  upgradeUserLevel,
  
  // Admin endpoints
  getAllLevelsAdmin,
  createLevel,
  updateLevel,
  deleteLevel,
};