// models/USDWallet/USDWallet.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IUSDWallet extends Document {
  userId: Schema.Types.ObjectId;
  balanceINR: number; // Balance stored in INR (admin funds this)
  balanceUSD: number; // Calculated USD equivalent
  totalFundedINR: number;
  totalWithdrawnUSD: number;
  
  // Stripe Connect details
  stripeConnectAccountId: string | null;
  stripeConnectStatus: 'not_connected' | 'pending' | 'connected' | 'restricted';
  stripeOnboardingComplete: boolean;
  
  // Bitget wallet details
  bitgetWalletAddress: string | null;
  bitgetNetwork: string | null; // trc20, bep20, erc20, etc.
  bitgetVerified: boolean;
  
  // Preferred withdrawal method
  preferredWithdrawalMethod: 'stripe' | 'bitget' | null;
  
  lastExchangeRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const usdWalletSchema = new Schema<IUSDWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      unique: true,
    },
    balanceINR: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceUSD: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFundedINR: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdrawnUSD: {
      type: Number,
      default: 0,
      min: 0,
    },
    stripeConnectAccountId: {
      type: String,
      default: null,
    },
    stripeConnectStatus: {
      type: String,
      enum: ['not_connected', 'pending', 'connected', 'restricted'],
      default: 'not_connected',
    },
    stripeOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    // Bitget wallet fields
    bitgetWalletAddress: {
      type: String,
      default: null,
    },
    bitgetNetwork: {
      type: String,
      enum: ['trc20', 'bep20', 'erc20', 'sol', 'matic', null],
      default: null,
    },
    bitgetVerified: {
      type: Boolean,
      default: false,
    },
    preferredWithdrawalMethod: {
      type: String,
      enum: ['stripe', 'bitget', null],
      default: null,
    },
    lastExchangeRate: {
      type: Number,
      default: 83, // Default INR to USD rate
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
usdWalletSchema.index({ userId: 1 });
usdWalletSchema.index({ stripeConnectAccountId: 1 });
usdWalletSchema.index({ bitgetWalletAddress: 1 });

const USDWalletModel = model<IUSDWallet>('usdwallet', usdWalletSchema);

export default USDWalletModel;
