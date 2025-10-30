// controllers/task.controller.ts (Updated with Level Integration)
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";
import path from 'path';
import fs from 'fs';

const { JsonResponse } = commonsUtils;

export const getTasks = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { page = 1, limit = 10, level } = req.query;
    const userId = res.locals.userId;

    // Get user's current level
    let userLevel = "Apple1";
    let userLevelNumber = 1;
    let dailyLimit = 12;

    if (userId) {
      const user = await models.User.findById(userId).select(
        "currentLevel currentLevelNumber todayTasksCompleted"
      );

      if (user) {
        userLevel = user.currentLevel || "Apple1";
        userLevelNumber = user.currentLevelNumber || 1;

        // Get daily limit from level config
        const levelConfig = await models.level.findOne({
          levelNumber: userLevelNumber,
          isActive: true,
        });

        if (levelConfig) {
          dailyLimit = levelConfig.dailyTaskLimit;

          // Check if user reached daily limit
          if (user.todayTasksCompleted >= dailyLimit) {
            return JsonResponse(res, {
              status: "success",
              statusCode: 200,
              title: "Tasks",
              message: "Daily task limit reached.",
              data: {
                tasks: [],
                pagination: {
                  currentPage: Number(page),
                  totalPages: 0,
                  totalTasks: 0,
                  limit: Number(limit),
                },
                stats: {
                  todayCompleted: user.todayTasksCompleted,
                  dailyLimit,
                  limitReached: true,
                },
              },
            });
          }
        }
      }
    }

    const query: any = {
      isActive: true,
      level: level || userLevel, // Filter by user's level
    };

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await models.task
      .find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v")
      .lean();

    if (userId) {
      const completedTasks = await models.taskCompletion
        .find({
          userId,
          taskId: { $in: tasks.map((t: any) => t._id) },
        })
        .select("taskId");

      const completedTaskIds = new Set(
        completedTasks.map((tc: any) => tc.taskId.toString())
      );

      tasks.forEach((task: any) => {
        task.isCompleted = completedTaskIds.has(task._id.toString());
      });
    } else {
      tasks.forEach((task: any) => {
        task.isCompleted = false;
      });
    }

    const totalTasks = await models.task.countDocuments(query);

    let todayCompleted = 0;
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      todayCompleted = await models.taskCompletion.countDocuments({
        userId,
        completedAt: { $gte: today },
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Tasks",
      message: "Tasks retrieved successfully.",
      data: {
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
          totalAvailable: totalTasks,
          remainingTasks: Math.max(0, dailyLimit - todayCompleted),
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
      const completion = await models.taskCompletion.findOne({
        userId,
        taskId,
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

    const existingCompletion = await models.taskCompletion.findOne({
      userId,
      taskId,
    });

    if (existingCompletion) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task already completed.",
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

    // Get user's current level configuration
    const userLevelConfig = await models.level.findOne({
      levelNumber: user.currentLevelNumber || 1,
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

    // Check if task belongs to user's level
    if (task.level !== user.currentLevel) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 403,
        message: "This task is not available for your current level.",
        title: "Complete Task",
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Reset daily counters if new day
    const lastTaskDate = user.lastTaskCompletedAt
      ? new Date(
          user.lastTaskCompletedAt.getFullYear(),
          user.lastTaskCompletedAt.getMonth(),
          user.lastTaskCompletedAt.getDate()
        )
      : null;

    if (!lastTaskDate || lastTaskDate.getTime() < today.getTime()) {
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

    // Use reward from level configuration
    const rewardPrice = userLevelConfig.rewardPerTask;

    try {
      await models.taskCompletion.create({
        userId,
        taskId,
        rewardAmount: rewardPrice,
        completedAt: now,
      });

      console.log("✅ Task completion record created successfully");
    } catch (dupError: any) {
      if (dupError.code === 11000) {
        console.log("⚠️ Duplicate task completion detected");
        return JsonResponse(res, {
          status: "error",
          statusCode: 400,
          message: "Task already completed.",
          title: "Complete Task",
        });
      }
      throw dupError;
    }

    // Update user - Add to commissionWallet instead of mainWallet
    user.commissionWallet = (user.commissionWallet || 0) + rewardPrice;
    user.todayIncome = (user.todayIncome || 0) + rewardPrice;
    user.monthlyIncome = (user.monthlyIncome || 0) + rewardPrice;
    user.totalRevenue = (user.totalRevenue || 0) + rewardPrice;
    user.totalProfit = (user.totalProfit || 0) + rewardPrice;
    user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
    user.todayTasksCompleted = (user.todayTasksCompleted || 0) + 1;
    user.lastTaskCompletedAt = now;

    await user.save();

    console.log("✅ User data updated successfully");

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

    // Get level configuration to set reward price
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

    // Create task with reward from level config
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

    // Update fields if provided
    if (thumbnail !== undefined) task.thumbnail = thumbnail;
    if (level !== undefined) task.level = level;
    if (rewardPrice !== undefined) task.rewardPrice = Number(rewardPrice);
    if (order !== undefined) task.order = Number(order);
    if (isActive !== undefined) task.isActive = Boolean(isActive);

    // Handle video file update
    if (req.file) {
      // Delete old video file
      if (task.videoUrl) {
        const oldFilename = path.basename(task.videoUrl);
        const oldFilePath = path.join('uploads/videos', oldFilename);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      // Set new video URL
      task.videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    await task.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Update Task',
      message: 'Task updated successfully.',
      data: {
        task,
      },
    });
  } catch (error: any) {
    // Clean up uploaded file on error
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

    // Delete video file from storage
    if (task.videoUrl) {
      const filename = path.basename(task.videoUrl);
      const filePath = path.join('uploads/videos', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete task from database
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

    // Toggle isActive status
    task.isActive = !task.isActive;
    await task.save();

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Toggle Task Status',
      message: `Task ${task.isActive ? 'activated' : 'deactivated'} successfully.`,
      data: {
        task,
      },
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