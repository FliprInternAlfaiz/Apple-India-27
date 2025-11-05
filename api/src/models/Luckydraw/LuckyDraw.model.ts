import mongoose, { Schema } from "mongoose";
import { ILuckyDraw, ILuckyDrawParticipant } from "../../interface/luckydraw.interface";

// 🎁 Lucky Draw Schema
const LuckyDrawSchema = new Schema<ILuckyDraw>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    offerDetails: {
      type: String,
      required: true,
      trim: true,
    },
    termsConditions: {
      type: [String],
      default: [],
    },
    priority: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    winnerSelectionDate: {
      type: Date,
      default: null,
    },
    maxParticipants: {
      type: Number,
      default: null,
    },
    prizes: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          default: null,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "cancelled"],
      default: "ongoing",
    },
    participantCount: {
      type: Number,
      default: 0,
    },
    winners: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// 📊 Indexes for performance
LuckyDrawSchema.index({ isActive: 1, status: 1, priority: -1 });
LuckyDrawSchema.index({ expiryDate: 1 });
LuckyDrawSchema.index({ winnerSelectionDate: 1 });

// 👥 Lucky Draw Participant Schema
const LuckyDrawParticipantSchema = new Schema<ILuckyDrawParticipant>(
  {
    luckyDrawId: {
      type: Schema.Types.ObjectId,
      ref: "LuckyDraw",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// 📈 Participant Indexes
LuckyDrawParticipantSchema.index({ luckyDrawId: 1, userId: 1 }, { unique: true });
LuckyDrawParticipantSchema.index({ userId: 1 });

// ✅ Models
export const LuckyDraw = mongoose.model<ILuckyDraw>("LuckyDraw", LuckyDrawSchema);
export const LuckyDrawParticipant = mongoose.model<ILuckyDrawParticipant>(
  "LuckyDrawParticipant",
  LuckyDrawParticipantSchema
);
