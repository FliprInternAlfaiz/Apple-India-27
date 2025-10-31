// controllers/level.controller.ts - UPDATED
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";

const { JsonResponse } = commonsUtils;

// Get all levels with user progress
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
          currentLevel: user.currentLevel || "Apple1",
          currentLevelNumber: user.currentLevelNumber || 1,
          investmentAmount: user.investmentAmount || 0,
          todayTasksCompleted: user.todayTasksCompleted || 0,
          mainWallet: user.mainWallet || 0,
        };

        // Get tasks completed for current level
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

    // Format levels for frontend
    const formattedLevels = levels.map((level) => {
      const isUserLevel = userCurrentLevel?.currentLevelNumber === level.levelNumber;
      const tasksCompleted = isUserLevel ? (userTaskStats?.completedToday || 0) : 0;
      const tasksRemaining = level.dailyTaskLimit - tasksCompleted;

      return {
        level: level.levelName,
        levelNumber: level.levelNumber,
        remaining: Math.max(0, tasksRemaining),
        completed: tasksCompleted,
        target: level.investmentAmount,
        dailyTasks: `${Math.floor(level.dailyTaskLimit * 0.5)}-${level.dailyTaskLimit}`,
        commission: `${level.rewardPerTask * Math.floor(level.dailyTaskLimit * 0.5)}-${level.rewardPerTask * level.dailyTaskLimit}`,
        rewardPerTask: level.rewardPerTask,
        dailyTaskLimit: level.dailyTaskLimit,
        icon: level.icon,
        description: level.description,
        isUnlocked: userCurrentLevel ? level.levelNumber <= userCurrentLevel.currentLevelNumber : level.levelNumber === 1,
        isCurrent: isUserLevel,
        canPurchase: userCurrentLevel 
          ? level.levelNumber === userCurrentLevel.currentLevelNumber + 1 && 
            userCurrentLevel.mainWallet >= level.investmentAmount
          : false,
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

export const upgradeUserLevel = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const newLevelNumber = Number(req.body.newLevelNumber); // ✅ ensure numeric

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

    // Sequential level check
    if (newLevelNumber !== (user.currentLevelNumber || 1) + 1) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "You must purchase levels sequentially.",
        title: "Purchase Level",
      });
    }

    // Balance check
    if (user.mainWallet < targetLevel.investmentAmount) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Insufficient balance. Required: ₹${targetLevel.investmentAmount}, Available: ₹${user.mainWallet}`,
        title: "Purchase Level",
      });
    }

    // Deduct and update
    user.mainWallet -= targetLevel.investmentAmount;
    user.investmentAmount = (user.investmentAmount || 0) + targetLevel.investmentAmount;
    user.currentLevel = targetLevel.levelName;
    user.currentLevelNumber = targetLevel.levelNumber;
    user.levelName = targetLevel.levelName;
    user.userLevel = targetLevel.levelNumber;
    user.levelUpgradedAt = new Date();
    user.todayTasksCompleted = 0;

    await user.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Purchase Level",
      message: `Successfully purchased ${targetLevel.levelName}!`,
      data: {
        newLevel: targetLevel.levelName,
        levelNumber: targetLevel.levelNumber,
        investmentAmount: targetLevel.investmentAmount,
        rewardPerTask: targetLevel.rewardPerTask,
        dailyTaskLimit: targetLevel.dailyTaskLimit,
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

// Get single level details
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

// Get level by number
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

// Create new level (Admin only)
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
    if (!levelNumber || !levelName || rewardPerTask === undefined || !dailyTaskLimit) {
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
      order: order || levelNumber,
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

// Update level (Admin only)
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

export default {
  getAllLevels,
  getLevelByName,
  getLevelByNumber,
  createLevel,
  updateLevel,
  upgradeUserLevel,
};