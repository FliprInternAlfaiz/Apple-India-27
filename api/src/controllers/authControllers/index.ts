import { asyncWrapper } from '../../utils/asyncWrapper.utils';
import getUserProfileController from './getUserProfile.controller';
import userLoginController from './userLogin.controller';
import userLogoutController from './userLogout.controller';
import userSignupController from './userSignup.controller';

export const authController = {
  userLogin: asyncWrapper(userLoginController),
  userSignup: asyncWrapper(userSignupController),
  userLogout: asyncWrapper(userLogoutController),
  getUserProfile: asyncWrapper(getUserProfileController),
};
