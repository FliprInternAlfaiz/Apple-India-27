import taskValidation from "./task.validation";
import { userSignUpValidation } from "./userSignUp.validation";
import {createWithdrawal,setWithdrawalPassword,addBankAccount} from "./withdrawal.validation"

export const Validators = {
  userSignup: userSignUpValidation,
  userTask:taskValidation,
  createWithdrawal:createWithdrawal,
  setWithdrawalPassword:setWithdrawalPassword,
  addBankAccount:addBankAccount,
};
