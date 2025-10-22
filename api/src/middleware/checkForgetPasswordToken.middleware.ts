import { RequestHandler } from 'express';
import commonsUtils from '../utils';
import CONSTANTS from '../constants/CONSTANTS';
import models from '../models';
import { jwtConfig } from '../services';


const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    const cookie = req.cookies[CONSTANTS.forgetPasswordTokenKey];
    if (!cookie) throw new Error('unauthorized access');

    const token = await models.token.getForgetToken(cookie);
    if (!token) throw new Error('unauthorized access');

    const { userId, otpId } = jwtConfig.jwtService.verifyForgeyJWT(
      token.token,
    );
    res.locals.userId = userId;
    res.locals.otpId = otpId;

    return next();
  } catch (error) {
    return JsonResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'verify otp to update password',
      title: 'unauthorized access',
    });
  }
};

export default middleware;
