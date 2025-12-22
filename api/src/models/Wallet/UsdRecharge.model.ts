import mongoose, { Schema, Document } from 'mongoose';

export interface IUsdRecharge extends Document {
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  amount: number;
  paymentGateway: 'paypal' | 'stripe';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed';
  paymentId?: string;
  orderId: string;
  currency: 'USD';
  description: string;
  failureReason?: string;
  completedAt?: Date;
  cancelledAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const usdRechargeSchema = new Schema<IUsdRecharge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentGateway: {
      type: String,
      enum: ['paypal', 'stripe'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentId: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currency: {
      type: String,
      enum: ['USD'],
      default: 'USD',
    },
    description: {
      type: String,
      default: 'USD Wallet Recharge',
    },
    failureReason: {
      type: String,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

usdRechargeSchema.index({ userId: 1, createdAt: -1 });
usdRechargeSchema.index({ paymentStatus: 1 });

export default mongoose.model<IUsdRecharge>(
  'UsdRecharge',
  usdRechargeSchema
);
