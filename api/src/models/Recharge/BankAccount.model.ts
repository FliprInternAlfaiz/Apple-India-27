// models/BankAccount.ts
import { Schema, model } from "mongoose";
import commonsUtils from "../../utils";

export interface IBankAccount {
  userId: Schema.Types.ObjectId;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName?: string;
  accountType: "savings" | "current";
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    branchName: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["savings", "current"],
      default: "savings",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

bankAccountSchema.index({ userId: 1, isActive: 1 });
bankAccountSchema.index({ userId: 1, isDefault: 1 });

const BankAccountModel = model<IBankAccount>("bankAccount", bankAccountSchema);
export default BankAccountModel;