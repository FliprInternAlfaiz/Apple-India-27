import { Request, Response } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      title:"Missing Values",
      message: "Name, email, and phone are required.",
    });
  }

  const existingUser = await models.User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      title:"User Exist",
      message: "User already exists. Please login.",
    });
  }

  const generatedOtp = commonsUtils.otp.generateSecureOTP();
  await models.Otp.generateOtp({ email,phone, otp: generatedOtp });

  console.log(`OTP sent to ${phone}: ${generatedOtp}`); 

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    title:"OTP Sent",
    message: "OTP sent successfully",
  });
};
