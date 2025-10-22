import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import lib from '../../lib';
import commonsUtils from '../../utils';
import models from '../../models';
import { jwtConfig } from '../../services';
import CONSTANTS from '../../constants/CONSTANTS';


const { JsonResponse } = commonsUtils;

export default async (
  req: Request<any, any, { idToken: string }>,
  res: Response,
  _next: NextFunction,
) => {
  const { idToken } = req.body;
  
  if (!idToken) {
    return JsonResponse(res, {
      statusCode: 400,
      status: 'error',
      title: 'Login Failed',
      message: 'Something went wrong. Please try again.',
    });
  }

  const payload = await lib.firebaseAuthAdmin.verifyGoogleAuthToken(idToken);

  if (!payload?.email) {
    return JsonResponse(res, {
      statusCode: 400,
      status: 'error',
      title: 'Login Failed',
      message: 'Something went wrong. Please try again.',
    });
  }

  const { email: googleEmail ,name,picture} = payload;

  let userData = await models.User.findByEmail(googleEmail);
  if (!userData)
    userData = await models.User.createGoogleUser(googleEmail, name, picture??'');

  const token = jwtConfig.jwtService.generateJWT({
    email: googleEmail,
    id: userData.id,
  });

  const authToken = await models.token.createToken({
    userId: new ObjectId(userData.id),
    token: token,
  });
  

  if (!authToken) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 400,
      title: 'Login Failed',
      message: 'Something went wrong. Please try again.',
    });
  }

  res.cookie(CONSTANTS.userTokenKey, authToken.token, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  return JsonResponse(res, {
    statusCode: 200,
    status: 'success',
    title: 'Login Successful',
    message: 'You have successfully logged in.',
  });
};