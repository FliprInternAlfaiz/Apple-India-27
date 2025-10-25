import UserModel from "./User/User.model";
import OtpModel from "./Otp/Opt.model"
import tokenModel from "./Token/Token.model";
import taskModel from "./Task/Task.model";
import taskCompletionModel from "./TaskCompletion/TaskCompletion.model";
const models = {
  User: UserModel,
  Otp: OtpModel,
  token: tokenModel,
  task: taskModel,
  taskCompletion:taskCompletionModel,
};

export default models;