import { Document, Model, ObjectId, Query } from "mongoose";
export interface IUser extends Document {
  _id: ObjectId;
  id: string;
  name: string;
  phone: string;
  password: string;
  username: string;
  picture?: string;
  mainWallet: number;
  commissionWallet: number;
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;
  totalTasksCompleted: number;
  todayTasksCompleted: number;
  lastTaskCompletedAt?: Date | null;
  currentLevel: string; 
  currentLevelNumber: number; 
  investmentAmount: number; 
  levelUpgradedAt?: Date;
  userLevel: number;
  levelName: string;
  isActive: boolean;
  isVerified: boolean;
  isSSO: boolean;
  lastActiveDate?: Date | null;
  lastIncomeResetDate: Date;
  lastMonthlyResetDate: Date;
  referralCode?: string;
  referredBy?: ObjectId | null;
  totalReferrals: number;
  createdAt: Date;
  updatedAt: Date;
  teamLevel: 'A' | 'B' | 'C' | null;
  directReferralsCount: number;
  withdrawalPassword:string;
   aadhaarNumber?: string | null;
  aadhaarPhoto?: string | null;
  aadhaarVerificationStatus: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  aadhaarSubmittedAt?: Date | null;
  aadhaarVerifiedAt?: Date | null;
  aadhaarRejectionReason?: string | null;
}

type TQueryType = Query<IUser, IUser>;

export interface IUserMethods extends Model<IUser> {
  createUser(user: Pick<IUser, "name" | "password">): TQueryType;
  getById(id: IUser["id"]): TQueryType;
  updatePassword(data: {
    id: IUser["id"];
    password: IUser["password"];
  }): TQueryType;
}
