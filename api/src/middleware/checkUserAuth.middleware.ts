import { RequestHandler } from 'express';
import commonsUtils from '../utils';
import models from '../models';
import jwtConfig from '../services/jwt.service';

const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    let token = req.cookies?.userAuth;

    // Fallback to Authorization header (CRITICAL for iOS and cross-origin)
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 401,
        title: 'Unauthorized',
        message: 'No token provided',
      });
    }

    const decoded = jwtConfig.verifyJWT(token);
    if (!decoded?.id) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 401,
        title: 'Unauthorized',
        message: 'Invalid token',
      });
    }

    const user = await models.User.findById(decoded.id).select('-password');
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        title: 'Not Found',
        message: 'User not found',
      });
    }
    res.locals.userId = user._id;
    res.locals.user = user;

    const getStartOfTodayIST = (): Date => {
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istTime = new Date(now.getTime() + istOffset);
      istTime.setUTCHours(0, 0, 0, 0);
      return new Date(istTime.getTime() - istOffset); // Convert back to UTC
    };

    const startOfToday = getStartOfTodayIST();
    const lastResetDate = user.lastIncomeResetDate ? new Date(user.lastIncomeResetDate) : null;
    
    const shouldReset = !lastResetDate || lastResetDate < startOfToday;

    if (shouldReset && (user.todayIncome > 0 || user.todayTasksCompleted > 0)) {
      user.todayIncome = 0;
      user.todayTasksCompleted = 0;
      user.lastIncomeResetDate = new Date();
      await user.save();
    }

    // Reset monthly stats
    const currentMonth = new Date().getMonth();
    const lastMonthReset = new Date(
      user.lastMonthlyResetDate || new Date(),
    ).getMonth();

    if (currentMonth !== lastMonthReset) {
      user.monthlyIncome = 0;
      user.lastMonthlyResetDate = new Date();
      await user.save();
    }

    // Continue to next middleware
    next();
  } catch (err) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      title: 'Server Error',
      message: 'Authentication failed',
    });
  }
};

export default middleware;
