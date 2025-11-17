import { useQuery } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { teamUrls } from "../api-urls/api.url";

interface TeamReferralHistoryParams {
  page?: number;
  limit?: number;
  level?: string;
  transactionType?: string;
}

interface ReferredUser {
  _id: string;
  name: string;
  phone: string;
  picture?: string;
}

interface TeamReferralHistoryItem {
  _id: string;
  userId: string;
  referredUserId: ReferredUser;
  referrerUserId: {
    _id: string;
    name: string;
    phone: string;
  };
  level: 'A' | 'B' | 'C';
  amount: number;
  transactionType: 'signup_bonus' | 'investment_commission' | 'level_bonus';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface TeamReferralHistoryResponse {
  history: TeamReferralHistoryItem[];
  totalEarnings: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
  };
}


const getTeamReferralHistory = async (
  params: TeamReferralHistoryParams
): Promise<TeamReferralHistoryResponse> => {
  const response = await request({
    url: teamUrls.REFERRAL_HISTORY,
    method: "GET",
    params,
  });
  return response?.data || { history: [], totalEarnings: 0, pagination: {} };
};


const fetchTeamStats = async () => {
  const response = await request({
    url: teamUrls.TEAM_STATS,
    withCredentials: true,
    method: "GET",
  });
  return response.data;
};

export const useTeamStatsQuery = () => {
  return useQuery({
    queryKey: ["team-stats"],
    queryFn: fetchTeamStats,
  });
};

export const useTeamReferralHistoryQuery = (
  params: TeamReferralHistoryParams = {}
) => {
  return useQuery({
    queryKey: ["teamReferralHistory", params],
    queryFn: () => getTeamReferralHistory(params),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, 
    retry: 2,
  });
};

const fetchReferralLink = async () => {
  const response = await request({
    url: teamUrls.REFERRAL_LINK,
    withCredentials: true,
    method: "GET",
  });
  return response;
};

export const useReferralLinkQuery = () => {
  return useQuery({
    queryKey: ["referral-link"],
    queryFn: fetchReferralLink,
  });
};

const fetchTeamMembersByLevel = async (level: string) => {
  const response = await request({
    url: teamUrls.TEAM_MEMBERS(level),
    withCredentials: true,
    method: "GET",
  });
  return response.data;
};

export const useTeamMembersByLevelQuery = (level: string, enabled = false) => {
  return useQuery({
    queryKey: ["team-members", level],
    queryFn: () => fetchTeamMembersByLevel(level),
    enabled,
  });
};
