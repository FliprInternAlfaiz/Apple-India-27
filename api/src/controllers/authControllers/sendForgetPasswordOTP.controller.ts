import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import models from '../../models';
import commonsUtils from '../../utils';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, _: NextFunction) => {
  const { email } = req.body;

  const user = await models.User.findByEmail(email);

  if (!user) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 404,
      message: 'unregistered email kindly signup to continue...',
      title: 'user authentication',
    });
  }

  const otp = commonsUtils.otp.generateSecureOTP();

  const otpDoc = await models.Otp.generateOtp({
    userId: new ObjectId(user.id),
    otp,
  });

  if (!otpDoc?.otp) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'otp generation error',
      title: 'user authentication',
    });
  }

  console.log(`OTP For Reset Password is :  ${otpDoc.otp}`);

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'otp sent successfully',
    data: {
      otp: process.env.NODE_ENV === 'test' ? otpDoc.otp : undefined,
    },
  });
};
