// controllers/rechargeControllers/recharge.controller.ts
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import models from "../../models";

const { JsonResponse } = commonsUtils;

// Get wallet info
export const getWalletInfo = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;

    const user = await models.User
      .findById(userId)
      .select("mainWallet commissionWallet totalRecharges");

    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Wallet",
      });
    }

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Wallet",
      message: "Wallet info retrieved successfully.",
      data: {
        mainWallet: user.mainWallet || 0,
        commissionWallet: user.commissionWallet || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet info:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching wallet info.",
      title: "Wallet",
    });
  }
};

// Get payment methods
export const getPaymentMethods = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const paymentMethods = await models.paymentMethod
      .find({ isActive: true })
      .select("-__v")
      .sort({ createdAt: -1 })
      .lean();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Payment Methods",
      message: "Payment methods retrieved successfully.",
      data: paymentMethods,
    });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching payment methods.",
      title: "Payment Methods",
    });
  }
};

// Create recharge order
export const createRechargeOrder = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { amount, paymentMethodId } = req.body;

    // Validate amount
    if (isNaN(amount) || amount < 280) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Minimum recharge amount is Rs 280.",
        title: "Recharge",
      });
    }

    if (amount > 500000) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Maximum recharge amount is Rs 500,000.",
        title: "Recharge",
      });
    }

    // Get payment method
    const paymentMethod = await models.paymentMethod.findOne({
      _id: paymentMethodId,
      isActive: true,
    });

    if (!paymentMethod) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Payment method not found or inactive.",
        title: "Recharge",
      });
    }

    // Generate unique order ID
    const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create recharge order
    const rechargeOrder = await models.recharge.create({
      userId,
      orderId,
      amount,
      paymentMethodId,
      status: "pending",
      paymentDetails: {
        methodName: paymentMethod.methodName,
        methodType: paymentMethod.methodType,
        upiId: paymentMethod.upiId,
        qrCode: paymentMethod.qrCode,
        accountName: paymentMethod.accountName,
        accountNumber: paymentMethod.accountNumber,
        ifscCode: paymentMethod.ifscCode,
        bankName: paymentMethod.bankName,
      },
    });

    return JsonResponse(res, {
      status: "success",
      statusCode: 201,
      title: "Recharge",
      message: "Recharge order created successfully.",
      data: {
        order: {
          _id: rechargeOrder._id,
          orderId: rechargeOrder.orderId,
          amount: rechargeOrder.amount,
          status: rechargeOrder.status,
          paymentMethod: {
            methodName: paymentMethod.methodName,
            methodType: paymentMethod.methodType,
            upiId: paymentMethod.upiId,
            qrCode: paymentMethod.qrCode,
            accountName: paymentMethod.accountName,
            accountNumber: paymentMethod.accountNumber,
            ifscCode: paymentMethod.ifscCode,
            bankName: paymentMethod.bankName,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error creating recharge order:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while creating recharge order.",
      title: "Recharge",
    });
  }
};

// Verify payment and complete recharge
export const verifyRechargePayment = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { orderId, transactionId } = req.body;
    const paymentProof = req.file?.path || null;

    // Validate transaction ID
    if (!transactionId || transactionId.trim().length < 10) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Please enter a valid UTR/Transaction ID (minimum 10 characters).",
        title: "Recharge",
      });
    }

    // Find the recharge order
    const rechargeOrder = await models.recharge.findOne({
      _id: orderId,
      userId,
    });

    if (!rechargeOrder) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Recharge order not found.",
        title: "Recharge",
      });
    }

    if (rechargeOrder.status !== "pending") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This order has already been processed.",
        title: "Recharge",
      });
    }

    // Check for duplicate transaction ID
    const existingTransaction = await models.recharge.findOne({
      transactionId: transactionId.trim(),
      status: { $in: ["processing", "completed"] },
    });

    if (existingTransaction) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This transaction ID has already been used.",
        title: "Recharge",
      });
    }

    // Update recharge order with transaction details
    rechargeOrder.transactionId = transactionId.trim();
    rechargeOrder.paymentProof = paymentProof ?? undefined;
    rechargeOrder.status = "processing";
    rechargeOrder.submittedAt = new Date();
    await rechargeOrder.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Recharge",
      message: "Payment submitted successfully. Your recharge will be processed within 5-10 minutes.",
      data: {
        order: {
          _id: rechargeOrder._id,
          orderId: rechargeOrder.orderId,
          amount: rechargeOrder.amount,
          status: rechargeOrder.status,
          transactionId: rechargeOrder.transactionId,
          submittedAt: rechargeOrder.submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("Error verifying recharge payment:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while verifying payment.",
      title: "Recharge",
    });
  }
};

// Admin: Approve recharge (add amount to wallet)
export const approveRecharge = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { remarks } = req.body;

    const rechargeOrder = await models.recharge.findById(orderId);

    if (!rechargeOrder) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Recharge order not found.",
        title: "Recharge",
      });
    }

    if (rechargeOrder.status === "completed") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "This order has already been approved.",
        title: "Recharge",
      });
    }

    // Update user wallet
    const user = await models.User.findById(rechargeOrder.userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Recharge",
      });
    }

    // Add amount to main wallet
    user.mainWallet = (user.mainWallet || 0) + rechargeOrder.amount;
    await user.save();

    // Update recharge order status
    rechargeOrder.status = "completed";
    rechargeOrder.approvedAt = new Date();
    rechargeOrder.remarks = remarks || "Payment verified successfully";
    await rechargeOrder.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Recharge",
      message: "Recharge approved successfully.",
      data: {
        order: rechargeOrder,
      },
    });
  } catch (error) {
    console.error("Error approving recharge:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while approving recharge.",
      title: "Recharge",
    });
  }
};

// Admin: Reject recharge
export const rejectRecharge = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { remarks } = req.body;

    const rechargeOrder = await models.recharge.findById(orderId);

    if (!rechargeOrder) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "Recharge order not found.",
        title: "Recharge",
      });
    }

    if (rechargeOrder.status === "completed") {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Cannot reject a completed order.",
        title: "Recharge",
      });
    }

    rechargeOrder.status = "rejected";
    rechargeOrder.remarks = remarks || "Payment verification failed";
    rechargeOrder.rejectedAt = new Date();
    await rechargeOrder.save();

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Recharge",
      message: "Recharge rejected.",
      data: {
        order: rechargeOrder,
      },
    });
  } catch (error) {
    console.error("Error rejecting recharge:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while rejecting recharge.",
      title: "Recharge",
    });
  }
};

// Get recharge history
export const getRechargeHistory = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const recharges = await models.recharge
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v")
      .lean();

    const totalRecharges = await models.recharge.countDocuments(query);

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Recharge History",
      message: "Recharge history retrieved successfully.",
      data: {
        recharges,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalRecharges / Number(limit)),
          totalRecharges,
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching recharge history:", error);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      message: "An error occurred while fetching recharge history.",
      title: "Recharge History",
    });
  }
};

export default {
  getWalletInfo,
  getPaymentMethods,
  createRechargeOrder,
  verifyRechargePayment,
  approveRecharge,
  rejectRecharge,
  getRechargeHistory,
};