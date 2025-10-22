import { Router } from 'express';
import { authController } from '../../controllers/authControllers';
import { commonsMiddleware } from '../../middleware';
import { Validators } from '../../validators';


const { userSignup, userLogin, getUserProfile, userLogout } = authController;

export default (router: Router) => {
  router.post('/user/login', userLogin);
  router.post(
    '/user/signup',
    commonsMiddleware.yupValidationMiddleware(Validators.userSignup),
    userSignup,
  );
  router.post('/user/login/google', authController.userGoogleSSO);
  router.post('/user/profile', commonsMiddleware.checkUserAuth, getUserProfile);
  router.post('/user/logout', commonsMiddleware.checkUserAuth, userLogout);
  router.post('/user/forget-otp', authController.sendForgetOtp);
  router.post('/user/forget-otp/verify', authController.verifyForgetPassword);
  router.post(
    '/user/forget-password',
    commonsMiddleware.checkForgetAuth,
    authController.resetForgetPassword,
  );
  router.post('/user/otp/verify', authController.userSignupVerifyOtp);
  router.post('/user/login/googlePassword', authController.createPasswordOfGoogleUser);
  router.post('/user/login/googlePassword/OTPVerify', authController.createPasswordOTPVerifyOfGoogleUser);
};
