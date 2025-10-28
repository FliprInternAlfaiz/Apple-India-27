// routes/withdrawal.routes.ts
import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import { Validators } from "../../validators";
import withdrawalController from "../../controllers/withdrawalControllers/withdrawal.controller";

const {
  getBankAccounts,
  addBankAccount,
  deleteBankAccount,
  setDefaultAccount,
  getWalletInfo,
  createWithdrawal,
  getWithdrawalHistory,
  setWithdrawalPassword,
} = withdrawalController;

export default (router: Router) => {
  // Bank account routes
  router.get(
    "/bank-accounts",
    commonsMiddleware.checkUserAuth,
    getBankAccounts
  );

  router.post(
    "/bank-accounts",
    commonsMiddleware.checkUserAuth,
    addBankAccount
  );

  router.delete(
    "/bank-accounts/:accountId",
    commonsMiddleware.checkUserAuth,
    deleteBankAccount
  );

  router.patch(
    "/bank-accounts/:accountId/set-default",
    commonsMiddleware.checkUserAuth,
    setDefaultAccount
  );

  // Wallet routes
  router.get(
    "/wallet-info",
    commonsMiddleware.checkUserAuth,
    getWalletInfo
  );

  // Withdrawal routes
  router.post(
    "/create",
    commonsMiddleware.checkUserAuth,
    createWithdrawal
  );

  router.get(
    "/history",
    commonsMiddleware.checkUserAuth,
    getWithdrawalHistory
  );

  // Withdrawal password
  router.post(
    "/set-password",
    commonsMiddleware.checkUserAuth,
    setWithdrawalPassword
  );
};