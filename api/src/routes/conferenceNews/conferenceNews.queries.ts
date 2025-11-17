import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import ConferenceNewsController from '../../controllers/ConferenceNewsControllers/ConferenceNews.controller';
import {
  handleMulterError,
  uploadConferenceNews,
} from '../../middleware/upload.middleware';

const {
  closeConferenceNews,
  createConferenceNews,
  deleteConferenceNews,
  getActiveConferenceNews,
  getAllConferenceNews,
  toggleConferenceNewsStatus,
  uploadConferenceNewsImage,
} = ConferenceNewsController;

export default (router: Router) => {
  // Public API: anyone can get active news
  router.get('/active', getActiveConferenceNews);

  // Admin-only: Upload image
  router.post(
    '/upload-image',
    commonsMiddleware.checkAdminAuth,
    uploadConferenceNews,
    handleMulterError,
    uploadConferenceNewsImage
  );

  // Admin-only: Create news
  router.post(
    '/create',
    commonsMiddleware.checkAdminAuth,
    createConferenceNews
  );

  // Admin-only: Get all news
  router.get(
    '/all',
    commonsMiddleware.checkAdminAuth,
    getAllConferenceNews
  );

  // Admin-only: Close news
  router.post(
    '/close/:newsId',
    commonsMiddleware.checkAdminAuth,
    closeConferenceNews
  );

  // Admin-only: Delete news
  router.delete(
    '/delete/:newsId',
    commonsMiddleware.checkAdminAuth,
    deleteConferenceNews
  );

  // Admin-only: Toggle status
  router.patch(
    '/toggle-status/:newsId',
    commonsMiddleware.checkAdminAuth,
    toggleConferenceNewsStatus
  );

  return router;
};
