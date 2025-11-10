import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

interface PaymentMethodFilters {
  page?: number;
  limit?: number;
  search?: string;
  methodType?: string;
}

export const useAllPaymentMethods = (filters?: PaymentMethodFilters) => {
  return useQuery({
    queryKey: ["payment-methods", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const res = await request({
        url: `${paymentUrls.PAYMENT_METHODS}?${params.toString()}`,
        method: "GET",
      });
      return res.data;
    },
    staleTime: 30000,
  });
};

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) =>
      (
        await request({
          url: paymentUrls.PAYMENT_METHODS,
          method: "POST",
          data,
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ methodId, data }: { methodId: string; data: any }) =>
      (
        await request({
          url: paymentUrls.PAYMENT_METHOD_BY_ID(methodId),
          method: "PUT",
          data,
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (methodId: string) =>
      (
        await request({
          url: paymentUrls.PAYMENT_METHOD_BY_ID(methodId),
          method: "DELETE",
        })
      ).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] }),
  });
};
