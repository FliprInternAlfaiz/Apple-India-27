// models/USDWalletTransaction/USDWalletTransaction.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUSDWalletTransaction extends Document {
  userId: Schema.Types.ObjectId;
  type: 'credit' | 'debit';
  amountINR: number;
  amountUSD: number;
  exchangeRate: number;
  description: string;
  referenceType: 'admin_fund' | 'withdrawal' | 'refund' | 'adjustment';
  referenceId: Schema.Types.ObjectId | null;
  balanceAfterINR: number;
  balanceAfterUSD: number;
  processedBy: Schema.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const usdWalletTransactionSchema = new Schema<IUSDWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    amountINR: {
      type: Number,
      required: true,
    },
    amountUSD: {
      type: Number,
      required: true,
    },
    exchangeRate: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ['admin_fund', 'withdrawal', 'refund', 'adjustment'],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    balanceAfterINR: {
      type: Number,
      required: true,
    },
    balanceAfterUSD: {
      type: Number,
      required: true,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes
usdWalletTransactionSchema.index({ userId: 1, createdAt: -1 });
usdWalletTransactionSchema.index({ referenceType: 1 });

const USDWalletTransactionModel = model<IUSDWalletTransaction>(
  'usdwallettransaction',
  usdWalletTransactionSchema
);

export default USDWalletTransactionModel;
