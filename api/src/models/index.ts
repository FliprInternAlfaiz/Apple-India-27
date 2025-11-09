import UserModel from "./User/User.model";
import tokenModel from "./Token/Token.model";
import taskModel from "./Task/Task.model";
import taskCompletionModel from "./TaskCompletion/TaskCompletion.model";
import BankAccountModel from "./Recharge/BankAccount.model";
import WithdrawalModel from "./Recharge/Withdrawal.model";
import PaymentMethodModel from "./UserRecharge/PaymentMethod.model";
import RechargeModel from "./UserRecharge/Recharge.model";
import levelModel from "./Level/Level.model";
import TeamReferral from "./teamReferral/teamReferral.model";
import ConferenceNewsModel from "./ConferenceNews/ConferenceNews.model";
import { LuckyDraw, LuckyDrawParticipant } from "./Luckydraw/LuckyDraw.model";
import { AdminModel } from "./admin/admin.model";

const models = {
  User: UserModel,
  token: tokenModel,
  task: taskModel,
  taskCompletion:taskCompletionModel,
  bankAccount:BankAccountModel,
  withdrawal:WithdrawalModel,
  paymentMethod:PaymentMethodModel,
  recharge:RechargeModel,
  level:levelModel,
  TeamReferral:TeamReferral,
  ConferenceNews:ConferenceNewsModel,
  LuckyDraw: LuckyDraw,
  LuckyDrawParticipant: LuckyDrawParticipant,
  Admin:AdminModel,
};

export default models;