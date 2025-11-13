import { Schema, model } from "mongoose";
import { ILevel ,ILevelMethods } from "../../interface/level.interface";

const schema = new Schema<ILevel>(
  {
    levelNumber: {
      type: Number,
      required: true,
      unique: true,

    },
    levelName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    investmentAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    rewardPerTask: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyTaskLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    aLevelCommissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    bLevelCommissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    cLevelCommissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: '🍎',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

schema.index({ levelNumber: 1, isActive: 1 });
schema.index({ order: 1 });

const levelModel: ILevelMethods = model<ILevel, ILevelMethods>("level", schema);

export default levelModel;