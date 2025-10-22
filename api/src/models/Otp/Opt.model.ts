import { Schema, model } from 'mongoose';
import dao from '../../dao/Otp';
import commonsUtils from '../../utils';
import { IOtp, IOtpModel } from '../../interface/otp.interface';

const schema = new Schema<IOtp>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false,  
    },
    email: {
      type: String,
      required: false,  
    },
    otp: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

commonsUtils.dbUtils.registerDaos(schema, dao);

export default model<IOtp, IOtpModel>('otp', schema);
