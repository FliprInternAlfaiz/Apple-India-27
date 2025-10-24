import UserModel from "./User/User.model";
import OtpModel from "./Otp/Opt.model"
import tokenModel from "./Token/Token.model";
import taskModel from "./Task/Task.model";
const models = {
  User: UserModel,
  Otp: OtpModel,
  token: tokenModel,
  task: taskModel,
};

export default models;