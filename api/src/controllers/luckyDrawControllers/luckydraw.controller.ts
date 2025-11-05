import { Request, Response } from 'express';
import models from '../../models';

const uploadLuckyDrawImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/lucky-draw/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading lucky draw image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
};

// 🎁 Create Lucky Draw (Admin)
const createLuckyDraw = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      imageUrl,
      offerDetails,
      termsConditions,
      priority,
      expiryDate,
      winnerSelectionDate,
      maxParticipants,
      prizes,
    } = req.body;

    if (!title || !description || !imageUrl || !offerDetails) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, image URL, and offer details are required',
      });
    }

    const luckyDraw = await models.LuckyDraw.create({
      title,
      description,
      imageUrl,
      offerDetails,
      termsConditions: termsConditions || [],
      priority: priority || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      winnerSelectionDate: winnerSelectionDate ? new Date(winnerSelectionDate) : null,
      maxParticipants: maxParticipants || null,
      prizes: prizes || [],
      isActive: true,
      status: 'ongoing',
      participantCount: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Lucky draw created successfully',
      data: luckyDraw,
    });
  } catch (error) {
    console.error('Error creating lucky draw:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create lucky draw',
    });
  }
};

// 🎯 Get Active Lucky Draws (For Users)
const getActiveLuckyDraws = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    const luckyDraws = await models.LuckyDraw.find({
      isActive: true,
      status: 'ongoing',
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: currentDate } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .select('-__v');

    return res.status(200).json({
      success: true,
      message: 'Active lucky draws retrieved successfully',
      data: luckyDraws,
    });
  } catch (error) {
    console.error('Error getting active lucky draws:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get active lucky draws',
    });
  }
};

// 🧾 Get All Lucky Draws (Admin)
const getAllLuckyDraws = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, isActive, status } = req.query;

    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    if (status) {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [luckyDraws, total] = await Promise.all([
      models.LuckyDraw.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      models.LuckyDraw.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Lucky draws list retrieved successfully',
      data: {
        luckyDraws,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error getting all lucky draws:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get lucky draws list',
    });
  }
};

const participateInLuckyDraw = async (req: Request, res: Response) => {
  try {
    const { drawId } = req.params;
    const userId = res.locals?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const luckyDraw = await models.LuckyDraw.findById(drawId);

    if (!luckyDraw) {
      return res.status(404).json({
        success: false,
        message: 'Lucky draw not found',
      });
    }

    if (!luckyDraw.isActive || luckyDraw.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: 'Lucky draw is not active',
      });
    }

    if (luckyDraw.expiryDate && new Date() > luckyDraw.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Lucky draw has expired',
      });
    }

    if (luckyDraw.maxParticipants && luckyDraw.participantCount >= luckyDraw.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Maximum participants limit reached',
      });
    }

    // Check if user already participated
    const existingParticipation = await models.LuckyDrawParticipant.findOne({
      luckyDrawId: drawId,
      userId: userId,
    });

    if (existingParticipation) {
      return res.status(400).json({
        success: false,
        message: 'You have already participated in this lucky draw',
      });
    }

    // Create participation record
    const participation = await models.LuckyDrawParticipant.create({
      luckyDrawId: drawId,
      userId: userId,
      participatedAt: new Date(),
    });

    // Increment participant count
    await models.LuckyDraw.findByIdAndUpdate(drawId, {
      $inc: { participantCount: 1 },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully participated in lucky draw',
      data: participation,
    });
  } catch (error) {
    console.error('Error participating in lucky draw:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to participate in lucky draw',
    });
  }
};

// 🏆 Select Winners (Admin)
const selectWinners = async (req: Request, res: Response) => {
  try {
    const { drawId } = req.params;
    const { numberOfWinners } = req.body;

    const luckyDraw = await models.LuckyDraw.findById(drawId);

    if (!luckyDraw) {
      return res.status(404).json({
        success: false,
        message: 'Lucky draw not found',
      });
    }

    // Get all participants
    const participants = await models.LuckyDrawParticipant.find({
      luckyDrawId: drawId,
    }).populate('userId', 'name email');

    if (participants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No participants found',
      });
    }

    // Randomly select winners
    const winnersCount = Math.min(numberOfWinners || 1, participants.length);
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const selectedWinners = shuffled.slice(0, winnersCount);

    // Update lucky draw with winners
    luckyDraw.winners = selectedWinners.map(p => p.userId._id);
    luckyDraw.status = 'completed';
    await luckyDraw.save();

    return res.status(200).json({
      success: true,
      message: 'Winners selected successfully',
      data: {
        winners: selectedWinners,
        totalParticipants: participants.length,
      },
    });
  } catch (error) {
    console.error('Error selecting winners:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to select winners',
    });
  }
};

// ❌ Delete Lucky Draw (Admin)
const deleteLuckyDraw = async (req: Request, res: Response) => {
  try {
    const { drawId } = req.params;

    if (!drawId) {
      return res.status(400).json({
        success: false,
        message: 'Draw ID is required',
      });
    }

    const deletedDraw = await models.LuckyDraw.findByIdAndDelete(drawId);

    if (!deletedDraw) {
      return res.status(404).json({
        success: false,
        message: 'Lucky draw not found',
      });
    }

    // Also delete all participants
    await models.LuckyDrawParticipant.deleteMany({ luckyDrawId: drawId });

    return res.status(200).json({
      success: true,
      message: 'Lucky draw deleted successfully',
      data: deletedDraw,
    });
  } catch (error) {
    console.error('Error deleting lucky draw:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete lucky draw',
    });
  }
};

// 🔄 Toggle Active/Inactive
const toggleLuckyDrawStatus = async (req: Request, res: Response) => {
  try {
    const { drawId } = req.params;

    const draw = await models.LuckyDraw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: 'Lucky draw not found',
      });
    }

    draw.isActive = !draw.isActive;
    await draw.save();

    return res.status(200).json({
      success: true,
      message: `Lucky draw ${draw.isActive ? 'activated' : 'deactivated'} successfully`,
      data: draw,
    });
  } catch (error) {
    console.error('Error toggling lucky draw status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle lucky draw status',
    });
  }
};

// 📊 Get Lucky Draw Details
const getLuckyDrawDetails = async (req: Request, res: Response) => {
  try {
    const { drawId } = req.params;

    const luckyDraw = await models.LuckyDraw.findById(drawId)
      .populate('winners', 'name email');

    if (!luckyDraw) {
      return res.status(404).json({
        success: false,
        message: 'Lucky draw not found',
      });
    }

    const participantCount = await models.LuckyDrawParticipant.countDocuments({
      luckyDrawId: drawId,
    });

    return res.status(200).json({
      success: true,
      message: 'Lucky draw details retrieved successfully',
      data: {
        ...luckyDraw.toObject(),
        participantCount,
      },
    });
  } catch (error) {
    console.error('Error getting lucky draw details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get lucky draw details',
    });
  }
};

export default {
  uploadLuckyDrawImage,
  createLuckyDraw,
  getActiveLuckyDraws,
  getAllLuckyDraws,
  participateInLuckyDraw,
  selectWinners,
  deleteLuckyDraw,
  toggleLuckyDrawStatus,
  getLuckyDrawDetails,
};