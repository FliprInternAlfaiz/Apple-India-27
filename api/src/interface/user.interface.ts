import { Document, Model, ObjectId, Query } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  id: string;
  name:string;
  lastActiveDate?: Date | null;
  picture?: string; 
  isSSO?: boolean;
  _id: ObjectId;
}

type TQueryType = Query<IUser, IUser>;

export interface IUserMethods extends Model<IUser> {
  createUser(user: Pick<IUser,'name'|'email' | 'password'>): TQueryType;
  createGoogleUser(email: string, name: string, picture: string): Promise<IUser>;
  getById(id: IUser['id']): TQueryType;
  findByEmail(email: IUser['email']): TQueryType;
  updatePassword(_: {
    id: IUser['id'];
    password: IUser['password'];
  }): TQueryType;
}