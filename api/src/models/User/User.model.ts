import { Schema, model } from 'mongoose';
import commonsUtils from '../../utils';
import dao from '../../dao/User';
import { IUser, IUserMethods } from '../../interface/user.interface';

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },

    // Wallet System
    mainWallet: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionWallet: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Statistics
    todayIncome: {
      type: Number,
      default: 0,
    },
    monthlyIncome: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },

    // Task Tracking
    totalTasksCompleted: {
      type: Number,
      default: 0,
    },
    todayTasksCompleted: {
      type: Number,
      default: 0,
    },
    lastTaskCompletedAt: {
      type: Date,
      default: null,
    },

    withdrawalPassword: {
      type: String,
      required: false,
      select: false, // Don't include in normal queries
    },

    // User Level/Tier
    userLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    levelName: {
      type: String,
      default: 'Bronze',
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isSSO: {
      type: Boolean,
      default: false,
    },

    lastActiveDate: {
      type: Date,
      default: null,
    },
    lastIncomeResetDate: {
      type: Date,
      default: Date.now,
    },
    lastMonthlyResetDate: {
      type: Date,
      default: Date.now,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      default: null,
    },
    totalReferrals: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

schema.index({ phone: 1 });
schema.index({ email: 1 });
schema.index({ username: 1 });
schema.index({ referralCode: 1 });
schema.index({ lastActiveDate: 1 });

commonsUtils.dbUtils.registerDaos(schema, dao);
commonsUtils.dbUtils.handleDuplicates(schema, 'email');
commonsUtils.dbUtils.handleDuplicates(schema, 'phone');

const userModel: IUserMethods = model<IUser, IUserMethods>('user', schema);
export default userModel;
