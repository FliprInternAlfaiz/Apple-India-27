import { Router } from 'express';
import { commonsMiddleware } from '../../middleware';
import verificationController from '../../controllers/verificationController/verification.controller';
import {
  handleMulterError,
  uploadAadhaarFile,
} from '../../middleware/upload.middleware';

const { uploadAadhaarVerification, getVerificationStatus, uploadAadhaarPhoto } =
  verificationController;

export default (router: Router) => {
  router.post(
    '/upload-photo',
    commonsMiddleware.checkUserAuth,
    uploadAadhaarFile,
    handleMulterError,
    uploadAadhaarPhoto,
  );

  router.post(
    '/upload-aadhaar',
    commonsMiddleware.checkUserAuth,
    uploadAadhaarVerification,
  );

  router.get('/status', commonsMiddleware.checkUserAuth, getVerificationStatus);

  return router;
};
