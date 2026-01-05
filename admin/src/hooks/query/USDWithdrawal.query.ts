import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usdWithdrawalUrls, userUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// ==================== Types ====================

interface USDWithdrawalFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

interface ToggleUSDUserPayload {
  userId: string;
  isUSDUser: boolean;
}

interface FundUSDWalletPayload {
  userId: string;
  amountINR: number;
  description?: string;
}

interface ApproveUSDWithdrawalPayload {
  withdrawalId: string;
  remarks?: string;
}

interface RejectUSDWithdrawalPayload {
  withdrawalId: string;
  reason: string;
}

// ==================== Fetch Queries ====================

// ✅ Get all USD withdrawals with filters
const fetchAllUSDWithdrawals = async (filters: USDWithdrawalFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: usdWithdrawalUrls.USD_WITHDRAWALS + "?" + params.toString(),
    method: "GET",
  });

  return response.data;
};

// ✅ Get USD wallet for a user
const fetchUSDWalletByUser = async (userId: string) => {
  const response = await request({
    url: userUrls.GET_USD_WALLET(userId),
    method: "GET",
  });

  return response.data;
};

// ==================== Mutations ====================

// ✅ Toggle USD user status
const toggleUSDUserStatus = async ({ userId, isUSDUser }: ToggleUSDUserPayload) => {
  const response = await request({
    url: userUrls.TOGGLE_USD_USER(userId),
    method: "PATCH",
    data: { isUSDUser },
  });

  return response.data;
};

// ✅ Fund USD wallet
const fundUSDWallet = async ({ userId, amountINR, description }: FundUSDWalletPayload) => {
  const response = await request({
    url: userUrls.FUND_USD_WALLET(userId),
    method: "POST",
    data: { amountINR, description },
  });

  return response.data;
};

// ✅ Approve USD withdrawal
const approveUSDWithdrawal = async ({ withdrawalId, remarks }: ApproveUSDWithdrawalPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.APPROVE_USD_WITHDRAWAL(withdrawalId),
    method: "PATCH",
    data: { remarks },
  });

  return response.data;
};

// ✅ Reject USD withdrawal
const rejectUSDWithdrawal = async ({ withdrawalId, reason }: RejectUSDWithdrawalPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.REJECT_USD_WITHDRAWAL(withdrawalId),
    method: "PATCH",
    data: { reason },
  });

  return response.data;
};

// ==================== React Query Hooks ====================

// ✅ Fetch All USD Withdrawals
export const useAllUSDWithdrawals = (filters: USDWithdrawalFilters) =>
  useQuery({
    queryKey: ["admin-usd-withdrawals", filters],
    queryFn: () => fetchAllUSDWithdrawals(filters),
    staleTime: 30 * 1000, // 30s
  });

// ✅ Fetch USD Wallet for User
export const useUSDWalletByUser = (userId: string) =>
  useQuery({
    queryKey: ["admin-usd-wallet", userId],
    queryFn: () => fetchUSDWalletByUser(userId),
    enabled: !!userId,
  });

// ✅ Toggle USD User Status Mutation
export const useToggleUSDUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleUSDUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-wallet"] });
    },
  });
};

// ✅ Fund USD Wallet Mutation
export const useFundUSDWallet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fundUSDWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-wallet"] });
    },
  });
};

// ✅ Approve USD Withdrawal Mutation
export const useApproveUSDWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveUSDWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};

// ✅ Reject USD Withdrawal Mutation
export const useRejectUSDWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectUSDWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};

// ==================== Withdrawal Settings ====================

// Fetch withdrawal settings
const fetchWithdrawalSettings = async () => {
  const response = await request({
    url: usdWithdrawalUrls.GET_SETTINGS,
    method: "GET",
  });
  return response.data;
};

export const useWithdrawalSettings = () =>
  useQuery({
    queryKey: ["withdrawal-settings"],
    queryFn: fetchWithdrawalSettings,
    staleTime: 60 * 1000,
  });

// Update withdrawal settings
interface UpdateSettingsPayload {
  stripeEnabled?: boolean;
  bitgetEnabled?: boolean;
  bitgetApiKey?: string;
  bitgetSecretKey?: string;
  bitgetPassphrase?: string;
  bitgetNetwork?: string;
  bitgetCurrency?: string;
  usdExchangeRate?: number;
  minWithdrawalINR?: number;
  maxWithdrawalINR?: number;
  stripeFeePercent?: number;
  bitgetFeePercent?: number;
  defaultWithdrawalMethod?: 'stripe' | 'bitget';
  notes?: string;
}

const updateWithdrawalSettings = async (payload: UpdateSettingsPayload) => {
  const response = await request({
    url: usdWithdrawalUrls.UPDATE_SETTINGS,
    method: "PUT",
    data: payload,
  });
  return response.data;
};

export const useUpdateWithdrawalSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWithdrawalSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-usd-withdrawals"] });
    },
  });
};

// Test Bitget connection
const testBitgetConnection = async () => {
  const response = await request({
    url: usdWithdrawalUrls.TEST_BITGET,
    method: "GET",
  });
  return response.data;
};

export const useTestBitgetConnection = () => {
  return useMutation({
    mutationFn: testBitgetConnection,
  });
};

// Fetch Bitget Balance (uses test-bitget endpoint)
export const useBitgetBalance = () =>
  useQuery({
    queryKey: ["bitget-balance"],
    queryFn: testBitgetConnection,
    staleTime: 30 * 1000, // 30s
    refetchInterval: 60 * 1000, // Refresh every minute
  });

// Check Bitget withdrawal status
const checkBitgetStatus = async (withdrawalId: string) => {
  const response = await request({
    url: usdWithdrawalUrls.BITGET_STATUS(withdrawalId),
    method: "GET",
  });
  return response.data;
};

export const useCheckBitgetStatus = () => {
  return useMutation({
    mutationFn: checkBitgetStatus,
  });
};