// models/bankAccount.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IBankAccount extends Document {
  userId: mongoose.Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType: 'savings' | 'current' | 'qr';
  qrCodeImage?: string; // Path to QR code image
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'qr'],
      default: 'savings',
    },
    qrCodeImage: {
      type: String,
      default: null,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user and active status
BankAccountSchema.index({ userId: 1, isActive: 1 });

export default mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);