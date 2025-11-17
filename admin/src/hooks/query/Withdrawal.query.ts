import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";
import { notifications } from "@mantine/notifications";

interface WithdrawalFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  walletType?: string;
}

interface ApprovePayload {
  withdrawalId: string;
  transactionId: string;
  remarks?: string;
}

interface RejectPayload {
  withdrawalId: string;
  remarks: string;
}


export const useAllWithdrawals = (filters: WithdrawalFilters) =>
  useQuery({
    queryKey: ["withdrawals", filters],
    queryFn: async () =>
      (
        await request({
          url: withdrawalUrls.WITHDRAWALS,
          method: "GET",
          params: filters,
        })
      ).data,
  });

export const useWithdrawalStatistics = () =>
  useQuery({
    queryKey: ["withdrawal-statistics"],
    queryFn: async () =>
      (
        await request({
          url: withdrawalUrls.WITHDRAWAL_STATISTICS,
          method: "GET",
        })
      ).data,
  });


export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ApprovePayload) =>
      (
        await request({
          url: withdrawalUrls.APPROVE_WITHDRAWAL(payload.withdrawalId),
          method: "PATCH",
          data: {
            transactionId: payload.transactionId,
            remarks: payload.remarks,
          },
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
};

export const useRejectWithdrawal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RejectPayload) =>
      (
        await request({
          url: withdrawalUrls.REJECT_WITHDRAWAL(payload.withdrawalId),
          method: "PATCH",
          data: {
            remarks: payload.remarks,
          },
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] }),
  });
};

export interface ConfigType {
  dayOfWeek: number;
  dayName: string;
  allowedLevels: number[];
  isActive: boolean;
  startTime: string;
  endTime: string;
}

interface BulkUpdatePayload {
  configs: ConfigType[];
}

interface UpdateConfigPayload {
  dayOfWeek: number;
  config: Omit<ConfigType, "dayName" | "dayOfWeek">;
}

// ✅ Fetch all configs
const getWithdrawalConfigs = async () => {
  const response = await request({
    url: withdrawalUrls.WITHDRAWAL_CONFIGS,
    method: "GET",
  });
  return response?.data;
};

export const useWithdrawalConfigs = () => {
  return useQuery({
    queryKey: ["admin-withdrawal-configs"],
    queryFn: getWithdrawalConfigs,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
};

// ✅ Update single config
const updateWithdrawalConfig = async (payload: UpdateConfigPayload) => {
  const response = await request({
    url: withdrawalUrls.UPDATE_WITHDRAWAL_CONFIG(payload.dayOfWeek),
    method: "PUT",
    data: payload.config,
  });
  return response?.data;
};

export const useUpdateWithdrawalConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateWithdrawalConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-configs"] });
      notifications.show({
        title: "Success",
        message: "Configuration updated successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Failed to update withdrawal configuration",
        color: "red",
      });
    },
  });
};

// ✅ Bulk update configs
const bulkUpdateConfigs = async (payload: BulkUpdatePayload) => {
  const response = await request({
    url: withdrawalUrls.BULK_UPDATE_CONFIGS,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useBulkUpdateConfigs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkUpdateConfigs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawal-configs"] });
      notifications.show({
        title: "Success",
        message: "All configurations updated successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message ||
          "Failed to update configurations",
        color: "red",
      });
    },
  });
};