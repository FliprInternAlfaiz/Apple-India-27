import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import commonsUtils from "../../utils";
import models from "../../models";
import { jwtConfig } from "../../services";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, __: NextFunction) => {
  try {
    const { phone, password } = req.body;

    console.log('🔑 Login attempt for:', phone);
    console.log('🌍 Environment:', process.env.NODE_ENV);

    if (!phone || !password) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Phone and password are required.",
        title: "User Authentication",
      });
    }

    const isProduction = process.env.NODE_ENV === "production";

    const user = await models.User.findOne({ phone });

    if (!user) {
      console.log('❌ User not found:', phone);
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "No account found with this phone number.",
        title: "User Authentication",
      });
    }

    if (user.isSSO) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 401,
        message: "This account uses SSO.",
        title: "User Authentication",
      });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', phone);
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Invalid password.",
        title: "User Authentication",
      });
    }

    user.lastActiveDate = new Date();
    await user.save();

    const token = jwtConfig.jwtService.generateJWT({
      phone: user.phone,
      id: user.id!,
    });

    const authToken = await models.token.createToken({
      userId: new ObjectId(user.id as string),
      token,
    });

    console.log('✅ Token generated');

    // FIXED: Cookie configuration for production deployment
    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction, // true in production, false in dev
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    // IMPORTANT: For Render.com + Netlify on different domains,
    // DO NOT set domain option - let browser handle it
    // Only set domain if both frontend and backend are on same root domain
    // Example: api.example.com and www.example.com (same root: example.com)
    
    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (isProduction && cookieDomain && cookieDomain.trim() !== '') {
      // Remove protocol if accidentally included
      const cleanDomain = cookieDomain.replace(/^https?:\/\//, '');
      if (cleanDomain && cleanDomain !== '') {
        cookieOptions.domain = cleanDomain;
      }
    }

    console.log('🍪 Setting cookie with options:', cookieOptions);

    res.cookie('userAuth', authToken.token, cookieOptions);

    const { password: _, ...userData } = user.toObject();

    // CRITICAL: Return token in response for iOS and cross-origin scenarios
    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "User Authentication",
      message: "User login successful.",
      data: {
        user: userData,
        token: authToken.token, // IMPORTANT: Include token for client-side storage
      },
    });
  } catch (err) {
    console.error('💥 Login error:', err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Login failed. Please try again.",
    });
  }
};
