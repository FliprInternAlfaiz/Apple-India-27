import { ObjectId } from "mongodb";
import { Document, Model } from "mongoose";

export interface IOtp extends Document {
  userId?: ObjectId;
  email?: string;
  phone?: string;
  otp: string;
  createdAt?: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generateOtp({ otp, userId, email, phone }: Partial<IOtp>): Promise<IOtp>;
  getOtp({ otp, userId, email, phone }: Partial<IOtp>): Promise<IOtp | null>;
  deleteOtp({ userId, email, phone }: Partial<IOtp>): Promise<void>;
}
