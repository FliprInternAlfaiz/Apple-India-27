import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { request } from "../../lib/axios.config";
import { withdrawalUrls } from "../api-urls/api.url";

// ✅ Wallet Info
export const getWalletInfo = async () => {
  const response = await request({
    url: withdrawalUrls.WALLET_INFO,
    method: "GET",
  });
  return response?.data;
};

export const useWalletInfoQuery = () => {
  return useQuery({
    queryKey: ["walletInfo"],
    queryFn: getWalletInfo,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

// ✅ Get Bank Accounts
export const getBankAccounts = async () => {
  const response = await request({
    url: withdrawalUrls.BANK_ACCOUNTS,
    method: "GET",
  });
  return response?.data || [];
};

export const useBankAccountsQuery = () => {
  return useQuery({
    queryKey: ["bankAccounts"],
    queryFn: getBankAccounts,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

// ✅ Add Bank Account
interface AddBankPayload {
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType?: string;
  isDefault?: boolean;
}

const addBankAccountRequest = async (payload: AddBankPayload) => {
  const response = await request({
    url: withdrawalUrls.BANK_ACCOUNTS,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useAddBankAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBankAccountRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      notifications.show({
        title: "Success",
        message: "Bank account added successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to add bank account",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// ✅ Delete Bank Account
const deleteBankAccountRequest = async (accountId: string) => {
  const response = await request({
    url: `${withdrawalUrls.BANK_ACCOUNTS}/${accountId}`,
    method: "DELETE",
  });
  return response.data;
};

export const useDeleteBankAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBankAccountRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      notifications.show({
        title: "Success",
        message: "Bank account deleted successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to delete bank account",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// ✅ Set Default Bank Account
const setDefaultAccountRequest = async (accountId: string) => {
  const response = await request({
    url: `${withdrawalUrls.BANK_ACCOUNTS}/${accountId}/set-default`,
    method: "PATCH",
  });
  return response?.data;
};

export const useSetDefaultAccountMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAccountRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      notifications.show({
        title: "Success",
        message: "Default account updated successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to update default account",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// ✅ Create Withdrawal
interface CreateWithdrawalPayload {
  walletType: string;
  amount: number;
  bankAccountId: string;
  withdrawalPassword: string;
}

const createWithdrawalRequest = async (payload: CreateWithdrawalPayload) => {
  const response = await request({
    url: withdrawalUrls.CREATE_WITHDRAWAL,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useCreateWithdrawalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["walletInfo"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalHistory"] });
      notifications.show({
        title: "Success",
        message: "Withdrawal request submitted successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create withdrawal request",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};

// ✅ Get Withdrawal History
interface WithdrawalHistoryParams {
  page?: number;
  limit?: number;
  status?: string;
}

const getWithdrawalHistory = async (params: WithdrawalHistoryParams) => {
  const response = await request({
    url: withdrawalUrls.WITHDRAWAL_HISTORY,
    method: "GET",
    params,
  });
  return response?.data;
};

export const useWithdrawalHistoryQuery = (params: WithdrawalHistoryParams) => {
  return useQuery({
    queryKey: ["withdrawalHistory", params],
    queryFn: () => getWithdrawalHistory(params),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};

// ✅ Set Withdrawal Password
interface SetPasswordPayload {
  currentPassword?: string;
  newPassword: string;
}

const setWithdrawalPasswordRequest = async (payload: SetPasswordPayload) => {
  const response = await request({
    url: withdrawalUrls.SET_PASSWORD,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useSetWithdrawalPasswordMutation = () => {
  return useMutation({
    mutationFn: setWithdrawalPasswordRequest,
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Withdrawal password set successfully",
        color: "green",
        autoClose: 3000,
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to set withdrawal password",
        color: "red",
        autoClose: 4000,
      });
    },
  });
};