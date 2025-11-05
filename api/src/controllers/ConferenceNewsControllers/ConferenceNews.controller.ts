import { Request, Response } from 'express';
import models from '../../models';

// 📸 Upload Conference News Image
const uploadConferenceNewsImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const fileUrl = `/uploads/conference-news/${req.file.filename}`;

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
      },
    });
  } catch (error) {
    console.error('Error uploading conference news image:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload image',
    });
  }
};

// 📰 Create Conference News (Admin)
const createConferenceNews = async (req: Request, res: Response) => {
  try {
    const { title, description, imageUrl, priority, expiryDate, clickUrl } = req.body;

    if (!title || !description || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and image URL are required',
      });
    }

    const conferenceNews = await models.ConferenceNews.create({
      title,
      description,
      imageUrl,
      priority: priority || 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      clickUrl: clickUrl || null,
      isActive: true, // default active
    });

    return res.status(201).json({
      success: true,
      message: 'Conference news created successfully',
      data: conferenceNews,
    });
  } catch (error) {
    console.error('Error creating conference news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create conference news',
    });
  }
};

// 📢 Get Active Conference News (For Users)
const getActiveConferenceNews = async (req: Request, res: Response) => {
  try {
    const currentDate = new Date();

    const conferenceNews = await models.ConferenceNews.find({
      isActive: true,
      $or: [
        { expiryDate: null },
        { expiryDate: { $gt: currentDate } },
      ],
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(1)
      .select('-__v');

    if (!conferenceNews.length) {
      return res.status(200).json({
        success: true,
        message: 'No active conference news',
        data: null,
      });
    }

    // Increment view count
    await models.ConferenceNews.findByIdAndUpdate(conferenceNews[0]._id, {
      $inc: { viewCount: 1 },
    });

    return res.status(200).json({
      success: true,
      message: 'Conference news retrieved successfully',
      data: conferenceNews[0],
    });
  } catch (error) {
    console.error('Error getting conference news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get conference news',
    });
  }
};

// 🧾 Get All Conference News (Admin)
const getAllConferenceNews = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [conferenceNews, total] = await Promise.all([
      models.ConferenceNews.find(filter)
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      models.ConferenceNews.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Conference news list retrieved successfully',
      data: {
        conferenceNews,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Error getting all conference news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get conference news list',
    });
  }
};

// ❌ Delete Conference News (Admin Only)
const deleteConferenceNews = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const deletedNews = await models.ConferenceNews.findByIdAndDelete(newsId);

    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: 'Conference news not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conference news deleted successfully',
      data: deletedNews,
    });
  } catch (error) {
    console.error('Error deleting conference news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete conference news',
    });
  }
};

// 🔄 Toggle Active/Inactive
const toggleConferenceNewsStatus = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;

    const news = await models.ConferenceNews.findById(newsId);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Conference news not found',
      });
    }

    news.isActive = !news.isActive;
    await news.save();

    return res.status(200).json({
      success: true,
      message: `Conference news ${news.isActive ? 'activated' : 'deactivated'} successfully`,
      data: news,
    });
  } catch (error) {
    console.error('Error toggling conference news status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle conference news status',
    });
  }
};

// 🚪 Close Conference News (track close count)
const closeConferenceNews = async (req: Request, res: Response) => {
  try {
    const { newsId } = req.params;

    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'News ID is required',
      });
    }

    const news = await models.ConferenceNews.findByIdAndUpdate(
      newsId,
      { $inc: { closeCount: 1 } },
      { new: true }
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'Conference news not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Conference news closed successfully',
      data: news,
    });
  } catch (error) {
    console.error('Error closing conference news:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to close conference news',
    });
  }
};

export default {
  uploadConferenceNewsImage,
  createConferenceNews,
  getActiveConferenceNews,
  getAllConferenceNews,
  closeConferenceNews,
  deleteConferenceNews,
  toggleConferenceNewsStatus,
};
