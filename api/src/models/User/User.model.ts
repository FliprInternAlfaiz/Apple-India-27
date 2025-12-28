// models/user.model.ts
import { Schema, model } from 'mongoose';
import commonsUtils from '../../utils';
import { IUser, IUserMethods } from '../../interface/user.interface';

const schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plainPassword: { type: String, select: false },
    picture: { type: String},
    mainWallet: { type: Number, default: 0, min: 0 },
    commissionWallet: { type: Number, default: 0, min: 0 },
    todayIncome: { type: Number, default: 0 },
    monthlyIncome: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalWithdrawals: { type: Number, default: 0 },
    totalProfit: { type: Number, default: 0 },
    totalTasksCompleted: { type: Number, default: 0 },
    todayTasksCompleted: { type: Number, default: 0 },
    lastTaskCompletedAt: { type: Date, default: null },
    withdrawalPassword: { type: String, select: false },
    investmentAmount: { type: Number, default: 0, min: 0 },
    levelUpgradedAt: { type: Date, default: null },
    userLevel: { type: Number, default: -1 },
    currentLevelNumber: { type: Number, default: -1 },
    currentLevel: { type: String, default: null },
    levelName: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isSSO: { type: Boolean, default: false },
    // USD User flag - controlled by admin
    isUSDUser: { type: Boolean, default: false },
    lastActiveDate: { type: Date, default: null },
    lastIncomeResetDate: { type: Date, default: Date.now },
    lastMonthlyResetDate: { type: Date, default: Date.now },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'user', default: null },
    totalReferrals: { type: Number, default: 0 },
     teamLevel: { 
    type: String, 
    enum: ['A', 'B', 'C'], 
    default: 'A'
  },
  directReferralsCount: { 
    type: Number, 
    default: 0 
  },

   aadhaarNumber: { type: String, default: null, sparse: true },
    aadhaarPhoto: { type: String, default: null },
    aadhaarVerificationStatus: { 
      type: String, 
      enum: ['not_submitted', 'pending', 'approved', 'rejected'], 
      default: 'not_submitted' 
    },
    aadhaarSubmittedAt: { type: Date, default: null },
    aadhaarVerifiedAt: { type: Date, default: null },
    aadhaarRejectionReason: { type: String, default: null },
  },
  { timestamps: true },
);

commonsUtils.dbUtils.handleDuplicates(schema, 'phone');

async function generateUniqueReferralCode(this: any): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let isUnique = false;

  while (!isUnique) {
    code = Array.from({ length: 30 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length)),
    ).join('');

    const existing = await this.constructor.findOne({ referralCode: code });
    if (!existing) isUnique = true;
  }

  return code;
}

schema.pre('save', async function (next) {
  if (!this.referralCode) {
    this.referralCode = await generateUniqueReferralCode.call(this);
  }
  next();
});

const userModel = model<IUser, IUserMethods>('user', schema);

export default userModel;
