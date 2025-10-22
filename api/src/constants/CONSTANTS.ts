import path from 'path';

export default {
  userTokenKey: 'userAuth',
  firebaseServiceAccountFilePath: path.join(
    __dirname,
    '..',
    'config',
    'service-account-key.json',
  ),
  forgetPasswordTokenKey: 'fpwd',
  JWT_EXPIRATION_TIME: 24 * 60 * 60,
  FORGET_JWT_EXPIRATION_TIME: 12 * 60 * 60,
  adminTokenKey: 'adminAuth',
};
