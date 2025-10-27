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

    const query: any = {
      isActive: true,
    };

    if (level) {
      query.level = level;
    }

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
          totalAvailable: totalTasks,
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

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

    const rewardPrice = task.rewardPrice || 0;
    
    user.mainWallet = (user.mainWallet || 0) + rewardPrice;
    user.todayIncome = (user.todayIncome || 0) + rewardPrice;
    user.monthlyIncome = (user.monthlyIncome || 0) + rewardPrice;
    user.totalRevenue = (user.totalRevenue || 0) + rewardPrice;
    user.totalProfit = (user.totalProfit || 0) + rewardPrice;
    user.totalTasksCompleted = (user.totalTasksCompleted || 0) + 1;
    user.todayTasksCompleted = (user.todayTasksCompleted || 0) + 1;
    user.lastTaskCompletedAt = now;

    try {
      const taskCompletion = await models.taskCompletion.create({
        userId,
        taskId,
        rewardAmount: rewardPrice,
        completedAt: now,
      });
    } catch (dupError: any) {
      if (dupError.code === 11000) {
        return JsonResponse(res, {
          status: "error",
          statusCode: 400,
          message: "Task already completed.",
          title: "Complete Task",
        });
      }
      throw dupError;
    }

    await user.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Complete Task",
      message: "Congratulations! Task completed successfully.",
      data: {
        rewardAmount: rewardPrice,
        newBalance: user.mainWallet,
        todayTasksCompleted: user.todayTasksCompleted,
        totalTasksCompleted: user.totalTasksCompleted,
        todayIncome: user.todayIncome,
      },
    });
  } catch (error: any) {

    if (error.code === 11000) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task already completed.",
        title: "Complete Task",
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {})
        .map((err: any) => err.message)
        .join(", ");
      
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: messages || "Validation error occurred.",
        title: "Complete Task",
      });
    }

    if (error.name === "CastError") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid ID format.",
        title: "Complete Task",
      });
    }

    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while completing the task.",
      title: "Complete Task",
      ...(process.env.NODE_ENV === "development" && {
        error: error.message,
        stack: error.stack,
      }),
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

    const { thumbnail, level, rewardPrice, order } = req.body;

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    const task = await models.task.create({
      videoUrl,
      thumbnail,
      level,
      rewardPrice: Number(rewardPrice),
      order: order ? Number(order) : 0,
      isActive: true,
    });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 201,
      title: 'Create Task',
      message: 'Task created successfully.',
      data: {
        task,
      },
    });
  } catch (error) {
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

export const deleteTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { taskId } = req.params;

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

export default {
  getTasks,
  getTaskById,
  completeTask,
  createTask,
};