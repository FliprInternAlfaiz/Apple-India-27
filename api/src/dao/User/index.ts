import { ObjectId } from 'mongodb';

import {
  IUser,
  IUserMethods,
} from '../../interface/user.interface';

export default {
  createUser: function (this: IUserMethods, user: IUser): Promise<IUser> {
    return this.create(user);
  },
  getById: function (
    this: IUserMethods,
    id: IUser['id'],
  ): Promise<IUser | null> {
    return this.findById(id);
  },
  findByEmail: function (this: IUserMethods, email: IUser['email']) {
    return this.findOne({ email: email });
  },
  createGoogleUser: function (this: IUserMethods, email: IUser['email'], name: IUser['name'], picture: IUser['picture']) {
    return this.create({ email, name, picture, isSSO: true });
  },  
  updatePassword(
    this: IUserMethods,
    { id, password }: { id: IUser['id']; password: IUser['password'] },
  ) {
    return this.findByIdAndUpdate(new ObjectId(id), { password });
  },
};
