import { Request, Response } from "express";
import models from "../../models";
import encryptPassword from "../../utils/encryptPassword";
import commonsUtils from "../../utils";
import { jwtConfig } from "../../services";
import { Types } from "mongoose"
import createTeamReferrals from "./referral.controller";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const { name, phone, password,referralCode } = req.body;

    if (!phone || !password || !name) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Required Fields",
        message: "All fields are required.",
      });
    }

    // Validate phone number format
    if (!/^\d{10}$/.test(phone)) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Invalid Phone",
        message: "Please enter a valid 10-digit phone number.",
      });
    }

    if (password.length < 6) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Weak Password",
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await models.User.findOne({ phone });
    if (existingUser) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "User Exists",
        message: "User already exists. Please login instead.",
      });
    }

     let referrer = null;
    if (referralCode) {
      referrer = await models.User.findOne({ referralCode });
      if (!referrer) {
        return JsonResponse(res, {
          status: "error",
          statusCode: 400,
          title: "Invalid Referral Code",
          message: "The referral code you entered is invalid.",
        });
      }
    }

    const hashedPassword = encryptPassword(password);

    const newUser = await models.User.create({
      name,
      phone,
      password: hashedPassword,
           referredBy: referrer ? referrer._id : undefined,
    });


     if (referrer) {
      await createTeamReferrals(referrer._id, newUser._id);
    }

    const token = jwtConfig.jwtService.generateJWT({ 
      phone: newUser.phone, 
      id: newUser.id! 
    });

    const authToken = await models.token.createToken({
      userId: new Types.ObjectId(newUser.id as string),
      token,
    });

    const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, 
    };

    const cookieDomain = process.env.COOKIE_DOMAIN;
    if (isProduction && cookieDomain && cookieDomain.trim() !== '') {
      const cleanDomain = cookieDomain.replace(/^https?:\/\//, '');
      if (cleanDomain && cleanDomain !== '') {
        cookieOptions.domain = cleanDomain;
      }
    }

    res.cookie('userAuth', authToken.token, cookieOptions);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Signup Success",
      message: "User signup successful",
      data: newUser,
    });
  } catch (error: any) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: error.message || "Something went wrong during signup.",
    });
  }
};