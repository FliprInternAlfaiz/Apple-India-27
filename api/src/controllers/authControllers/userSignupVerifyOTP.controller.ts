import { Request, Response } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { name, email, phone, resend = false } = req.body;

  if (!name || !email || !phone) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "Name, email, and phone are required.",
      title: "User Authentication",
    });
  }

  const existingUser = await models.User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "User with this email or phone already exists. Please login.",
      title: "User Authentication",
    });
  }

  if (resend) {
    const otpDoc = await models.Otp.findOne({ phone });
    if (otpDoc) {
      const generatedOtp = commonsUtils.otp.generateSecureOTP();
      otpDoc.otp = generatedOtp;
      await otpDoc.save();

      // Replace with your SMS provider API
      console.log(`Resent OTP for phone ${phone}: ${generatedOtp}`);

      return JsonResponse(res, {
        status: "success",
        statusCode: 200,
        message: "OTP resent successfully.",
        title: "OTP Verification",
      });
    }
  }

  const generatedOtp = commonsUtils.otp.generateSecureOTP();
  await models.Otp.generateOtp({ phone, otp: generatedOtp });

  // Replace with your SMS provider API
  console.log(`OTP sent to ${phone}: ${generatedOtp}`);

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    message: "OTP sent to your phone. Please verify to complete signup.",
    title: "OTP Verification",
  });
};
