// models/WithdrawalSettings/WithdrawalSettings.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IWithdrawalSettings extends Document {
  // Payment method settings
  stripeEnabled: boolean;
  binanceEnabled: boolean;
  
  // Binance configuration (stored encrypted in production)
  binanceApiKey: string;
  binanceSecretKey: string;
  binanceNetwork: string; // e.g., 'BSC', 'ETH', 'TRX'
  binanceCurrency: string; // e.g., 'USDT', 'USDC', 'BUSD'
  
  // Exchange rate settings
  usdExchangeRate: number;
  autoUpdateExchangeRate: boolean;
  
  // Withdrawal limits
  minWithdrawalINR: number;
  maxWithdrawalINR: number;
  
  // Fees (percentage)
  stripeFeePercent: number;
  binanceFeePercent: number;
  
  // Default method
  defaultWithdrawalMethod: 'stripe' | 'binance';
  
  // Admin notes
  notes: string;
  
  updatedBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSettingsSchema = new Schema<IWithdrawalSettings>(
  {
    stripeEnabled: {
      type: Boolean,
      default: false, // Disabled by default, Binance enabled
    },
    binanceEnabled: {
      type: Boolean,
      default: true, // Binance enabled by default
    },
    binanceApiKey: {
      type: String,
      default: '',
    },
    binanceSecretKey: {
      type: String,
      default: '',
    },
    binanceNetwork: {
      type: String,
      default: 'BSC', // Binance Smart Chain - lower fees
      enum: ['BSC', 'ETH', 'TRX', 'SOL', 'MATIC'],
    },
    binanceCurrency: {
      type: String,
      default: 'USDT',
      enum: ['USDT', 'USDC', 'BUSD'],
    },
    usdExchangeRate: {
      type: Number,
      default: 83, // 1 USD = 83 INR
    },
    autoUpdateExchangeRate: {
      type: Boolean,
      default: false,
    },
    minWithdrawalINR: {
      type: Number,
      default: 0.01, // ~$0.001 USD for testing
    },
    maxWithdrawalINR: {
      type: Number,
      default: 500000,
    },
    stripeFeePercent: {
      type: Number,
      default: 2.9, // Stripe standard fee
    },
    binanceFeePercent: {
      type: Number,
      default: 0.1, // Binance withdrawal fee
    },
    defaultWithdrawalMethod: {
      type: String,
      enum: ['stripe', 'binance'],
      default: 'binance', // Binance as default
    },
    notes: {
      type: String,
      default: '',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      default: null,
    },
  },
  { timestamps: true }
);

const WithdrawalSettingsModel = model<IWithdrawalSettings>('withdrawalsettings', withdrawalSettingsSchema);

export default WithdrawalSettingsModel;
