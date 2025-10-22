import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import commonsUtils from '../../utils';
import models from '../../models';
import { jwtConfig } from '../../services';
import CONSTANTS from '../../constants/CONSTANTS';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, _: NextFunction) => {
  const { otp, email } = req.body;

  const user = await models.User.findByEmail(email);

  if (!user)
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'signup to continue...',
      title: 'user authentication',
    });

  const storedOtp = await models.Otp.getOtp({
    otp,
    userId: new ObjectId(user.id),
  });

  if (storedOtp?.otp !== otp)
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'invalid otp',
      title: 'user authentication',
    });

  const forgetPasswordJWT = jwtConfig.jwtService.generateForgetJWT({
    otpId: storedOtp._id!.toString(),
    userId: user.id,
  });

  const forgetToken = await models.token.createForgetToken({
    token: forgetPasswordJWT,
    userId: new ObjectId(user.id),
  });

  res.cookie(CONSTANTS.forgetPasswordTokenKey, forgetToken.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  await models.Otp.deleteOtp({
    userId: new ObjectId(user.id)
  });

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'otp verification successful',
  });
};
