import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

interface UpdateProfileData {
  name?: string;
  phone?: string;
  picture?: File;
}

interface UserData {
  id: string;
  name: string;
  phone: string;
  username: string;
  picture?: string;
  mainWallet: number;
  commissionWallet: number;
  todayIncome: number;
  monthlyIncome: number;
  totalRevenue: number;
  totalWithdrawals: number;
  totalProfit: number;
  userLevel: number;
  levelName: string;
}

interface UpdateProfileResponse {
  status: "success" | "error";
  statusCode: number;
  title: string;
  message: string;
  data?: {
    user: UserData;
  };
}

const updateProfile = async (
  data: UpdateProfileData
): Promise<UpdateProfileResponse> => {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.phone) formData.append("phone", data.phone);
  if (data.picture) formData.append("profileImage", data.picture);

  const response = await request({
    url: authUrls.UPDATEPROFILE,
    method: "PUT",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response;
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateProfileResponse, Error, UpdateProfileData>({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["verifyUser"] });
      
      if (data.data?.user) {
        queryClient.setQueryData(["verifyUser"], (oldData: any) => {
          if (oldData?.data?.user) {
            return {
              ...oldData,
              data: {
                ...oldData.data,
                user: {
                  ...oldData.data.user,
                  ...data?.data?.user,
                },
              },
            };
          }
          return oldData;
        });
      }
    },
    onError: (error) => {
      console.error("Profile update mutation error:", error);
    },
  });
};