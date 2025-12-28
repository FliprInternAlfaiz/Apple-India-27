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
import TeamReferralHistory from "./teamReferral/teamReferralHistory.model";
import withdrawalConfigModel from "./withdrawalConfig/withdrawalConfig.model";
import USDWalletModel from "./USDWallet/USDWallet.model";
import USDWithdrawalModel from "./USDWithdrawal/USDWithdrawal.model";
import USDWalletTransactionModel from "./USDWalletTransaction/USDWalletTransaction.model";
import WithdrawalSettingsModel from "./WithdrawalSettings/WithdrawalSettings.model";

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
  TeamReferralHistory:TeamReferralHistory,
  withdrawalConfig:withdrawalConfigModel,
  USDWallet: USDWalletModel,
  USDWithdrawal: USDWithdrawalModel,
  USDWalletTransaction: USDWalletTransactionModel,
  WithdrawalSettings: WithdrawalSettingsModel,
};

export default models;