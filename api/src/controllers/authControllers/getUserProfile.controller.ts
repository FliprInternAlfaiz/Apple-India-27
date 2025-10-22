import { NextFunction, Request, Response } from 'express';

import commonsUtils from "../../utils";
import models from '../../models';


const { JsonResponse } = commonsUtils;

export default async (_: Request, res: Response, __: NextFunction) => {
  const userId = res.locals.userId;

  const user = await models.User.getById(userId);

  const { password, ...userData } = user.toObject();

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    message: 'user profile fetched successfully',
    title: 'user authenticatio',
    data: userData,
  });
};
