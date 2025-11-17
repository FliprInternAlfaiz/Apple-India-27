import { Document, Model, Types} from "mongoose";

export interface IOtp extends Document {
  userId?: Types.ObjectId;
  phone?: string;
  otp: string;
  createdAt?: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generateOtp({ otp, userId, phone }: Partial<IOtp>): Promise<IOtp>;
  getOtp({ otp, userId, phone }: Partial<IOtp>): Promise<IOtp | null>;
  deleteOtp({ userId, phone }: Partial<IOtp>): Promise<void>;
}
