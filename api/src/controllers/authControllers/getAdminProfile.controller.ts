import { NextFunction, Request, Response } from 'express';
import { adminDao } from '../../dao/admin';
import { JsonResponse } from '../../utils/jsonResponse';


export default async (_: Request, res: Response, __: NextFunction) => {
  const userId = res.locals.userId;

  const user = await adminDao.getById(userId);
  if (!user) {
    return JsonResponse(res, {
      message: 'Admin not found',
      status: 'error',
      statusCode: 400,
      title: 'Admin details not found',
    });
  }
  const { password, ...adminData } = user.toObject();

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    message: 'Admin profile fetched successfully',
    title: 'Admin authentication',
    data: adminData,
  });
};
