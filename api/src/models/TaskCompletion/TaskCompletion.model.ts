import { Schema, model } from "mongoose";

const taskCompletionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "task",
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

taskCompletionSchema.index({ userId: 1, taskId: 1 }, { unique: true });
taskCompletionSchema.index({ userId: 1, completedAt: -1 });

const taskCompletionModel = model("taskCompletion", taskCompletionSchema);
export default taskCompletionModel;