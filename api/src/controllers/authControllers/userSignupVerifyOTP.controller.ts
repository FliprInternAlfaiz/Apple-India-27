import { Request, Response } from "express";
import models from "../../models";
import encryptPassword from "../../utils/encryptPassword";
import commonsUtils from "../../utils";
import { jwtConfig } from "../../services";
import { ObjectId } from 'mongodb';


const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {

  const isProduction = process.env.NODE_ENV === "production";

  const { name, phone, password, otp } = req.body;

  if (!phone || !otp || !password || !name ) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      title:"Required Fields",
      message: "All fields are required.",
    });
  }

  const storedOtp = await models.Otp.findOne({ phone });
  if (!storedOtp || storedOtp.otp !== otp) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      title:"Required OTP",
      message: "Invalid OTP.",
    });
  }

  const hashedPassword = encryptPassword(password);

  const newUser = await models.User.create({
    name,
    phone,
    password: hashedPassword,
  });

  await models.Otp.deleteOne({ phone });

  const token = jwtConfig.jwtService.generateJWT({ phone: newUser.phone, id: newUser.id! });

    const authToken = await models.token.createToken({
      userId: new ObjectId(newUser.id as string),
      token,
    });

 const cookieOptions: any = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };

    // Don't set domain for cross-origin (Render + Netlify)
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
    title:"Sign Success",
    message: "User signup successful",
    data: newUser,
  });
};
