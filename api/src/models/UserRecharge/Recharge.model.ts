// models/recharge.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IRecharge extends Document {
userId: { type: Schema.Types.ObjectId, ref: 'user' }
  orderId: string;
  amount: number;
  paymentMethodId: mongoose.Types.ObjectId;
  transactionId?: string;
  paymentProof?: string;
  paymentDetails: {
    methodName: string;
    methodType: string;
    upiId?: string;
    qrCode?: string;
    accountName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
  };
  status: "pending" | "processing" | "completed" | "rejected";
  remarks?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const rechargeSchema = new Schema<IRecharge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    paymentProof: {
      type: String,
      default: null,
    },
    paymentDetails: {
      methodName: { type: String, required: true },
      methodType: { type: String, required: true },
      upiId: { type: String },
      qrCode: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: String },
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    remarks: {
      type: String,
      default: "",
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRecharge>("Recharge", rechargeSchema);

