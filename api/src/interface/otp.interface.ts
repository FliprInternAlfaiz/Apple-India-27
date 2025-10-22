import { ObjectId } from "mongodb";
import { Document, Model } from "mongoose";

export interface IOtp extends Document {
  userId?: ObjectId;
  email?: string;
  phone?: string;   // added for phone-based OTP
  otp: string;
  createdAt?: Date;
  expiresAt?: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generateOtp(params: {
    otp: string;
    userId?: ObjectId;
    email?: string;
    phone?: string;
  }): Promise<IOtp>;

  getOtp(params: {
    otp: string;
    userId?: ObjectId;
    email?: string;
    phone?: string;
  }): Promise<IOtp | null>;

  deleteOtp(params: {
    userId?: ObjectId;
    email?: string;
    phone?: string;
  }): Promise<{ deletedCount?: number }>;
}
