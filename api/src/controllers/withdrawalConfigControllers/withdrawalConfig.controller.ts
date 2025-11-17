// controllers/admin/withdrawalConfig.controller.ts
import { Request, Response, NextFunction } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';

const { JsonResponse } = commonsUtils;

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// ✅ Get all withdrawal configurations
export const getWithdrawalConfigs = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const configs = await models.withdrawalConfig.find().lean();

    // Ensure all days exist
    const allDays = DAY_NAMES.map((dayName, i) => {
      const existing = configs.find((c: any) => c.dayOfWeek === i);
      return (
        existing || {
          dayOfWeek: i,
          dayName,
          allowedLevels: [],
          isActive: i !== 0, // Sunday off by default
          startTime: '08:30',
          endTime: '17:00',
        }
      );
    });

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Withdrawal Configurations',
      message: 'Configurations retrieved successfully.',
      data: { configs: allDays },
    });
  } catch (error) {
    console.error('Error fetching withdrawal configs:', error);
    return JsonResponse(res, {
      status: 'error',
      title: 'error',
      statusCode: 500,
      message: 'Failed to fetch withdrawal configurations.',
    });
  }
};

// ✅ Update single config by day
export const updateWithdrawalConfig = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { dayOfWeek } = req.params;
    const { allowedLevels, isActive, startTime, endTime } = req.body;

    const day = Number(dayOfWeek);
    if (isNaN(day) || day < 0 || day > 6) {
      return JsonResponse(res, {
        status: 'error',
        title: 'error',
        statusCode: 400,
        message: 'Invalid dayOfWeek (0–6).',
      });
    }

    const updated = await models.withdrawalConfig.findOneAndUpdate(
      { dayOfWeek: day },
      {
        allowedLevels: allowedLevels || [],
        isActive: isActive ?? true,
        startTime: startTime || '08:30',
        endTime: endTime || '17:00',
      },
      { new: true, upsert: true },
    );

    return JsonResponse(res, {
      status: 'success',
      title: 'Updation Done',
      statusCode: 200,
      message: 'Configuration updated successfully.',
      data: { config: updated },
    });
  } catch (error) {
    console.error('Error updating withdrawal config:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'error',
      message: 'Failed to update withdrawal configuration.',
    });
  }
};

// ✅ Bulk update configs
export const bulkUpdateConfigs = async (
  req: Request,
  res: Response,
  __: NextFunction,
) => {
  try {
    const { configs } = req.body;
    if (!Array.isArray(configs)) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        title: 'error',
        message: 'Configs must be an array.',
      });
    }

    const bulkOps = configs.map((c: any) => ({
      updateOne: {
        filter: { dayOfWeek: c.dayOfWeek },
        update: {
          allowedLevels: c.allowedLevels || [],
          isActive: c.isActive ?? true,
          startTime: c.startTime || '08:30',
          endTime: c.endTime || '17:00',
        },
        upsert: true,
      },
    }));

    await models.withdrawalConfig.bulkWrite(bulkOps);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Config Update Done',
      message: 'Configurations updated successfully.',
    });
  } catch (error) {
    console.error('Error bulk updating withdrawal configs:', error);
    return JsonResponse(res, {
      title: 'Error',
      status: 'error',
      statusCode: 500,
      message: 'Failed to update configurations.',
    });
  }
};

export default {
  getWithdrawalConfigs,
  updateWithdrawalConfig,
  bulkUpdateConfigs,
};
