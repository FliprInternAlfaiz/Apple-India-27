import { Document, Model } from "mongoose";

export interface ITask extends Document {
  videoUrl: string;
  thumbnail: string;
  level: string;
  rewardPrice: number;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskMethods extends Model<ITask> {

}