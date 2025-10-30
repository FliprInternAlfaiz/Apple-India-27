// hooks/query/useRecharge.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { request } from "../../lib/axios.config";
import { rechargeUrls } from "../api-urls/api.url";

// Get Wallet Info
export const getWalletInfo = async () => {
  const response = await request({
    url: rechargeUrls.WALLET_INFO,
    method: "GET",
  });
  return response?.data || {};
};

export const useWalletInfoQuery = () => {
  return useQuery({
    queryKey: ["walletInfo"],
    queryFn: getWalletInfo,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// Get Payment Methods
export const getPaymentMethods = async () => {
  const response = await request({
    url: rechargeUrls.PAYMENT_METHODS,
    method: "GET",
  });
  return response?.data || [];
};

export const usePaymentMethodsQuery = () => {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: getPaymentMethods,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};

// Create Recharge Order
interface CreateRechargeOrderPayload {
  amount: number;
  paymentMethodId: string;
}

const createRechargeOrder = async (payload: CreateRechargeOrderPayload) => {
  const response = await request({
    url: rechargeUrls.CREATE_ORDER,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useCreateRechargeOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRechargeOrder,
     onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechargeHistory"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to create recharge order",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// hooks/query/useRecharge.query.ts

// Add new hook for generating QR code
interface GenerateQRPayload {
  amount: number;
  paymentMethodId: string;
}

const generateQRCode = async (payload: GenerateQRPayload) => {
  const response = await request({
    url: rechargeUrls.GENERATE_QR,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useGenerateQRMutation = () => {
  return useMutation({
    mutationFn: generateQRCode,
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to generate QR code",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// Verify Recharge Payment
const verifyRechargePayment = async (formData: FormData) => {
  const response = await request({
    url: rechargeUrls.VERIFY_PAYMENT,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response?.data;
};

export const useVerifyRechargePaymentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyRechargePayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["walletInfo"] });
      queryClient.invalidateQueries({ queryKey: ["rechargeHistory"] });
      notifications.show({
        title: "Success",
        message: data?.message || "Payment submitted successfully",
        color: "green",
        autoClose: 4000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to verify payment",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// Get Recharge History
interface RechargeHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
}

const getRechargeHistory = async (params: RechargeHistoryParams) => {
  const response = await request({
    url: rechargeUrls.HISTORY,
    method: "GET",
    params,
  });
  return response?.data || { recharges: [], pagination: {} };
};

export const useRechargeHistoryQuery = (params: RechargeHistoryParams = {}) => {
  return useQuery({
    queryKey: ["rechargeHistory", params],
    queryFn: () => getRechargeHistory(params),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

// Admin: Approve Recharge
interface ApproveRechargePayload {
  orderId: string;
  remarks?: string;
}

const approveRecharge = async (payload: ApproveRechargePayload) => {
  const response = await request({
    url: rechargeUrls.APPROVE(payload.orderId),
    method: "PATCH",
    data: { remarks: payload.remarks },
  });
  return response?.data;
};

export const useApproveRechargeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRecharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechargeHistory"] });
      queryClient.invalidateQueries({ queryKey: ["walletInfo"] });
      notifications.show({
        title: "Success",
        message: "Recharge approved successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to approve recharge",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// Admin: Reject Recharge
interface RejectRechargePayload {
  orderId: string;
  remarks?: string;
}

const rejectRecharge = async (payload: RejectRechargePayload) => {
  const response = await request({
    url: rechargeUrls.REJECT(payload.orderId),
    method: "PATCH",
    data: { remarks: payload.remarks },
  });
  return response?.data;
};

export const useRejectRechargeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectRecharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rechargeHistory"] });
      notifications.show({
        title: "Success",
        message: "Recharge rejected",
        color: "orange",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to reject recharge",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};