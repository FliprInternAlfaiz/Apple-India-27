import { JwtPayload } from 'jsonwebtoken';

export interface ISessionData extends JwtPayload {
  id: string;
  phone?: string;
  email?:string;
}

export interface IForgetToken extends JwtPayload {
  userId: string;
  otpId: string;
}
