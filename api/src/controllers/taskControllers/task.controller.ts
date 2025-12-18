// controllers/task.controller.ts - FIXED Daily Reset Logic
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";
import path from 'path';
import fs from 'fs';

const { JsonResponse } = commonsUtils;

// Helper function to get start of today in IST
const getStartOfTodayIST = (): Date => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istTime = new Date(now.getTime() + istOffset);
  istTime.setUTCHours(0, 0, 0, 0);
  return new Date(istTime.getTime() - istOffset); // Convert back to UTC
};

export const getTasks = async (req: Request, res: Response, __: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = res.locals.userId;

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "User not authenticated.",
        title: "Tasks",
      });
    }

    const user = await models.User.findById(userId).select(
      "currentLevel currentLevelNumber todayTasksCompleted todayIncome lastTaskCompletedAt"
    );

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Tasks",
      });
    }

    const hasNoLevel = !user.currentLevel || user.currentLevelNumber === null || user.currentLevelNumber === undefined;

    if (hasNoLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: "Please purchase a level first to access tasks.",
        title: "Tasks",
        data: {
          requiresLevelPurchase: true,
          tasks: [],
          pagination: {
            currentPage: Number(page),
            totalPages: 0,
            totalTasks: 0,
            limit: Number(limit),
          },
          stats: {
            todayCompleted: 0,
            dailyLimit: 0,
            totalAvailable: 0,
            remainingTasks: 0,
            limitReached: false,
            userLevel: null,
            userLevelNumber: null,
            todayIncome: 0,
          },
        },
      });
    }

    const userLevel = user.currentLevel;
    const userLevelNumber = user.currentLevelNumber;

    const levelConfig = await models.level.findOne({
      levelNumber: userLevelNumber,
      isActive: true,
    });

    if (!levelConfig) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level configuration not found.",
        title: "Tasks",
      });
    }

    const dailyLimit = levelConfig.dailyTaskLimit;

    // Check if we need to reset daily counters
    const startOfToday = getStartOfTodayIST();
    const needsReset = !user.lastTaskCompletedAt || 
                       new Date(user.lastTaskCompletedAt) < startOfToday;

    if (needsReset && (user.todayTasksCompleted > 0 || user.todayIncome > 0)) {
      // Reset daily counters
      user.todayTasksCompleted = 0;
      user.todayIncome = 0;
      await user.save();
    }

    const query: any = { isActive: true, level: userLevel };
    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await models.task
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v")
      .lean();

    const totalTasks = await models.task.countDocuments(query);

    // Get today's completions based on IST midnight
    const completedTasks = await models.taskCompletion.find({
      userId,
      taskId: { $in: tasks.map((t: any) => t._id) },
      completedAt: { $gte: startOfToday },
    }).select("taskId");

    const completedTaskIds = new Set(completedTasks.map((c: any) => c.taskId.toString()));

    tasks.forEach((task: any) => {
      task.isCompleted = completedTaskIds.has(task._id.toString());
    });

    // Count today's completed tasks
    const todayCompleted = await models.taskCompletion.countDocuments({
      userId,
      completedAt: { $gte: startOfToday },
    });

    const totalAvailable = totalTasks;
    const maxAvailable = Math.min(dailyLimit, totalAvailable);
    const remainingTasks = Math.max(0, maxAvailable - todayCompleted);
    const limitReached = todayCompleted >= maxAvailable;

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Tasks",
      message: "Tasks retrieved successfully.",
      data: {
        requiresLevelPurchase: false,
        tasks,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalTasks / Number(limit)),
          totalTasks,
          limit: Number(limit),
        },
        stats: {
          todayCompleted,
          dailyLimit,
          totalAvailable,
          remainingTasks,
          limitReached,
          userLevel,
          userLevelNumber,
          rewardPerTask: levelConfig.rewardPerTask,
          maxDailyEarning: levelConfig.rewardPerTask * dailyLimit,
          todayIncome: user.todayIncome || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching tasks.",
      title: "Tasks",
    });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const userId = res.locals.userId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid task ID.",
        title: "Get Task",
      });
    }

    if (userId) {
      const user = await models.User.findById(userId).select("currentLevel currentLevelNumber");
      
      if (user) {
        const hasNoLevel = !user.currentLevel || user.currentLevelNumber === null || user.currentLevelNumber === undefined;
        
        if (hasNoLevel) {
          return JsonResponse(res, {
            status: "error",
            statusCode: 403,
            message: "Please purchase a level first to access tasks.",
            title: "Get Task",
          });
        }
      }
    }

    const task = await models.task.findById(taskId).lean();

    if (!task) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Task not found.",
        title: "Get Task",
      });
    }

    if (!task.isActive) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task is not active.",
        title: "Get Task",
      });
    }

    let isCompleted = false;
    if (userId) {
      const startOfToday = getStartOfTodayIST();
      const completion = await models.taskCompletion.findOne({
        userId,
        taskId,
        completedAt: { $gte: startOfToday },
      });
      isCompleted = !!completion;
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Get Task",
      message: "Task retrieved successfully.",
      data: {
        task: {
          ...task,
          isCompleted,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching the task.",
      title: "Get Task",
    });
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const userId = res.locals.userId;

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "User not authenticated.",
        title: "Complete Task",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid task ID.",
        title: "Complete Task",
      });
    }

    // Check for today's completion
    const startOfToday = getStartOfTodayIST();
    const existingCompletion = await models.taskCompletion.findOne({
      userId,
      taskId,
      completedAt: { $gte: startOfToday },
    });

    if (existingCompletion) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task already completed today.",
        title: "Complete Task",
      });
    }

    const task = await models.task.findOne({
      _id: taskId,
      isActive: true,
    });

    if (!task) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Task not found or inactive.",
        title: "Complete Task",
      });
    }

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Complete Task",
      });
    }

    const hasNoLevel = !user.currentLevel || user.currentLevelNumber === null || user.currentLevelNumber === undefined;

    if (hasNoLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: "Please purchase a level first to complete tasks.",
        title: "Complete Task",
      });
    }

    const userLevelConfig = await models.level.findOne({
      levelNumber: user.currentLevelNumber,
      isActive: true,
    });

    if (!userLevelConfig) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Level configuration not found.",
        title: "Complete Task",
      });
    }

    if (task.level !== user.currentLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: "This task is not available for your current level.",
        title: "Complete Task",
      });
    }

    const now = new Date();

    // Check if we need to reset daily counters
    const needsReset = !user.lastTaskCompletedAt || 
                       new Date(user.lastTaskCompletedAt) < startOfToday;

    if (needsReset) {
      user.todayTasksCompleted = 0;
      user.todayIncome = 0;
    }

    // Check daily task limit
    if (user.todayTasksCompleted >= userLevelConfig.dailyTaskLimit) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: `Daily task limit reached (${userLevelConfig.dailyTaskLimit} tasks).`,
        title: "Complete Task",
      });
    }

    const rewardPrice = userLevelConfig.rewardPerTask;

    // Create task completion record
    await models.taskCompletion.create({
      userId,
      taskId,
      rewardAmount: rewardPrice,
      completedAt: now,
    });

    // Update user balances and counters
    user.commissionWallet = (user.commissionWallet || 0) + rewardPrice;
    user.todayIncome = (user.todayIncome || 0) + rewardPrice;
    user.monthlyIncome = (user.monthlyIncome || 0) + rewardPrice;
    user.totalRevenue = (user.totalRevenue || 0) + rewardPrice;
    user.totalProfit = (user.totalProfit || 0) + rewardPrice;
    user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
    user.todayTasksCompleted = (user.todayTasksCompleted || 0) + 1;
    user.lastTaskCompletedAt = now;

    await user.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Complete Task",
      message: `Congratulations! You earned ₹${rewardPrice}`,
      data: {
        rewardAmount: rewardPrice,
        commissionWallet: user.commissionWallet,
        todayTasksCompleted: user.todayTasksCompleted,
        dailyLimit: userLevelConfig.dailyTaskLimit,
        remainingTasks: userLevelConfig.dailyTaskLimit - user.todayTasksCompleted,
        totalTasksCompleted: user.totalTasksCompleted,
        todayIncome: user.todayIncome,
      },
    });
  } catch (error: any) {
    console.error("❌ Error completing task:", error);

    if (error.code === 11000) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task already completed.",
        title: "Complete Task",
      });
    }

    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while completing the task.",
      title: "Complete Task",
    });
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    if (!req.file) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Video file is required.',
        title: 'Create Task',
      });
    }

    const { thumbnail, level, order } = req.body;

    if (!level) {
      const filePath = path.join('uploads/videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Task level is required.',
        title: 'Create Task',
      });
    }

    const levelConfig = await models.level.findOne({
      levelName: level,
      isActive: true,
    });

    if (!levelConfig) {
      const filePath = path.join('uploads/videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Level configuration not found.',
        title: 'Create Task',
      });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    const existingTask = await models.task.findOne({ videoUrl });
    if (existingTask) {
      const filePath = path.join('uploads/videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Task with this video already exists.',
        title: 'Create Task',
      });
    }

    const task = await models.task.create({
      videoUrl,
      thumbnail: thumbnail || '',
      level: levelConfig.levelName,
      levelNumber: levelConfig.levelNumber,
      rewardPrice: levelConfig.rewardPerTask,
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 201,
      title: 'Create Task',
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error: any) {
    if (req.file) {
      const filePath = path.join('uploads/videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.error('Error creating task:', error);

    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while creating the task.',
      title: 'Create Task',
    });
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;
    const { thumbnail, level, rewardPrice, order, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid task ID.',
        title: 'Update Task',
      });
    }

    const task = await models.task.findById(taskId);
    
    if (!task) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Task not found.',
        title: 'Update Task',
      });
    }

    if (thumbnail !== undefined) task.thumbnail = thumbnail;
    if (level !== undefined) task.level = level;
    if (rewardPrice !== undefined) task.rewardPrice = Number(rewardPrice);
    if (order !== undefined) task.order = Number(order);
    if (isActive !== undefined) task.isActive = Boolean(isActive);

    if (req.file) {
      if (task.videoUrl) {
        const oldFilename = path.basename(task.videoUrl);
        const oldFilePath = path.join('uploads/videos', oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      task.videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    await task.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Update Task',
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error: any) {
    if (req.file) {
      const filePath = path.join('uploads/videos', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.error('Error updating task:', error);
    
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while updating the task.',
      title: 'Update Task',
    });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid task ID.',
        title: 'Delete Task',
      });
    }

    const task = await models.task.findById(taskId);
    
    if (!task) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Task not found.',
        title: 'Delete Task',
      });
    }

    if (task.videoUrl) {
      const filename = path.basename(task.videoUrl);
      const filePath = path.join('uploads/videos', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await models.task.findByIdAndDelete(taskId);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Delete Task',
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while deleting the task.',
      title: 'Delete Task',
    });
  }
};

export const toggleTaskStatus = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid task ID.',
        title: 'Toggle Task Status',
      });
    }

    const task = await models.task.findById(taskId);
    
    if (!task) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Task not found.',
        title: 'Toggle Task Status',
      });
    }

    task.isActive = !task.isActive;
    await task.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Toggle Task Status',
      message: `Task ${task.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: { task },
    });
  } catch (error) {
    console.error('Error toggling task status:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while toggling task status.',
      title: 'Toggle Task Status',
    });
  }
};

export default {
  getTasks,
  completeTask,
  createTask,
  getTaskById,
  toggleTaskStatus,
  deleteTask,
  updateTask,
};