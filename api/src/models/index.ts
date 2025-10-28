import UserModel from "./User/User.model";
import OtpModel from "./Otp/Opt.model"
import tokenModel from "./Token/Token.model";
import taskModel from "./Task/Task.model";
import taskCompletionModel from "./TaskCompletion/TaskCompletion.model";
import BankAccountModel from "./Recharge/BankAccount.model";
import WithdrawalModel from "./Recharge/Withdrawal.model";
const models = {
  User: UserModel,
  Otp: OtpModel,
  token: tokenModel,
  task: taskModel,
  taskCompletion:taskCompletionModel,
  bankAccount:BankAccountModel,
  withdrawal:WithdrawalModel,
  
};

export default models;