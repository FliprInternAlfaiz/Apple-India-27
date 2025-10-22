import { Schema, model } from 'mongoose';
import dao from '../../dao/Token';
import { IAuthModel, IAuthToken } from '../../interface/authToken.interface';
import commonsUtils from '../../utils';

const schema = new Schema<IAuthToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    token: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ['forget-password', 'login'],
    },
  },
  { timestamps: true },
);

commonsUtils.dbUtils.registerDaos(schema, dao);

const tokenModel: IAuthModel = model<IAuthToken, IAuthModel>('token', schema);

export default tokenModel;
