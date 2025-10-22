import { Request, Response } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { email, name, resend = false } = req.body;

  if (!name) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "Name is required.",
      title: "User Authentication",
    });
  }

  if (resend) {
    const otpDoc = await models.Otp.findOne({ email });

    if (otpDoc) {
      const generatedOtp = commonsUtils.otp.generateSecureOTP();
      otpDoc.otp = generatedOtp;
      await otpDoc.save();

      console.log(`Resend OTP For SignUp is :  ${otpDoc.otp}`);

      return JsonResponse(res, {
        status: "success",
        statusCode: 200,
        message: "OTP has been resent to your email. Please verify.",
        title: "OTP Verification",
      });
    } else {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "No OTP found for this email. Please request OTP first.",
        title: "User Authentication",
      });
    }
  }

  const user = await models.User.findByEmail(email);

  if (user) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 400,
      message: "Email is already registered. Please login.",
      title: "User Authentication",
    });
  }

  const generatedOtp = commonsUtils.otp.generateSecureOTP();
  const otpDoc = await models.Otp.generateOtp({
    email: email,
    otp: generatedOtp,
  });

  if (!otpDoc?.otp) {
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "OTP generation failed.",
      title: "User Authentication",
    });
  }

  console.log(`OTP For SignUp is :  ${otpDoc.otp}`);

  return JsonResponse(res, {
    status: "success",
    statusCode: 200,
    message: "OTP sent to your email. Please verify to complete signup.",
    title: "OTP Verification",
  });
};
