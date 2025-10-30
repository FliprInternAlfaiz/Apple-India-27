import { RequestHandler } from 'express';

import commonsUtils from '../utils';
import CONSTANTS from '../constants/CONSTANTS';
import models from '../models';
import jwtConfig from '../services/jwt.service';

const { JsonResponse } = commonsUtils;

const middleware: RequestHandler = async (req, res, next) => {
  try {
    const cookie = req.cookies[CONSTANTS.userTokenKey];
    if (!cookie) throw new Error("unauthorized access");

    const tokenDoc = await models.token.getToken(cookie);
    if (!tokenDoc) throw new Error("unauthorized access");

    const { id, email } = jwtConfig.verifyJWT(tokenDoc.token);
    res.locals.userId = id;
    res.locals.userEmail = email;
    next();
  } catch {
    res.clearCookie(CONSTANTS.userTokenKey);
    return JsonResponse(res, {
      status: "error",
      statusCode: 401,
      message: "login to continue",
      title: "unauthorized access",
    });
  }
};


export default middleware;
