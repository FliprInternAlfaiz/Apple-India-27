// hooks/useVerifyUserQuery.ts
import { useQuery } from "@tanstack/react-query";
import { authUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

interface UserResponse {
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
  totalTasksCompleted: number;
  todayTasksCompleted: number;
  userLevel: number;
  levelName: string;
  isActive: boolean;
  isVerified: boolean;
  referralCode?: string;
  totalReferrals: number;
  teamLevel:string;
  currentLevel:string;
  currentLevelNumber:number;
}

interface TServerResponse {
  status: "success" | "error";
  statusCode: number;
  title: string;
  message: string;
  data?: {
    user: UserResponse;
    stats: {
      todayIncome: number;
      monthlyIncome: number;
      totalRevenue: number;
      totalWithdrawals: number;
      mainWallet: number;
      commissionWallet: number;
      profit: number;
    };
  };
}

export const verifyUser = async (): Promise<TServerResponse> => {
  const response: TServerResponse = await request({
    url: authUrls.VERIFYUSER,
    method: "GET",
  });

  return response;
};

export const useVerifyUserQuery = () => {
  return useQuery({
    queryKey: ["verifyUser"],
    queryFn: () => verifyUser(),
    retry: false,
    staleTime: 1000 * 60, // 1 minute for fresher wallet/stats data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};