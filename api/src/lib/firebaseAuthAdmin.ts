import admin from 'firebase-admin';
import CONSTANTS from '../constants/CONSTANTS';


const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(CONSTANTS.firebaseServiceAccountFilePath),
});

const verifyGoogleAuthToken = async (token: string) => {
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    return null;
  }
};

export default { verifyGoogleAuthToken, firebaseAdmin };
