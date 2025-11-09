import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import userManagementController from '../../controllers/userManagment/userManagement.controller';

const {
  getAllUsers,
  getUserById,
  resetUserPassword,
  updateUserVerification,
  updateAadhaarVerification,
  toggleUserStatus,
  updateUserLevel,
} = userManagementController;

export default (router: Router) => {
  router.get('/users', commonsMiddleware.checkAdminAuth, getAllUsers);

  router.get(
    '/users/:userId',
    commonsMiddleware.checkAdminAuth,
    getUserById,
  );

  router.post(
    '/users/:userId/reset-password',
    commonsMiddleware.checkAdminAuth,
    resetUserPassword,
  );

  router.patch(
    '/users/:userId/verification',
    commonsMiddleware.checkAdminAuth,
    updateUserVerification,
  );

  router.patch(
    '/users/:userId/aadhaar-verification',
    commonsMiddleware.checkAdminAuth,
    updateAadhaarVerification,
  );

  router.patch(
    '/users/:userId/status',
    commonsMiddleware.checkAdminAuth,
    toggleUserStatus,
  );

  router.patch(
    '/users/:userId/level',
    commonsMiddleware.checkAdminAuth,
    updateUserLevel,
  );
};
