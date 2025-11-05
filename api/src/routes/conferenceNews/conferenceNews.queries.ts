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
  router.get('/active', getActiveConferenceNews);

  router.post(
    '/upload-image',
    commonsMiddleware.checkUserAuth,
    uploadConferenceNews,
    handleMulterError,
    uploadConferenceNewsImage,
  );

  router.post('/create', createConferenceNews);

  router.get('/all', commonsMiddleware.checkUserAuth, getAllConferenceNews);

  router.post('/close/:newsId', closeConferenceNews);

  router.delete(
    '/delete/:newsId',
    commonsMiddleware.checkUserAuth,
    deleteConferenceNews,
  );

  router.patch(
    '/toggle-status/:newsId',
    commonsMiddleware.checkUserAuth,
    toggleConferenceNewsStatus,
  );

  return router;
};
