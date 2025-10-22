import jwt from 'jsonwebtoken';
import CONSTANTS from '../constants/CONSTANTS';
import { IForgetToken, ISessionData } from '../interface/jwt.interface';


const generateJWT = (payload: ISessionData) => {
  const expiresIn = CONSTANTS.JWT_EXPIRATION_TIME;
  return jwt.sign(payload, `${process.env.JWT_SECRET}`, { expiresIn });
};

const generateForgetJWT = (payload: IForgetToken) => {
  const expiresIn = CONSTANTS.FORGET_JWT_EXPIRATION_TIME;
  return jwt.sign(payload, `${process.env.FORGET_JWT_SECRET}`, { expiresIn });
};

const verifyForgeyJWT = (token: string) => {
  return jwt.verify(token, `${process.env.FORGET_JWT_SECRET}`) as IForgetToken;
};

const verifyJWT = (token: string) => {
  return jwt.verify(token, `${process.env.JWT_SECRET}`) as ISessionData;
};

export default {
  generateJWT,
  verifyJWT,
  generateForgetJWT,
  verifyForgeyJWT,
};
