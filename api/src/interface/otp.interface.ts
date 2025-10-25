import { Document, Model } from 'mongoose';

export interface IOtp extends Document {
  email?: string;
  phone?: string;
  otp: string;
  createdAt?: Date;
}

export interface IOtpModel extends Model<IOtp> {
  generateOtp({ otp, email, phone }: Partial<IOtp>): Promise<IOtp>;
  getOtp({ otp, email, phone }: Partial<IOtp>): Promise<IOtp | null>;
  deleteOtp({ email, phone }: Partial<IOtp>): Promise<void>;
}
