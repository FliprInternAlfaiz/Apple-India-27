import { Model } from "mongoose";

export interface ILevel extends Document {
  levelNumber: number;
  levelName: string; 
  investmentAmount: number; // Amount needed to unlock this level
  rewardPerTask: number; // Earnings per video/task
  dailyTaskLimit: number; // Maximum tasks per day
  
  // Commission rates for referrals
  aLevelCommissionRate: number; // Direct referral
  bLevelCommissionRate: number; // Second level
  cLevelCommissionRate: number; // Third level
  
  isActive: boolean;
  order: number;
  icon: string;
  description: string;
}

export interface ILevelMethods extends Model<ILevel> {}
