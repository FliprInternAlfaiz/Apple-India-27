import { Document, Model } from "mongoose";

export interface ITask extends Document {
  videoUrl: string;
  thumbnail: string;
  level: string;
  levelNumber: number;
  rewardPrice: number;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskMethods extends Model<ITask> {

}