import { Router } from "express";
import { commonsMiddleware } from "../../middleware";
import { createPaymentMethod } from "../../controllers/paymentMethodControllers/paymentMethod.controller";

export default (router: Router) => {
  // 🔹 Get wallet info
  router.post("/create", createPaymentMethod);

  return router;
};
