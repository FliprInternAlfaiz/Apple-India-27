import { NextFunction, Request, Response } from 'express';
import { JsonResponse } from '../../utils/jsonResponse';

import models from '../../models';
export default async (req: Request, res: Response, _: NextFunction) => {

  try {

    let token = req.cookies?.userAuth;
    
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // Delete token from database if exists
    if (token) {
      try {
        await models.token.deleteOne({ token });
      } catch (err) {
        console.error('⚠️ Token deletion error:', err);
      }
    }

    // Clear cookie - IMPORTANT: Use same options as when setting
    const isProduction = process.env.NODE_ENV === "production";
    
    const clearOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
    };

    // Match domain if it was set during login
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (isProduction && cookieDomain && cookieDomain.trim() !== '') {
      const cleanDomain = cookieDomain.replace(/^https?:\/\//, '');
      if (cleanDomain && cleanDomain !== '') {
        clearOptions.domain = cleanDomain;
      }
    }

    res.clearCookie('userAuth', clearOptions);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Logout Success',
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('💥 Logout error:', err);
    // Still clear cookie even if error
    res.clearCookie('userAuth');
    
    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      title: 'Logout Success',
      message: 'Logged out successfully',
    });
  }
};

