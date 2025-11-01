import { Request, Response } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    console.log(req.body)

    if (!name || !phone) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        title: "Missing Values",
        message: "Name, and phone are required.",
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

    const generatedOtp = commonsUtils.otp.generateSecureOTP();

    await models.Otp.deleteMany({ phone });

    await models.Otp.create({
      phone,
      otp: generatedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    console.log(`OTP sent to ${phone}: ${generatedOtp}`);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "OTP Sent",
      message: "OTP sent successfully to your phone number.",
    });
  } catch (error: any) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: error.message || "Something went wrong while sending OTP.",
    });
  }
};
