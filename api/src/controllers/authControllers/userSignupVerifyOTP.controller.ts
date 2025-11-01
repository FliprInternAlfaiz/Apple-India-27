import { Request, Response } from "express";
import models from "../../models";
import encryptPassword from "../../utils/encryptPassword";
import commonsUtils from "../../utils";
import { jwtConfig } from "../../services";
import CONSTANTS from "../../constants/CONSTANTS";
import { ObjectId } from 'mongodb';


const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {

  const isProduction = process.env.NODE_ENV === "production";

  const { name, email, phone, password, otp } = req.body;

  if (!phone || !otp || !password || !name || !email) {
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
    email,
    phone,
    password: hashedPassword,
  });

  await models.Otp.deleteOne({ phone });

  const token = jwtConfig.jwtService.generateJWT({ email: newUser.email, id: newUser.id! });

    const authToken = await models.token.createToken({
      userId: new ObjectId(newUser.id as string),
      token,
    });

 res.cookie('userAuth', authToken.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    title:"Sign Success",
    message: "User signup successful",
    data: newUser,
  });
};
