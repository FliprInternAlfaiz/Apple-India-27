import { ObjectId } from 'mongodb';
import { Model, Query } from 'mongoose';

export interface IAuthToken extends Document {
  token: string;
  userId: ObjectId;
  purpose: 'login' | 'forget-password';
  id?: string;
}

type TQueryType = Query<IAuthToken, IAuthToken>;

export interface IAuthModel extends Model<IAuthToken> {
  createToken({
    token,
    userId,
  }: Pick<IAuthToken, 'token' | 'userId'>): TQueryType;
  getToken(token: IAuthToken['token']): TQueryType;
  deleteToken(token: IAuthToken['token']): TQueryType;
  createForgetToken({
    token,
    userId,
  }: Pick<IAuthToken, 'token' | 'userId'>): TQueryType;
  getForgetToken(token: IAuthToken['token']): TQueryType;
  deleteForgetToken(id: IAuthToken['id']): TQueryType;
}
