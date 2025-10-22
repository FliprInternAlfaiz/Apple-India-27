import { NextFunction, Request, Response } from 'express';
import commonsUtils from '../../utils';
import lib from '../../lib';
import models from '../../models';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, _: NextFunction) => {
  const { email } = req.body;

  if (!email) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'Email is required',
      title: 'Send OTP',
    });
  }

  try {
    const user = await models.User.findOne({ email });

    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'No account found with this email',
        title: 'Send OTP',
      });
    }

    const otp = commonsUtils.otp.generateSecureOTP();

    const otpDoc = await models.Otp.generateOtp({
      email: email,
      otp,
    });

    if (!otpDoc?.otp) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 500,
        message: 'Error generating OTP',
        title: 'Send OTP',
      });
    }

    console.log(`OTP for Verify Google Account: ${otpDoc.otp}`);

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      message:
        'OTP sent to your email. Please verify to complete setup of password.',
      title: 'Send OTP',
    });
  } catch (error) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while sending OTP',
      title: 'Send OTP',
    });
  }
};
