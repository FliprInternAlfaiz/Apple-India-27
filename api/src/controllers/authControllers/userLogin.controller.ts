import bcrypt from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import commonsUtils from '../../utils';
import models from '../../models';
import { jwtConfig } from '../../services';
import CONSTANTS from '../../constants/CONSTANTS';


const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response, __: NextFunction) => {
  const { email, password } = req.body;

  const user = await models.User.findByEmail(email);

  if (!user) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'cannot find account associated with this email',
      title: 'user authentication',
    });
  }

  if (user.isSSO === true) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'This account uses has SSO',
      title: 'User Authentication',
      data: user,
    });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password);

  if (!isValidPassword) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      message: 'invalid password',
      title: 'user authentication',
    });
  }

  user.lastActiveDate = new Date();
  await user.save();

  const token = jwtConfig.jwtService.generateJWT({ email: user.email, id: user.id! });

  const authToken = await models.token.createToken({
    userId: new ObjectId(user.id as string),
    token: token,
  });

  res.cookie(CONSTANTS.userTokenKey, authToken.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  const { password: _, ...userData } = user.toObject();

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'user login successful',
    data: userData,
  });
};
