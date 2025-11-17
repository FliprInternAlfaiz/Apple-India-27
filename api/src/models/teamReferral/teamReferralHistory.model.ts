import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamReferralHistory extends Document {
  userId: Types.ObjectId; 
  referredUserId: Types.ObjectId;
  referrerUserId: Types.ObjectId; 
  level: 'A' | 'B' | 'C';
  amount: number;
  transactionType: 'signup_bonus' | 'investment_commission' | 'level_bonus';
  investmentId?: Types.ObjectId;
  investmentAmount?: number;
  commissionPercentage?: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  referralChain: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamReferralHistorySchema = new Schema<ITeamReferralHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      index: true,
    },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    referrerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    level: {
      type: String,
      enum: ['A', 'B', 'C'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    transactionType: {
      type: String,
      enum: ['signup_bonus', 'investment_commission', 'level_bonus'],
      required: true,
    },
    investmentId: {
      type: Schema.Types.ObjectId,
      ref: 'investment',
    },
    investmentAmount: {
      type: Number,
    },
    commissionPercentage: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
    description: {
      type: String,
      required: true,
    },
    referralChain: [{
      type: Schema.Types.ObjectId,
      ref: 'user',
    }],
  },
  { timestamps: true }
);

// Indexes for efficient querying
teamReferralHistorySchema.index({ userId: 1, createdAt: -1 });
teamReferralHistorySchema.index({ referredUserId: 1 });
teamReferralHistorySchema.index({ status: 1 });
teamReferralHistorySchema.index({ transactionType: 1 });

const TeamReferralHistory = model<ITeamReferralHistory>(
  'TeamReferralHistory',
  teamReferralHistorySchema
);

export default TeamReferralHistory;