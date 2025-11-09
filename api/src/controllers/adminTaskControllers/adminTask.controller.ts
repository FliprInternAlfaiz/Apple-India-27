// controllers/adminControllers/adminTask.controller.ts
import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

const { JsonResponse } = commonsUtils;

/**
 * Get all tasks for admin with filtering and pagination
 */
export const getAllTasks = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      levelNumber = '',
      level = '',
      isActive = '',
      sortBy = 'order',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Search filter
    if (search) {
      filter.$or = [
        { level: { $regex: search, $options: 'i' } },
        {
          _id: mongoose.Types.ObjectId.isValid(search as string)
            ? search
            : undefined,
        },
      ].filter(Boolean);
    }

    // Level filter
    if (level && level !== 'all') {
      filter.level = level;
    }

    // Status filter
    if (isActive !== '' && isActive !== 'all') {
      filter.isActive = isActive === 'true';
    }

    // Level number filter
    if (levelNumber && levelNumber !== 'all') {
      filter.levelNumber = Number(levelNumber);
    }

    // Sorting
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [tasks, totalCount] = await Promise.all([
      models.task.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      models.task.countDocuments(filter),
    ]);

    // Get statistics
    const stats = await models.task.aggregate([
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          activeTasks: {
            $sum: { $cond: ['$isActive', 1, 0] },
          },
          inactiveTasks: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
          },
          totalRewards: { $sum: '$rewardPrice' },
        },
      },
    ]);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Tasks Retrieved',
      message: 'Tasks fetched successfully.',
      data: {
        tasks,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
        statistics: stats[0] || {
          totalTasks: 0,
          activeTasks: 0,
          inactiveTasks: 0,
          totalRewards: 0,
        },
      },
    });
  } catch (err) {
    console.error('💥 Get all tasks error:', err);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to fetch tasks.',
    });
  }
};

/**
 * Get single task by ID (Admin)
 */
export const getTaskById = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'Invalid task ID.',
        title: 'Get Task',
      });
    }

    const task = await models.task.findById(taskId).lean();

    if (!task) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'Task not found.',
        title: 'Get Task',
      });
    }

    // Get completion stats for this task
    const completionStats = await models.taskCompletion.aggregate([
      { $match: { taskId: new mongoose.Types.ObjectId(taskId) } },
      {
        $group: {
          _id: null,
          totalCompletions: { $sum: 1 },
          totalRewardsGiven: { $sum: '$rewardAmount' },
        },
      },
    ]);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Get Task',
      message: 'Task retrieved successfully.',
      data: {
        task,
        stats: completionStats[0] || {
          totalCompletions: 0,
          totalRewardsGiven: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while fetching the task.',
      title: 'Get Task',
    });
  }
};

/**
 * Create new task (Admin)
 */
export const createTask = async (
  req: Request,
  res: Response,
  __: NextFunction,
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

    const { thumbnail, level, levelNumber, rewardPrice, order } = req.body;

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

    const videoUrl = `/uploads/videos/${req.file.filename}`;

    // Check if task with this video already exists
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

    // Create task
    const task = await models.task.create({
      videoUrl,
      thumbnail: thumbnail || '',
      level,
      levelNumber: Number(levelNumber) || 1,
      rewardPrice: Number(rewardPrice) || 0,
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
    // Clean up uploaded file on error
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

/**
 * Update task (Admin)
 */
export const updateTask = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const { thumbnail, level, levelNumber, rewardPrice, order, isActive } =
      req.body;

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
    if (levelNumber !== undefined) task.levelNumber = Number(levelNumber);
    if (rewardPrice !== undefined) task.rewardPrice = Number(rewardPrice);
    if (order !== undefined) task.order = Number(order);
    if (isActive !== undefined)
      task.isActive = isActive === 'true' || isActive === true;

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
      data: { task },
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

/**
 * Delete task (Admin)
 */
export const deleteTask = async (
  req: Request,
  res: Response,
  __: NextFunction,
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

    // Optional: Also delete completion records
    // await models.taskCompletion.deleteMany({ taskId });

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

/**
 * Toggle task status (Admin)
 */
export const toggleTaskStatus = async (
  req: Request,
  res: Response,
  __: NextFunction,
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
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
};
