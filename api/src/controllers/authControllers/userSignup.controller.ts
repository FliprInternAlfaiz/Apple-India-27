import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import commonsUtils from "../../utils";
import models from "../../models";
import { jwtConfig } from "../../services";
import CONSTANTS from "../../constants/CONSTANTS";
import encryptPassword from "../../utils/encryptPassword";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { name, email, phone, password, otp } = req.body;

  if (!otp || !phone) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "OTP and phone number are required.",
      title: "User Authentication",
    });
  }

  const storedOtp = await models.Otp.findOne({ phone });
  if (!storedOtp || storedOtp.otp !== otp) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "Invalid OTP.",
      title: "User Authentication",
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

  const token = jwtConfig.jwtService.generateJWT({
    email: newUser.email,
    id: newUser.id!,
  });

  const authToken = await models.token.createToken({
    userId: new ObjectId(newUser.id as string),
    token,
  });

  res.cookie(CONSTANTS.userTokenKey, authToken.token, {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    message: "User signup successful.",
    title: "User Authentication",
    data: newUser,
  });
};
