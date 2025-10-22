import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import commonsUtils from "../../utils";
import models from '../../models';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, _: NextFunction) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'Email, OTP, and password are required',
      title: 'Invalid Fields Data',
    });
  }

  try {
 
    const user = await models.User.findOne({ email });
    if (!user) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 404,
        message: 'No account found with this email',
        title: 'Account Not Found',
      });
    }

    const storedOtp = await models.Otp.getOtp({
      otp,
      email,
    });

    if (!storedOtp || storedOtp.otp !== otp) {
      return JsonResponse(res, {
        status: 'error',
        statusCode: 400,
        message: 'We do not verify your OTP please do again!',
        title: 'Invalid OTP Please Try Again!',
      });
    }

    const saltRounds = 10;
    const hashedPassword = bcrypt.hashSync(newPassword, saltRounds);

    await models.User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          isSSO: false,
        },
      }
    );

    return JsonResponse(res, {
      status: 'success',
      statusCode: 200,
      message: 'OTP verified and Password is set successfully',
      title: 'Verify OTP and Password is set successfully',
    });
  } catch (error) {
    console.error('Error in Verify OTP and Update Password API:', error);
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'An error occurred while verifying OTP and updating password',
      title: 'Verify OTP and Update Password',
    });
  }
};
