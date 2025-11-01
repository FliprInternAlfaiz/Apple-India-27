import { ObjectId } from "mongodb";
import { Document, Model } from "mongoose";

export interface IOtp extends Document {
  userId?: ObjectId;
  phone?: string;
  otp: string;
  createdAt?: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generateOtp({ otp, userId, phone }: Partial<IOtp>): Promise<IOtp>;
  getOtp({ otp, userId, phone }: Partial<IOtp>): Promise<IOtp | null>;
  deleteOtp({ userId, phone }: Partial<IOtp>): Promise<void>;
}
