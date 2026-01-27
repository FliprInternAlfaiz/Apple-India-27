import { RequestHandler } from 'express';
import commonsUtils from '../utils';
import models from '../models';
import jwtConfig from '../services/jwt.service';

const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    let token = req.cookies?.userAuth;

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

    const today = new Date().setHours(0, 0, 0, 0);
    const lastReset = new Date(user.lastIncomeResetDate || new Date()).setHours(
      0,
      0,
      0,
      0,
    );

    if (today > lastReset) {
      user.todayIncome = 0;
      user.todayTasksCompleted = 0;
      user.lastIncomeResetDate = new Date();
      await user.save();
    }

    const currentMonth = new Date().getMonth();
    const lastMonthReset = new Date(
      user.lastMonthlyResetDate || new Date(),
    ).getMonth();

    if (currentMonth !== lastMonthReset) {
      user.monthlyIncome = 0;
      user.lastMonthlyResetDate = new Date();
      await user.save();
    }

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
