import { Request, Response } from 'express';
import commonsUtils from '../../utils';
import models from '../../models';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const { name, phone } = req.body;
    let updateData: any = {};

    if (name) updateData.name = name;

    if (phone) {
      const existingUser = await models.User.findOne({ phone });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return JsonResponse(res, {
          status: 'error',
          statusCode: 400,
          title: 'Duplicate Phone',
          message:
            'This phone number is already registered with another account.',
        });
      }
      updateData.phone = phone;
    }

    if (req.file) {
      const imagePath = `/uploads/profile/${req.file.filename}`;
      updateData.picture = imagePath;
    }

    const updatedUser = await models.User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    ).select('-password');

    if (!updatedUser) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        title: 'Not Found',
        message: 'User not found',
      });
    }

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Profile Updated',
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Failed to update profile',
    });
  }
};
