import checkForgetAuth from './checkForgetPasswordToken.middleware';
import checkUserAuth from './checkUserAuth.middleware';
import checkAdminAuth from './checkAdminAuth.middleware';
import { yupValidationMiddleware } from './yupValidation.middleware';

export const commonsMiddleware = {
  checkUserAuth,
  checkForgetAuth,
  yupValidationMiddleware,
  checkAdminAuth,
};
