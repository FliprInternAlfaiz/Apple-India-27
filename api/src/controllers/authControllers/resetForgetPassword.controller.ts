import { Request, Response } from 'express';
import commonsUtils from "../../utils";
import models from '../../models';
import CONSTANTS from '../../constants/CONSTANTS';

const { JsonResponse } = commonsUtils;

export default async (req: Request, res: Response) => {
  const { password } = req.body;

  const userId = res.locals.userId;
  const otpId = res.locals.otpId;

  await models.User.updatePassword({
    id: userId,
    password: commonsUtils.encryptPassword(password),
  });

  await models.token.deleteForgetToken(otpId);

  res.clearCookie(CONSTANTS.forgetPasswordTokenKey);

  return JsonResponse(res, {
    status: 'success',
    statusCode: 200,
    title: 'user authentication',
    message: 'password reset successful',
  });
};
