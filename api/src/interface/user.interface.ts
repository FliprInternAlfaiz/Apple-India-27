import { Document, Model, ObjectId, Query } from "mongoose";

// ✅ Core User Interface matching schema
export interface IUser extends Document {
  _id: ObjectId;
  id: string;

  // Basic info
  name: string;

  phone: string;
  password: string;
  username: string;
  picture?: string;

  // Wallet system
  mainWallet: number;
  commissionWallet: number;

  // Statistics
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;

  // Task tracking
  totalTasksCompleted: number;
  todayTasksCompleted: number;
  lastTaskCompletedAt?: Date | null;


   // Level System (UPDATED)
  currentLevel: string; 
  currentLevelNumber: number; 
  investmentAmount: number; 
  levelUpgradedAt?: Date;
  
  // User level / tier
  userLevel: number;
  levelName: string;

  // Account status
  isActive: boolean;
  isVerified: boolean;
  isSSO: boolean;

  // Dates
  lastActiveDate?: Date | null;
  lastIncomeResetDate: Date;
  lastMonthlyResetDate: Date;

  // Referral system
  referralCode?: string;
  referredBy?: ObjectId | null;
  totalReferrals: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  //withdrawalPassword
  withdrawalPassword:string;
}

type TQueryType = Query<IUser, IUser>;

// ✅ Model methods for user operations
export interface IUserMethods extends Model<IUser> {
  createUser(user: Pick<IUser, "name" | "password">): TQueryType;
  getById(id: IUser["id"]): TQueryType;
  updatePassword(data: {
    id: IUser["id"];
    password: IUser["password"];
  }): TQueryType;
}
