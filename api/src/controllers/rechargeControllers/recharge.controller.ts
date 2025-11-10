// controllers/rechargeControllers/recharge.controller.ts - COMPLETE VERSION
import { Request, Response, NextFunction } from "express";
import commonsUtils from "../../utils";
import QRCode from 'qrcode';
import models from "../../models";

const { JsonResponse } = commonsUtils;

// ==================== USER ENDPOINTS ====================

// Get wallet info (USER)
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

// Get payment methods (USER)
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

// Create recharge order (USER)
export const createRechargeOrder = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethodId } = req.body;
    const userId = res.locals.userId;

    const paymentMethod = await models.paymentMethod.findById(paymentMethodId);
    if (!paymentMethod || !paymentMethod.isActive) {
      return res.status(404).json({
        success: false,
        message: "Payment method not available",
      });
    }

    let dynamicQRCode = null;
    if (paymentMethod.methodType === "upi" && paymentMethod.upiId) {
      const upiString = `upi://pay?pa=${paymentMethod.upiId}&pn=${encodeURIComponent(
        paymentMethod.accountName || "Merchant"
      )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
        `Order-${Date.now()}`
      )}`;

      dynamicQRCode = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
      });
    }

    const order = await models.recharge.create({
      userId,
      orderId: `RCH${Date.now()}`,
      amount,
      paymentMethodId: paymentMethod._id, 
      paymentDetails: {
        methodName: paymentMethod.methodName,
        methodType: paymentMethod.methodType,
        upiId: paymentMethod.upiId,
        qrCode: dynamicQRCode || paymentMethod.qrCode,
        accountName: paymentMethod.accountName,
        accountNumber: paymentMethod.accountNumber,
        ifscCode: paymentMethod.ifscCode,
        bankName: paymentMethod.bankName,
      },
      status: "pending",
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Recharge order created successfully",
      order: {
        ...order.toObject(),
        dynamicQRCode,
      },
    });
  } catch (error: any) {
    console.error("Error creating recharge order:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create recharge order",
      error: error.message,
    });
  }
};

// Generate UPI QR Code (USER)
export const generateUPIQRCode = async (req: Request, res: Response) => {
  try {
    const { amount, paymentMethodId } = req.body;

    const paymentMethod = await models.paymentMethod.findById(paymentMethodId);
    
    if (!paymentMethod || !paymentMethod.isActive) {
      return res.status(404).json({
        success: false,
        message: "Payment method not found or inactive",
      });
    }

    let qrCodeData = "";

    if (paymentMethod.methodType === "upi" && paymentMethod.upiId) {
      const upiString = `upi://pay?pa=${paymentMethod.upiId}&pn=${encodeURIComponent(
        paymentMethod.accountName || "Merchant"
      )}&am=${amount}&cu=INR&tn=${encodeURIComponent(
        `Recharge Order ${Date.now()}`
      )}`;

      const qrCodeImage = await QRCode.toDataURL(upiString, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      qrCodeData = qrCodeImage;
    } 

    return res.status(200).json({
      success: true,
      data: {
        qrCode: qrCodeData,
        amount,
        upiId: paymentMethod.upiId,
        paymentMethod: {
          _id: paymentMethod._id,
          methodName: paymentMethod.methodName,
          methodType: paymentMethod.methodType,
        },
      },
    });
  } catch (error: any) {
    console.error("Error generating QR code:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate QR code",
      error: error.message,
    });
  }
};

// Verify payment and complete recharge (USER)
export const verifyRechargePayment = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const userId = res.locals.userId;
    const { orderId, transactionId } = req.body;
    const paymentProof = req.file?.path || null;

    if (!transactionId || transactionId.trim().length < 10) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 400,
        message: "Please enter a valid UTR/Transaction ID (minimum 10 characters).",
        title: "Recharge",
      });
    }

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

// Get recharge history (USER)
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

// ==================== ADMIN ENDPOINTS ====================

// Get all recharges (ADMIN)
export const getAllRecharges = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = ""
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    let userIds: any[] = [];
    if (search) {
      const users = await models.User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } }
        ]
      }).select('_id');

      console.log(users)

      userIds = users.map(u => u._id);
      
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { userId: { $in: userIds } }
      ];
    }

    const [recharges, totalCount] = await Promise.all([
      models.recharge.find(filter)
        .populate('userId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      models.recharge.countDocuments(filter)
    ]);

    const stats = await models.recharge.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const statistics = {
      totalAmount: stats.reduce((acc, curr) => acc + curr.totalAmount, 0),
      pendingCount: stats.find(s => s._id === 'pending')?.count || 0,
      processingCount: stats.find(s => s._id === 'processing')?.count || 0,
      completedCount: stats.find(s => s._id === 'completed')?.count || 0,
      rejectedCount: stats.find(s => s._id === 'rejected')?.count || 0
    };

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Recharges Retrieved",
      message: "Recharges fetched successfully.",
      data: {
        recharges,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum
        },
        statistics
      }
    });
  } catch (err) {
    console.error("💥 Get all recharges error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch recharges.",
    });
  }
};

// Get recharge statistics (ADMIN)
export const getRechargeStatistics = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const stats = await models.recharge.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const statistics = {
      totalAmount: stats.reduce((acc, curr) => acc + curr.totalAmount, 0),
      pendingCount: stats.find(s => s._id === 'pending')?.count || 0,
      processingCount: stats.find(s => s._id === 'processing')?.count || 0,
      completedCount: stats.find(s => s._id === 'completed')?.count || 0,
      rejectedCount: stats.find(s => s._id === 'rejected')?.count || 0
    };

    return JsonResponse(res, {
      status: "success",
      statusCode: 200,
      title: "Statistics",
      message: "Statistics retrieved successfully.",
      data: statistics
    });
  } catch (err) {
    console.error("💥 Get recharge statistics error:", err);
    return JsonResponse(res, {
      status: "error",
      statusCode: 500,
      title: "Server Error",
      message: "Failed to fetch statistics.",
    });
  }
};

// Approve recharge (ADMIN)
export const approveRecharge = async (
  req: Request,
  res: Response,
  __: NextFunction
) => {
  try {
    const { orderId } = req.params;
    const { remarks } = req.body;

    const rechargeOrder = await models.recharge.findOne({ orderId });

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

    const user = await models.User.findById(rechargeOrder.userId);
    if (!user) {
      return JsonResponse(res, {
        status: "error",
        statusCode: 404,
        message: "User not found.",
        title: "Recharge",
      });
    }

    user.mainWallet = (user.mainWallet || 0) + rechargeOrder.amount;
    await user.save();

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

// Reject recharge (ADMIN)
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

export default {
  // User endpoints
  getWalletInfo,
  getPaymentMethods,
  createRechargeOrder,
  verifyRechargePayment,
  generateUPIQRCode,
  getRechargeHistory,
  
  // Admin endpoints
  getAllRecharges,
  getRechargeStatistics,
  approveRecharge,
  rejectRecharge,
};