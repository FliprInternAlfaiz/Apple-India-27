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

  updatePassword(
    this: IUserMethods,
    { id, password }: { id: IUser['id']; password: IUser['password'] },
  ) {
    return this.findByIdAndUpdate(new ObjectId(id), { password });
  },
};
