// models/withdrawal.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  walletType: 'mainWallet' | 'commissionWallet';
  amount: number;
  bankAccountId?: mongoose.Types.ObjectId; // Optional for USD users
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountType?: 'savings' | 'current' | 'qr';
  qrCodeImage?: string; // Path to QR code image if QR payment
  isUSDWithdrawal?: boolean; // True if this is a USD user withdrawal (goes to USD Wallet)
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
      required: false, // Optional for USD users
    },
    accountHolderName: {
      type: String,
      required: false, // Optional for USD users
    },
    bankName: {
      type: String,
      required: false, // Optional for USD users
    },
    accountNumber: {
      type: String,
      required: false, // Optional for USD users
    },
    ifscCode: {
      type: String,
      required: false, // Optional for USD users
      uppercase: true,
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
    isUSDWithdrawal: {
      type: Boolean,
      default: false,
      index: true,
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