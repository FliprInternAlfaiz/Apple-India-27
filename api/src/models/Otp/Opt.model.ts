import { Schema, model } from 'mongoose';
import dao from '../../dao/Otp';
import commonsUtils from '../../utils';
import { IOtp, IOtpModel  } from '../../interface/otp.interface';
const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, default: null },
    phone: { type: String, default: null },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 }, 
  },
  { timestamps: true },
);

commonsUtils.dbUtils.registerDaos(otpSchema, dao);

export default model<IOtp, IOtpModel>('otp', otpSchema);
