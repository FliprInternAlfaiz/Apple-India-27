import { asyncWrapper } from '../../utils/asyncWrapper.utils';
import { adminLogin } from './adminLogin.controller';
import adminLogoutController from './adminLogout.controller';
import { createAdmin } from './createAdmin.controller';
import getAdminProfileController from './getAdminProfile.controller';
import getUserProfileController from './getUserProfile.controller';
import userLoginController from './userLogin.controller';
import userLogoutController from './userLogout.controller';
import userSignupController from './userSignup.controller';
import updateUserProfile from "./updateUserProfile.controller"

export const authController = {
  userLogin: asyncWrapper(userLoginController),
  userSignup: asyncWrapper(userSignupController),
  userLogout: asyncWrapper(userLogoutController),
  getUserProfile: asyncWrapper(getUserProfileController),
  adminLogin:  asyncWrapper(adminLogin),
  getAdminProfile: asyncWrapper(getAdminProfileController),
  createAdmin: asyncWrapper(createAdmin),
  adminLogout: asyncWrapper(adminLogoutController),
  updateUserProfile : asyncWrapper(updateUserProfile)
};
