import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

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
