// controllers/teamControllers/team.controller.ts
import { Request, Response } from "express";
import models from "../../models";
import commonsUtils from "../../utils";

const { JsonResponse } = commonsUtils;

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
      .populate('referredUserId', 'name phone createdAt')
      .lean();

    const members = teamReferrals.map((ref: any) => ({
      id: ref.referredUserId._id,
      name: ref.referredUserId.name,
      phone: ref.referredUserId.phone,
      joinedAt: ref.referredUserId.createdAt,
      currentLevel: level,
      investmentAmount: 0, // Add investment logic if needed
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

export default {
  getTeamStats,
  getReferralLink,
  getTeamMembersByLevel,
};