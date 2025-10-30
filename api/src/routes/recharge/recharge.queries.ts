import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import rechargeController from "../../controllers/rechargeControllers/recharge.controller";
import { handleMulterError, paymentProofUpload } from "../../middleware/upload.middleware";

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

   router.post(
    "/generate-qr",
    commonsMiddleware.checkUserAuth,
    rechargeController.generateUPIQRCode
  );

  // 🔹 Verify payment (upload proof)
  router.post(
    "/verify-payment",
    commonsMiddleware.checkUserAuth,
    paymentProofUpload.single("paymentProof"),
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
    rechargeController.approveRecharge
  );

  // 🔹 Reject recharge order
  router.patch(
    "/admin/reject/:orderId",
    rechargeController.rejectRecharge
  );

  return router;
};
