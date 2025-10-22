import { asyncWrapper } from '../../utils/asyncWrapper.utils';
import createGoogleUserPasswordController from './createGoogleUserPassword.controller';
import createGoogleUserPassworrdOTPVerifyController from './createGoogleUserPassworrdOTPVerify.controller';
import getUserProfileController from './getUserProfile.controller';
import resetForgetPasswordController from './resetForgetPassword.controller';
import sendForgetPasswordOTPController from './sendForgetPasswordOTP.controller';
import userGoogleSSOController from './userGoogleSSO.controller';
import userLoginController from './userLogin.controller';
import userLogoutController from './userLogout.controller';
import userSignupController from './userSignup.controller';
import userSignupVerifyOTPController from './userSignupVerifyOTP.controller';
import verifyForgetPasswordOTPController from './verifyForgetPasswordOTP.controller';


export const authController = {
  userLogin: asyncWrapper(userLoginController),
  userSignup: asyncWrapper(userSignupController),
  userSignupVerifyOtp: asyncWrapper(userSignupVerifyOTPController),
  userLogout: asyncWrapper(userLogoutController),
  getUserProfile: asyncWrapper(getUserProfileController),
  userGoogleSSO: asyncWrapper(userGoogleSSOController),
  sendForgetOtp: asyncWrapper(sendForgetPasswordOTPController),
  verifyForgetPassword: asyncWrapper(verifyForgetPasswordOTPController),
  resetForgetPassword: asyncWrapper(resetForgetPasswordController),
  createPasswordOfGoogleUser: asyncWrapper(createGoogleUserPasswordController),
  createPasswordOTPVerifyOfGoogleUser: asyncWrapper(
    createGoogleUserPassworrdOTPVerifyController,
  )
};
