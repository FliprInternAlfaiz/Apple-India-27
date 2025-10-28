// models/Withdrawal.ts
import { Schema, model } from "mongoose";

export interface IWithdrawal {
  userId: Schema.Types.ObjectId;
  walletType: "mainWallet" | "commissionWallet";
  amount: number;
  bankAccountId: Schema.Types.ObjectId;
  ifscCode: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  status: "pending" | "processing" | "completed" | "rejected";
  transactionId?: string;
  rejectionReason?: string;
  processedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    walletType: {
      type: String,
      enum: ["mainWallet", "commissionWallet"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 280,
    },
    bankAccountId: {
      type: Schema.Types.ObjectId,
      ref: "bankAccount",
      required: true,
    },
    ifscCode: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected"],
      default: "pending",
      index: true,
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    rejectionReason: {
      type: String,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ createdAt: -1 });

const WithdrawalModel = model<IWithdrawal>("withdrawal", withdrawalSchema);
export default WithdrawalModel;