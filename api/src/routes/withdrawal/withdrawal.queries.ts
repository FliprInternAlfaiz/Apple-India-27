import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
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

  router.get(
    "/wallet-info",
    commonsMiddleware.checkUserAuth,
    getWalletInfo
  );

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

  router.post(
    "/set-password",
    commonsMiddleware.checkUserAuth,
    setWithdrawalPassword
  );
};