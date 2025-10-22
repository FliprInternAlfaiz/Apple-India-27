import { ObjectId} from 'mongodb';
import { Model, Query} from 'mongoose';

export interface IOtp extends Document {
  userId?: ObjectId;
  email?:string;
  otp: string;
  _id?: ObjectId;
}

type TQueryType = Query<IOtp, IOtp>;

export interface IOtpModel extends Model<IOtp> {
  generateOtp({ otp, userId, email}: Pick<IOtp, 'otp' | 'userId' | 'email'>): TQueryType;
  getOtp({ otp, userId, email }: Pick<IOtp, 'otp' | 'userId' | 'email'>): TQueryType;
  deleteOtp({ userId, email }: { userId?: ObjectId; email?: string }): TQueryType;
}
