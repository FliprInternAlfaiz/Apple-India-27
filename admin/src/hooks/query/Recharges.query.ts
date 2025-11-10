import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { rechargeUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

interface RechargesFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const useAllRecharges = (filters: RechargesFilters) =>
  useQuery({
    queryKey: ["recharges", filters],
    queryFn: async () =>
      (
        await request({
          url: rechargeUrls.RECHARGES,
          method: "GET",
          params: filters,
        })
      ).data,
  });

export const useRechargeStatistics = () =>
  useQuery({
    queryKey: ["recharge-statistics"],
    queryFn: async () =>
      (
        await request({
          url: rechargeUrls.RECHARGE_STATISTICS,
          method: "GET",
        })
      ).data,
  });

export const useApproveRecharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, remarks }: { orderId: string; remarks?: string }) =>
      (
        await request({
          url: rechargeUrls.APPROVE_RECHARGE(orderId),
          method: "PATCH",
          data: { remarks },
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recharges"] }),
  });
};

export const useRejectRecharge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, remarks }: { orderId: string; remarks: string }) =>
      (
        await request({
          url: rechargeUrls.REJECT_RECHARGE(orderId),
          method: "PATCH",
          data: { remarks },
        })
      ).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recharges"] }),
  });
};
