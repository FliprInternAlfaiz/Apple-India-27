import { Router } from 'express';
import { authController } from '../../controllers/authControllers';
import { commonsMiddleware } from '../../middleware';
import { Validators } from '../../validators';


const { userSignup, userLogin, getUserProfile, userLogout } = authController;

export default (router: Router) => {
  router.post('/user/login', userLogin);
  router.post(
    "/user/signup",
    commonsMiddleware.yupValidationMiddleware(Validators.userSignup),
    userSignup
  );
  router.get('/user/profile', commonsMiddleware.checkUserAuth, getUserProfile);
  router.post('/user/logout', commonsMiddleware.checkUserAuth, userLogout);
  router.post('/user/otp/verify', authController.userSignupVerifyOtp);
};
