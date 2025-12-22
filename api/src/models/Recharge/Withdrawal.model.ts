// models/withdrawal.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  walletType: 'mainWallet' | 'commissionWallet';
  amount: number;
  bankAccountId: mongoose.Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'savings' | 'current' | 'qr';
  qrCodeImage?: string; // Path to QR code image if QR payment
  currency?: 'INR' | 'USDT';
  withdrawalMethod?: 'bank_transfer' | 'stripe' | 'crypto_wallet'; // For USDT, 'stripe' or 'crypto_wallet' might be relevant
  cryptoAddress?: string; // If 'crypto_wallet' or just to store the destination
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  transactionId?: string;
  remarks?: string;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

const WithdrawalSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    walletType: {
      type: String,
      enum: ['mainWallet', 'commissionWallet'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 280,
    },
    bankAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      required: false,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'qr'],
      default: 'savings',
    },
    currency: {
      type: String,
      enum: ['INR', 'USDT'],
      default: 'INR',
    },
    withdrawalMethod: {
      type: String,
      enum: ['bank_transfer', 'stripe', 'crypto_wallet'],
      default: 'bank_transfer',
    },
    cryptoAddress: {
      type: String,
      default: null,
    },
    qrCodeImage: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected'],
      default: 'pending',
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
WithdrawalSchema.index({ userId: 1, status: 1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });

// Update completedAt when status changes to completed
WithdrawalSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);