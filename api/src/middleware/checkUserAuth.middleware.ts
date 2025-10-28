import { RequestHandler } from 'express';

import commonsUtils from '../utils';
import CONSTANTS from '../constants/CONSTANTS';
import models from '../models';
import jwtConfig from '../services/jwt.service';

const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    const cookie = req.cookies[CONSTANTS.userTokenKey];
    if (!cookie) throw new Error('unauthorized access');
    
    const token = await models.token.getToken(cookie);

    if (!token) throw new Error('unauthorized access');

    const { email, id } = jwtConfig.verifyJWT(token.token);
    res.locals.userId = id;
    res.locals.userEmail = email;

    return next();
  } catch (error) {
    res.clearCookie('userAuth');
    return JsonResponse(res, {
      status: 'error',
      statusCode: 401,
      message: 'login to continue',
      title: 'unauthorized access',
    });
  }
};

export default middleware;
