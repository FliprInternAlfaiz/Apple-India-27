// models/TeamReferral.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamReferral extends Document {
  userId: Types.ObjectId;
  referredUserId: Types.ObjectId;
  level: 'A' | 'B' | 'C';
  referralChain: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamReferralSchema = new Schema<ITeamReferral>(
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
    level: { type: String, enum: ['A', 'B', 'C'], required: true },
    referralChain: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  { timestamps: true },
);

teamReferralSchema.index({ userId: 1, level: 1 });
teamReferralSchema.index({ referredUserId: 1 });

const TeamReferral = model<ITeamReferral>('TeamReferral', teamReferralSchema);
export default TeamReferral;
