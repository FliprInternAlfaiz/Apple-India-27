// models/WithdrawalSettings/WithdrawalSettings.model.ts
import { Schema, model, Document } from 'mongoose';

export interface IWithdrawalSettings extends Document {
  // Payment method settings
  stripeEnabled: boolean;
  bitgetEnabled: boolean;
  
  // Bitget configuration (stored encrypted in production)
  bitgetApiKey: string;
  bitgetSecretKey: string;
  bitgetPassphrase: string; // Required for Bitget API
  bitgetNetwork: string; // e.g., 'trc20', 'bep20', 'erc20' (lowercase for Bitget)
  bitgetCurrency: string; // e.g., 'USDT', 'USDC'
  
  // Exchange rate settings
  usdExchangeRate: number;
  autoUpdateExchangeRate: boolean;
  
  // Withdrawal limits
  minWithdrawalINR: number;
  maxWithdrawalINR: number;
  
  // Fees (percentage)
  stripeFeePercent: number;
  bitgetFeePercent: number;
  
  // Default method
  defaultWithdrawalMethod: 'stripe' | 'bitget';
  
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
      default: false, // Disabled by default, Bitget enabled
    },
    bitgetEnabled: {
      type: Boolean,
      default: true, // Bitget enabled by default
    },
    bitgetApiKey: {
      type: String,
      default: '',
    },
    bitgetSecretKey: {
      type: String,
      default: '',
    },
    bitgetPassphrase: {
      type: String,
      default: '', // Required for Bitget API authentication
    },
    bitgetNetwork: {
      type: String,
      default: 'trc20', // TRC20 - lower fees (Bitget uses lowercase)
      enum: ['trc20', 'bep20', 'erc20', 'sol', 'matic'],
    },
    bitgetCurrency: {
      type: String,
      default: 'USDT',
      enum: ['USDT', 'USDC'],
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
    bitgetFeePercent: {
      type: Number,
      default: 0.1, // Bitget withdrawal fee
    },
    defaultWithdrawalMethod: {
      type: String,
      enum: ['stripe', 'bitget'],
      default: 'bitget', // Bitget as default
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
