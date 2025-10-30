// models/task.model.ts (Updated)
import { Schema, model } from "mongoose";
import { ITask, ITaskMethods } from "../../interface/task.interface";

const schema = new Schema<ITask>(
  {
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    levelNumber: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    rewardPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
schema.index({ level: 1, isActive: 1, order: 1 });
schema.index({ levelNumber: 1, isActive: 1 });
schema.index({ level: 1, levelNumber: 1 });

const taskModel: ITaskMethods = model<ITask, ITaskMethods>("task", schema);
export default taskModel;