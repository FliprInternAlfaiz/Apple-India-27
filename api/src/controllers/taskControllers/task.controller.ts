import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";
import mongoose from "mongoose";

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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { taskId } = req.params;
    const userId = res.locals.userId;

    if (!userId) {
      await session.abortTransaction();
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "User not authenticated.",
        title: "Complete Task",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      await session.abortTransaction();
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid task ID.",
        title: "Complete Task",
      });
    }

    const task = await models.task.findOne({
      _id: taskId,
      isActive: true,
    }).session(session);

    if (!task) {
      await session.abortTransaction();
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Task not found or inactive.",
        title: "Complete Task",
      });
    }

    const existingCompletion = await models.taskCompletion.findOne({
      userId,
      taskId,
    }).session(session);

    if (existingCompletion) {
      await session.abortTransaction();
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Task already completed.",
        title: "Complete Task",
      });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const user = await models.User.findById(userId).session(session);

    if (!user) {
      await session.abortTransaction();
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Complete Task",
      });
    }

    const lastTaskDate = user.lastTaskCompletedAt
      ? new Date(
          user.lastTaskCompletedAt.getFullYear(),
          user.lastTaskCompletedAt.getMonth(),
          user.lastTaskCompletedAt.getDate()
        )
      : null;

    if (!lastTaskDate || lastTaskDate < today) {
      user.todayTasksCompleted = 0;
      user.todayIncome = 0;
    }

    user.mainWallet += task.rewardPrice;
    user.todayIncome += task.rewardPrice;
    user.monthlyIncome += task.rewardPrice;
    user.totalRevenue += task.rewardPrice;
    user.totalProfit += task.rewardPrice;
    user.totalTasksCompleted += 1;
    user.todayTasksCompleted += 1;
    user.lastTaskCompletedAt = now;

    await user.save({ session });

    await models.taskCompletion.create(
      [
        {
          userId,
          taskId,
          rewardAmount: task.rewardPrice,
          completedAt: now,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Complete Task",
      message: "Congratulations! Task completed successfully.",
      data: {
        rewardAmount: task.rewardPrice,
        newBalance: user.mainWallet,
        todayTasksCompleted: user.todayTasksCompleted,
        totalTasksCompleted: user.totalTasksCompleted,
        todayIncome: user.todayIncome,
      },
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error completing task:", error);

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
  } finally {
    session.endSession();
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { videoUrl, thumbnail, level, rewardPrice, order } = req.body;

    const task = await models.task.create({
      videoUrl,
      thumbnail,
      level,
      rewardPrice,
      order: order || 0,
      isActive: true,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Create Task",
      message: "Task created successfully.",
      data: {
        task,
      },
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating the task.",
      title: "Create Task",
    });
  }
};

export default {
  getTasks,
  getTaskById,
  completeTask,
  createTask,
};