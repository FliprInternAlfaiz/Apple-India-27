import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import rechargeController from "../../controllers/rechargeControllers/recharge.controller";
import { handleMulterError, paymentProof } from "../../middleware/upload.middleware";

export default (router: Router) => {
  // 🔹 Get wallet info
  router.get(
    "/wallet-info",
    commonsMiddleware.checkUserAuth,
    rechargeController.getWalletInfo
  );

  // 🔹 Get available payment methods
  router.get(
    "/payment-methods",
    commonsMiddleware.checkUserAuth,
    rechargeController.getPaymentMethods
  );

  // 🔹 Create recharge order
  router.post(
    "/create-order",
    commonsMiddleware.checkUserAuth,
    rechargeController.createRechargeOrder
  );

  // 🔹 Verify payment (upload proof)
  router.post(
    "/verify-payment",
    commonsMiddleware.checkUserAuth,
    paymentProof,
    handleMulterError,
    rechargeController.verifyRechargePayment
  );

  // 🔹 Get recharge history
  router.get(
    "/history",
    commonsMiddleware.checkUserAuth,
    rechargeController.getRechargeHistory
  );

  // =========================
  // 🔸 Admin Routes
  // =========================

  // 🔹 Approve recharge order
  router.patch(
    "/admin/approve/:orderId",
    commonsMiddleware.checkUserAuth,
    rechargeController.approveRecharge
  );

  // 🔹 Reject recharge order
  router.patch(
    "/admin/reject/:orderId",
    commonsMiddleware.checkUserAuth,
    rechargeController.rejectRecharge
  );

  return router;
};
