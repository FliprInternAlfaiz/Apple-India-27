import { Request, Response } from 'express';
import models from '../../models';

const uploadAadhaarPhoto = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/aadhaar/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload file',
    });
  }
};

const uploadAadhaarVerification = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const { aadhaarNumber, aadhaarPhotoUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (!aadhaarNumber || !aadhaarPhotoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar number and photo URL are required',
      });
    }

    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(aadhaarNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Aadhaar number format. Must be 12 digits',
      });
    }

    const existingAadhaar = await models.User.findOne({
      aadhaarNumber,
      _id: { $ne: userId },
    });

    if (existingAadhaar) {
      return res.status(400).json({
        success: false,
        message: 'This Aadhaar number is already registered',
      });
    }

    const updatedUser = await models.User.findByIdAndUpdate(
      userId,
      {
        aadhaarNumber,
        aadhaarPhoto: aadhaarPhotoUrl,
        aadhaarVerificationStatus: 'pending',
        aadhaarSubmittedAt: new Date(),
      },
      { new: true, select: '-password -withdrawalPassword' },
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Aadhaar verification submitted successfully',
      data: {
        aadhaarNumber: updatedUser.aadhaarNumber,
        aadhaarPhoto: updatedUser.aadhaarPhoto,
        aadhaarVerificationStatus: updatedUser.aadhaarVerificationStatus,
      },
    });
  } catch (error) {
    console.error('Error uploading Aadhaar verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const getVerificationStatus = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await models.User.findById(userId).select(
      'aadhaarNumber aadhaarPhoto aadhaarVerificationStatus aadhaarSubmittedAt aadhaarVerifiedAt',
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        aadhaarNumber: user.aadhaarNumber || null,
        aadhaarPhoto: user.aadhaarPhoto || null,
        aadhaarVerificationStatus:
          user.aadhaarVerificationStatus || 'not_submitted',
        aadhaarSubmittedAt: user.aadhaarSubmittedAt || null,
        aadhaarVerifiedAt: user.aadhaarVerifiedAt || null,
      },
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export default {
  uploadAadhaarPhoto,
  getVerificationStatus,
  uploadAadhaarVerification,
};
