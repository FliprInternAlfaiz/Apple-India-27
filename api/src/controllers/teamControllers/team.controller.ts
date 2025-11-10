// controllers/teamControllers/team.controller.ts - COMPLETE VERSION
import { Request, Response } from "express";
import models from "../../models";
import commonsUtils from "../../utils";
import mongoose from "mongoose";

const { JsonResponse } = commonsUtils;

// ==================== USER ENDPOINTS ====================

// Get team stats (USER)
const getTeamStats = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const teamReferrals = await models.TeamReferral.find({ userId })
      .populate('referredUserId', 'name phone createdAt')
      .lean();

    const levelA = teamReferrals.filter(ref => ref.level === 'A');
    const levelB = teamReferrals.filter(ref => ref.level === 'B');
    const levelC = teamReferrals.filter(ref => ref.level === 'C');

    const teamLevels = [
      {
        level: 'A',
        count: levelA.length,
        members: levelA.map(ref => ref.referredUserId),
      },
      {
        level: 'B',
        count: levelB.length,
        members: levelB.map(ref => ref.referredUserId),
      },
      {
        level: 'C',
        count: levelC.length,
        members: levelC.map(ref => ref.referredUserId),
      },
    ];

    const totalMembers = levelA.length + levelB.length + levelC.length;

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Team Stats",
      message: "Team statistics retrieved successfully",
      data: {
        totalMembers,
        teamLevels,
      },
    });
  } catch (error: any) {
    console.error('Get team stats error:', error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: error.message || "Failed to retrieve team statistics",
    });
  }
};

// Get referral link (USER)
const getReferralLink = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "User not authenticated",
      });
    }

    const user = await models.User.findById(userId);

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        title: "User Not Found",
        message: "User not found",
      });
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;
    const shareMessage = `Join our amazing platform using my referral code: ${user.referralCode}\n\nSign up here: ${referralLink}`;

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Referral Link",
      message: "Referral link retrieved successfully",
      data: {
        referralCode: user.referralCode,
        referralLink,
        shareMessage,
      },
    });
  } catch (error: any) {
    console.error('Get referral link error:', error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: error.message || "Failed to retrieve referral link",
    });
  }
};

// Get team members by level (USER)
const getTeamMembersByLevel = async (req: Request, res: Response) => {
  try {
    const userId = res.locals.userId;
    const { level } = req.params;

    if (!userId) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "User not authenticated",
      });
    }

    if (!['A', 'B', 'C'].includes(level)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Invalid Level",
        message: "Level must be A, B, or C",
      });
    }

    const teamReferrals = await models.TeamReferral.find({ 
      userId, 
      level 
    })
      .populate('referredUserId', 'name phone createdAt investmentAmount currentLevel')
      .lean();

    const members = teamReferrals.map((ref: any) => ({
      id: ref.referredUserId._id,
      name: ref.referredUserId.name,
      phone: ref.referredUserId.phone,
      joinedAt: ref.referredUserId.createdAt,
      currentLevel: ref.referredUserId.currentLevel || 'No Level',
      investmentAmount: ref.referredUserId.investmentAmount || 0,
    }));

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Team Members",
      message: "Team members retrieved successfully",
      data: {
        level,
        count: members.length,
        members,
      },
    });
  } catch (error: any) {
    console.error('Get team members error:', error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: error.message || "Failed to retrieve team members",
    });
  }
};

// ==================== ADMIN ENDPOINTS ====================

// Get all team referrals for admin (ADMIN)
const getAllTeamReferrals = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      level = ""
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (level && level !== "all") {
      filter.level = level;
    }

    // Apply search if provided
    let userIds: any[] = [];
    if (search) {
      const users = await models.User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select('_id');

      userIds = users.map(u => u._id);
      filter.$or = [
        { userId: { $in: userIds } },
        { referredUserId: { $in: userIds } }
      ];
    }

    // Fetch referrals with user details
    const [referrals, totalCount] = await Promise.all([
      models.TeamReferral.find(filter)
        .populate('userId', 'name phone picture createdAt')
        .populate('referredUserId', 'name phone picture createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.TeamReferral.countDocuments(filter)
    ]);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Team Referrals",
      message: "Team referrals fetched successfully.",
      data: {
        referrals,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        }
      }
    });
  } catch (err) {
    console.error("💥 Get all team referrals error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch team referrals.",
    });
  }
};

// Get team statistics (ADMIN)
const getTeamStatistics = async (req: Request, res: Response) => {
  try {
    const stats = await models.TeamReferral.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 }
        }
      }
    ]);

    const levelACount = stats.find(s => s._id === 'A')?.count || 0;
    const levelBCount = stats.find(s => s._id === 'B')?.count || 0;
    const levelCCount = stats.find(s => s._id === 'C')?.count || 0;
    const totalReferrals = levelACount + levelBCount + levelCCount;

    // Get top referrers
    const topReferrers = await models.TeamReferral.aggregate([
      {
        $group: {
          _id: "$userId",
          totalReferrals: { $sum: 1 }
        }
      },
      { $sort: { totalReferrals: -1 } },
      { $limit: 10 }
    ]);

    const referrerIds = topReferrers.map(r => r._id);
    const referrers = await models.User.find({
      _id: { $in: referrerIds }
    }).select('name phone picture');

    const topReferrersWithDetails = topReferrers.map(ref => {
      const user = referrers.find(u => u._id.toString() === ref._id.toString());
      return {
        userId: ref._id,
        user,
        totalReferrals: ref.totalReferrals
      };
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Team Statistics",
      message: "Statistics fetched successfully.",
      data: {
        totalReferrals,
        levelACount,
        levelBCount,
        levelCCount,
        topReferrers: topReferrersWithDetails
      }
    });
  } catch (err) {
    console.error("💥 Get team statistics error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch team statistics.",
    });
  }
};

// Get referral tree for a user (ADMIN)
const getReferralTree = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid user ID.",
        title: "Referral Tree",
      });
    }

    const user = await models.User.findById(userId).select('name phone picture');

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Referral Tree",
      });
    }

    // Get all referrals for this user
    const referrals = await models.TeamReferral.find({ userId })
      .populate('referredUserId', 'name phone picture')
      .sort({ level: 1, createdAt: -1 })
      .lean();

    // Group by level
    const levelA = referrals.filter(r => r.level === 'A');
    const levelB = referrals.filter(r => r.level === 'B');
    const levelC = referrals.filter(r => r.level === 'C');

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Referral Tree",
      message: "Referral tree fetched successfully.",
      data: {
        user,
        tree: {
          levelA: {
            count: levelA.length,
            members: levelA.map(r => r.referredUserId)
          },
          levelB: {
            count: levelB.length,
            members: levelB.map(r => r.referredUserId)
          },
          levelC: {
            count: levelC.length,
            members: levelC.map(r => r.referredUserId)
          }
        },
        totalReferrals: referrals.length
      }
    });
  } catch (err) {
    console.error("💥 Get referral tree error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch referral tree.",
    });
  }
};

export default {
  // User endpoints
  getTeamStats,
  getReferralLink,
  getTeamMembersByLevel,
  
  // Admin endpoints
  getAllTeamReferrals,
  getTeamStatistics,
  getReferralTree,
};