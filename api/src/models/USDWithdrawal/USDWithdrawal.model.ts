// models/USDWithdrawal/USDWithdrawal.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUSDWithdrawal extends Document {
  userId: Schema.Types.ObjectId;
  amountINR: number; // Amount in INR from wallet
  amountUSD: number; // Converted USD amount
  exchangeRate: number; // Exchange rate at time of request
  source?: 'usd_wallet' | 'main_wallet';
  
  // Withdrawal method
  withdrawalMethod: 'stripe' | 'bitget';
  
  // Stripe fields
  stripePayoutId: string | null;
  stripeTransferId: string | null;
  stripePayoutStatus: string | null;
  
  // Bitget fields
  bitgetWithdrawId: string | null;
  bitgetWalletAddress: string | null;
  bitgetNetwork: string | null;
  bitgetCurrency: string | null;
  bitgetTxHash: string | null;
  bitgetStatus: string | null;
  bitgetFee: number;
  
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  rejectionReason: string | null;
  adminRemarks: string | null;
  processedAt: Date | null;
  processedBy: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const usdWithdrawalSchema = new Schema<IUSDWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    amountINR: {
      type: Number,
      required: true,
      min: 0,
    },
    amountUSD: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRate: {
      type: Number,
      required: true,
    },
    // Withdrawal method
    withdrawalMethod: {
      type: String,
      enum: ['stripe', 'bitget'],
      default: 'bitget',
    },
    // Stripe fields
    stripePayoutId: {
      type: String,
      default: null,
    },
    stripeTransferId: {
      type: String,
      default: null,
    },
    stripePayoutStatus: {
      type: String,
      default: null,
    },
    // Bitget fields
    bitgetWithdrawId: {
      type: String,
      default: null,
    },
    bitgetWalletAddress: {
      type: String,
      default: null,
    },
    bitgetNetwork: {
      type: String,
      default: null,
    },
    bitgetCurrency: {
      type: String,
      default: null,
    },
    bitgetTxHash: {
      type: String,
      default: null,
    },
    bitgetStatus: {
      type: String,
      default: null,
    },
    bitgetFee: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'rejected', 'failed'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    adminRemarks: {
      type: String,
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
    // Source of funds for this withdrawal: USD wallet or user's main (prime) wallet
    source: {
      type: String,
      enum: ['usd_wallet', 'main_wallet'],
      default: 'usd_wallet',
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
usdWithdrawalSchema.index({ userId: 1, status: 1 });
usdWithdrawalSchema.index({ status: 1 });
usdWithdrawalSchema.index({ createdAt: -1 });

const USDWithdrawalModel = model<IUSDWithdrawal>('usdwithdrawal', usdWithdrawalSchema);

export default USDWithdrawalModel;
