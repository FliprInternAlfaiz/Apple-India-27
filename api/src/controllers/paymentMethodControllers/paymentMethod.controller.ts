import { Request, Response } from "express";
import models from "../../models";
import commonsUtils from "../../utils";

const { JsonResponse } = commonsUtils;

// ✅ Create new payment method
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const {
      methodName,
      methodType,
      upiId,
      qrCode,
      accountName,
      accountNumber,
      ifscCode,
      bankName,
    } = req.body;

    if (!methodName || !methodType) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Method name and type are required.",
        title: "Payment Method",
      });
    }

    const paymentMethod = await models.paymentMethod.create({
      methodName,
      methodType,
      upiId,
      qrCode,
      accountName,
      accountNumber,
      ifscCode,
      bankName,
      isActive: true,
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Payment Method",
      message: "Payment method created successfully.",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Error creating payment method:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to create payment method.",
      title: "Payment Method",
    });
  }
};
