import { Request, Response } from "express";
import models from "../../models";
import commonsUtils from "../../utils";

const { JsonResponse } = commonsUtils;

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

export const getAllPaymentMethods = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      methodType = ""
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (search) {
      filter.methodName = { $regex: search, $options: "i" };
    }

    if (methodType && methodType !== "all") {
      filter.methodType = methodType;
    }

    const [paymentMethods, totalCount] = await Promise.all([
      models.paymentMethod.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.paymentMethod.countDocuments(filter)
    ]);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Payment Methods",
      message: "Payment methods retrieved successfully.",
      data: {
        paymentMethods,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        }
      }
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to fetch payment methods.",
      title: "Payment Methods",
    });
  }
};

// Update payment method (ADMIN)
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { methodId } = req.params;
    const updateData = req.body;

    const paymentMethod = await models.paymentMethod.findByIdAndUpdate(
      methodId,
      updateData,
      { new: true }
    );

    if (!paymentMethod) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Payment method not found.",
        title: "Payment Method",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Payment Method",
      message: "Payment method updated successfully.",
      data: paymentMethod,
    });
  } catch (error) {
    console.error("Error updating payment method:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to update payment method.",
      title: "Payment Method",
    });
  }
};

// Delete payment method (ADMIN)
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { methodId } = req.params;

    const paymentMethod = await models.paymentMethod.findByIdAndDelete(methodId);

    if (!paymentMethod) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Payment method not found.",
        title: "Payment Method",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Payment Method",
      message: "Payment method deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "Failed to delete payment method.",
      title: "Payment Method",
    });
  }

}

export default {
  createPaymentMethod,
  getAllPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
};