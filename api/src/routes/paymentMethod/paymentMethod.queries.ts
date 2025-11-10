import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import paymentMethodController from "../../controllers/paymentMethodControllers/paymentMethod.controller";

const {
  createPaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod
} = paymentMethodController;

export default (router: Router) => {

  router.get(
    "/admin/payment-methods",
    commonsMiddleware.checkAdminAuth,
    getAllPaymentMethods
  );

  router.post(
    "/admin/payment-methods",
    commonsMiddleware.checkAdminAuth,
    createPaymentMethod
  );

  router.put(
    "/admin/payment-methods/:methodId",
    commonsMiddleware.checkAdminAuth,
    updatePaymentMethod
  );

  router.delete(
    "/admin/payment-methods/:methodId",
    commonsMiddleware.checkAdminAuth,
    deletePaymentMethod
  );

  return router;
};