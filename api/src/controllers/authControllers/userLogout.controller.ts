import { NextFunction, Request, Response } from 'express';
import CONSTANTS from '../../constants/CONSTANTS';
import { JsonResponse } from '../../utils/jsonResponse';

export default async (_: Request, res: Response, __: NextFunction) => {

    const isProduction = process.env.NODE_ENV === "production";

    
   res.clearCookie(CONSTANTS.userTokenKey, {
     httpOnly: true,
 sameSite: isProduction ? "none" : "lax",
   secure: isProduction, 
      path: "/"
   });

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'logout successful',
  });
};
