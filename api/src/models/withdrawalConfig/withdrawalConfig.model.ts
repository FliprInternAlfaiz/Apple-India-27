import mongoose, { Schema, Document } from "mongoose";

export interface IWithdrawalConfig extends Document {
  dayOfWeek: number; 
  dayName: string;
  allowedLevels: number[];
  isActive: boolean;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalConfigSchema = new Schema<IWithdrawalConfig>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
      unique: true,
    },
    dayName: {
      type: String,
      required: true,
    },
    allowedLevels: {
      type: [Number],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startTime: {
      type: String,
      default: "08:30",
    },
    endTime: {
      type: String,
      default: "17:00",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IWithdrawalConfig>(
  "WithdrawalConfig",
  withdrawalConfigSchema
);

