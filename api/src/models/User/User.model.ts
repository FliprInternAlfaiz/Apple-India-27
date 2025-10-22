import { Schema, model } from 'mongoose';

import commonsUtils from '../../utils';
import dao from '../../dao/User';
import { IUser, IUserMethods } from '../../interface/user.interface';

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    lastActiveDate: {
      type: Date,
      default: null,
    },
    isSSO: {
      type: Boolean,
      default: false,
    },
    picture: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

commonsUtils.dbUtils.registerDaos(schema, dao);

commonsUtils.dbUtils.handleDuplicates(schema, 'email');

const userModel: IUserMethods = model<IUser, IUserMethods>('user', schema);
export default userModel;
