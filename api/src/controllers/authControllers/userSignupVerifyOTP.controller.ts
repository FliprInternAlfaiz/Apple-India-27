import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import commonsUtils from '../../utils';
import models from '../../models';
import { jwtConfig } from '../../services';
import CONSTANTS from '../../constants/CONSTANTS';
import encryptPassword from '../../utils/encryptPassword';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { email, password, name,otp } = req.body;
  const validPassword = encryptPassword(password);

  const storedOtp = await models.Otp.getOtp({
    otp,
    email: email,
  });

  if (storedOtp?.otp !== otp)
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'invalid otp',
      title: 'user authentication',
    });

  const newUser = await models.User.createUser({
    name,
    email,
    password: validPassword,
  });

  if (!newUser) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 500,
      message: 'Unable to create user. Please try again.',
      title: 'Internal Server Error',
    });
  }

  await models.Otp.deleteOne({ email });

  const token = jwtConfig.jwtService.generateJWT({
    email: newUser.email,
    id: newUser.id!,
  });

  const authToken = await models.token.createToken({
    userId: new ObjectId(newUser.id as string),
    token: token,
  });

  res.cookie(CONSTANTS.userTokenKey, authToken.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    message: 'User signup successful.',
    title: 'User Authentication',
    data: newUser,
  });
};
