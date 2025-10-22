import { NextFunction, Request, Response } from 'express';

import { JsonResponse } from './jsonResponse';

export const asyncWrapper = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await fn(req, res, next);
    } catch (error: any) {
      return JsonResponse(res, {
        statusCode: 500,
        status: 'error',
        message: (error as Error).message,
        title: 'Something went wrong',
      });
    }
  };
};
