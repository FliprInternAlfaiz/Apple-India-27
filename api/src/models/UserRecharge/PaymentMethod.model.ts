import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentMethod extends Document {
  methodName: string;
  methodType: "upi" | "qr" | "bank";
  upiId?: string;
  qrCode?: string; // URL or local file path
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isActive: boolean;
  createdAt: Date;
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    methodName: { type: String, required: true },
    methodType: { type: String, enum: ["upi", "qr", "bank"], required: true },
    upiId: { type: String },
    qrCode: { type: String },
    accountName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPaymentMethod>("paymentMethod", paymentMethodSchema);
