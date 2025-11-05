import { Document, Types } from "mongoose";

export interface IPrize {
  name: string;
  description: string;
  value?: string;
}

export interface ILuckyDraw extends Document {
  title: string;
  description: string;
  imageUrl: string;
  offerDetails: string;
  termsConditions: string[];
  priority: number;
  expiryDate?: Date;
  winnerSelectionDate?: Date;
  maxParticipants?: number;
  prizes: IPrize[];
  isActive: boolean;
  status: "ongoing" | "completed" | "cancelled";
  participantCount: number;
  winners: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ILuckyDrawParticipant extends Document {
  luckyDrawId: Types.ObjectId;
  userId: Types.ObjectId;
  participatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
