import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { request } from "../../lib/axios.config";
import { usdWithdrawalUrls } from "../api-urls/api.url";

// ================== Query Functions ==================

// Get USD Wallet Info
export const getUSDWalletInfo = async () => {
  const response = await request({
    url: usdWithdrawalUrls.WALLET_INFO,
    method: "GET",
  });
  return response?.data;
};

export const useUSDWalletInfo = () => {
  return useQuery({
    queryKey: ["usdWalletInfo"],
    queryFn: getUSDWalletInfo,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

// Get Available Withdrawal Methods
export const getWithdrawalMethods = async () => {
  const response = await request({
    url: usdWithdrawalUrls.WITHDRAWAL_METHODS,
    method: "GET",
  });
  return response?.data;
};

export const useWithdrawalMethods = () => {
  return useQuery({
    queryKey: ["withdrawalMethods"],
    queryFn: getWithdrawalMethods,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// Check Stripe Connect Status
export const checkStripeConnectStatus = async () => {
  const response = await request({
    url: usdWithdrawalUrls.CHECK_CONNECT_STATUS,
    method: "GET",
  });
  // Transform API response to match frontend expectations
  const data = response?.data;
  return {
    isOnboarded: Boolean(data?.connected) || data?.status === "connected",
    stripeAccountId: data?.accountId || null,
    status: data?.status || null,
  };
};

export const useStripeConnectStatus = () => {
  return useQuery({
    queryKey: ["stripeConnectStatus"],
    queryFn: checkStripeConnectStatus,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};

// Get USD Withdrawal History
export const getUSDWithdrawalHistory = async (page: number = 1, limit: number = 10) => {
  const response = await request({
    url: `${usdWithdrawalUrls.WITHDRAWAL_HISTORY}?page=${page}&limit=${limit}`,
    method: "GET",
  });
  return response?.data;
};

export const useUSDWithdrawalHistory = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["usdWithdrawalHistory", page, limit],
    queryFn: () => getUSDWithdrawalHistory(page, limit),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};

// Get USD Transaction History
export const getUSDTransactionHistory = async (page: number = 1, limit: number = 10, type?: string) => {
  let url = `${usdWithdrawalUrls.TRANSACTION_HISTORY}?page=${page}&limit=${limit}`;
  if (type) url += `&type=${type}`;
  
  const response = await request({
    url,
    method: "GET",
  });
  return response?.data;
};

export const useUSDTransactionHistory = (page: number = 1, limit: number = 10, type?: string) => {
  return useQuery({
    queryKey: ["usdTransactionHistory", page, limit, type],
    queryFn: () => getUSDTransactionHistory(page, limit, type),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};

// ================== Mutation Functions ==================

// Create Stripe Connect Account
const createStripeConnectAccount = async (returnUrl: string) => {
  const response = await request({
    url: usdWithdrawalUrls.CREATE_CONNECT_ACCOUNT,
    method: "POST",
    data: { returnUrl },
  });
  return response?.data;
};

export const useCreateStripeConnectAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStripeConnectAccount,
    onSuccess: (data) => {
      if (data?.onboardingUrl) {
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      }
      queryClient.invalidateQueries({ queryKey: ["stripeConnectStatus"] });
      queryClient.invalidateQueries({ queryKey: ["usdWalletInfo"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create Stripe account",
        color: "red",
      });
    },
  });
};

// Create USD Withdrawal
interface CreateUSDWithdrawalPayload {
  amountINR: number;
}

const createUSDWithdrawal = async (payload: CreateUSDWithdrawalPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.CREATE_WITHDRAWAL,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useCreateUSDWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUSDWithdrawal,
    onSuccess: (data) => {
      notifications.show({
        title: "Success",
        message: data?.message || "USD withdrawal request submitted successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["usdWalletInfo"] });
      queryClient.invalidateQueries({ queryKey: ["usdWithdrawalHistory"] });
      queryClient.invalidateQueries({ queryKey: ["usdTransactionHistory"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create withdrawal request",
        color: "red",
      });
    },
  });
};

// ================== Binance Functions ==================

// Save Binance Wallet Address
interface SaveBinanceWalletPayload {
  binanceWalletAddress: string;
  binanceNetwork: string;
}

const saveBinanceWalletAddress = async (payload: SaveBinanceWalletPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.SAVE_BINANCE_WALLET,
    method: "POST",
    data: {
      walletAddress: payload.binanceWalletAddress,
      network: payload.binanceNetwork,
    },
  });
  return response?.data;
};

export const useSaveBinanceWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveBinanceWalletAddress,
    onSuccess: (data) => {
      notifications.show({
        title: "Success",
        message: data?.message || "Binance wallet address saved successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["usdWalletInfo"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalMethods"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to save Binance wallet address",
        color: "red",
      });
    },
  });
};

// Create USD Withdrawal with method selection
interface CreateUSDWithdrawalWithMethodPayload {
  amountINR: number;
  withdrawalMethod?: 'stripe' | 'binance';
}

const createUSDWithdrawalWithMethod = async (payload: CreateUSDWithdrawalWithMethodPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.CREATE_WITHDRAWAL,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useCreateUSDWithdrawalWithMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUSDWithdrawalWithMethod,
    onSuccess: (data) => {
      notifications.show({
        title: "Success",
        message: data?.message || "USD withdrawal request submitted successfully",
        color: "green",
      });
      queryClient.invalidateQueries({ queryKey: ["usdWalletInfo"] });
      queryClient.invalidateQueries({ queryKey: ["usdWithdrawalHistory"] });
      queryClient.invalidateQueries({ queryKey: ["usdTransactionHistory"] });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create withdrawal request",
        color: "red",
      });
    },
  });
};
