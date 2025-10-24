import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

// Get all tasks
export const getTasks = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { page = 1, limit = 10, level } = req.query;

    const query: any = {
      isActive: true,
    };

    if (level) {
      query.level = level;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const tasks = await models.task.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v");

    const totalTasks = await models.task.countDocuments(query);

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

// Create a new task
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
  createTask,
};