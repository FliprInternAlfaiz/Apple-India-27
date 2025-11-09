import { Router } from 'express';
import { authController } from '../../controllers/authControllers';
import { commonsMiddleware } from '../../middleware';


export default (router: Router) => {
  router.post('/admin/login', authController.adminLogin);
  router.post('/admin/create', authController.createAdmin);
  router.post(
    '/admin/profile',
    commonsMiddleware.checkAdminAuth,
    authController.getAdminProfile,
  );
  router.post(
    '/admin/logout',
    commonsMiddleware.checkAdminAuth,
    authController.adminLogout,
  );
};
