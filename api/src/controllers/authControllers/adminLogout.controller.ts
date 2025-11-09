import { NextFunction, Request, Response } from 'express';

import CONSTANTS from '../../constants/CONSTANTS';
import { JsonResponse } from '../../utils/jsonResponse';

export default async (_: Request, res: Response, __: NextFunction) => {
  res.clearCookie(CONSTANTS.adminTokenKey);

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'logout successful',
  });
};
