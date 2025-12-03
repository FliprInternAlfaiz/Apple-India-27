import { Router } from 'express';
import { authController } from '../../controllers/authControllers';
import { commonsMiddleware } from '../../middleware';
import { Validators } from '../../validators';
import {
  handleMulterError,
  uploadProfileImage,
} from '../../middleware/upload.middleware';

const { userSignup, userLogin, getUserProfile, userLogout, updateUserProfile } =
  authController;

export default (router: Router) => {
  router.post('/user/login', userLogin);
  router.post(
    '/user/signup',
    commonsMiddleware.yupValidationMiddleware(Validators.userSignup),
    userSignup,
  );
  router.get('/user/profile', commonsMiddleware.checkUserAuth, getUserProfile);
  router.post('/user/logout', commonsMiddleware.checkUserAuth, userLogout);
  router.put(
    '/user/update',
    commonsMiddleware.checkUserAuth,
    uploadProfileImage,
    handleMulterError,
    updateUserProfile,
  );
};
