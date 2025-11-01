import { RequestHandler } from 'express';
import commonsUtils from '../utils';
import models from '../models';
import jwtConfig from '../services/jwt.service';

const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    console.log('🔐 Auth check - Cookies:', Object.keys(req.cookies || {}));
    console.log('🔐 Auth check - Headers:', req.headers.authorization ? 'Present' : 'Missing');

    // Try cookie first
    let token = req.cookies?.userAuth;
    
    // Fallback to Authorization header (CRITICAL for iOS and cross-origin)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        console.log('🎫 Using token from Authorization header');
      }
    } else {
      console.log('🍪 Using token from cookie');
    }

    if (!token) {
      console.log('❌ No token found');
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "No token provided",
      });
    }

    const decoded = jwtConfig.verifyJWT(token);
    if (!decoded?.id) {
      console.log('❌ Invalid token');
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        title: "Unauthorized",
        message: "Invalid token",
      });
    }

    const user = await models.User.findById(decoded.id).select("-password");
    if (!user) {
      console.log('❌ User not found');
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        title: "Not Found",
        message: "User not found",
      });
    }

    console.log('✅ User authenticated:', user._id);
    res.locals.userId = user._id;
    res.locals.user = user;

    // Reset daily stats
    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(user.lastIncomeResetDate || new Date()).setHours(0, 0, 0, 0);
    
    if (today > lastReset) {
      user.todayIncome = 0;
      user.todayTasksCompleted = 0;
      user.lastIncomeResetDate = new Date();
      await user.save();
    }

    // Reset monthly stats
    const currentMonth = new Date().getMonth();
    const lastMonthReset = new Date(user.lastMonthlyResetDate || new Date()).getMonth();
    
    if (currentMonth !== lastMonthReset) {
      user.monthlyIncome = 0;
      user.lastMonthlyResetDate = new Date();
      await user.save();
    }

    // Continue to next middleware
    next();
  } catch (err) {
    console.error('💥 Auth middleware error:', err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Authentication failed",
    });
  }
};

export default middleware;