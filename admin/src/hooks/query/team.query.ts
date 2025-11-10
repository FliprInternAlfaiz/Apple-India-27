// hooks/useAdminTeam.ts
import { useQuery } from "@tanstack/react-query";
import { adminUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// Types
interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
}

// Fetch all team referrals
const fetchAllTeamReferrals = async (filters: TeamFilters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: `${adminUrls.TEAM_REFERRALS}?${params.toString()}`,
    method: "GET",
  });

  return response.data;
};

// Fetch team statistics
const fetchTeamStatistics = async () => {
  const response = await request({
    url: adminUrls.TEAM_STATISTICS,
    method: "GET",
  });

  return response.data;
};

// Fetch referrals by level
const fetchReferralsByLevel = async (level: string) => {
  const response = await request({
    url: `${adminUrls.TEAM_REFERRALS}/level/${level}`,
    method: "GET",
  });

  return response.data;
};

// Fetch user's referral tree
const fetchReferralTree = async (userId: string) => {
  const response = await request({
    url: `${adminUrls.TEAM_REFERRALS}/tree/${userId}`,
    method: "GET",
  });

  return response.data;
};

// Hooks
export const useAllTeamReferrals = (filters: TeamFilters) => {
  return useQuery({
    queryKey: ["admin-team-referrals", filters],
    queryFn: () => fetchAllTeamReferrals(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useTeamStatistics = () => {
  return useQuery({
    queryKey: ["admin-team-statistics"],
    queryFn: fetchTeamStatistics,
    staleTime: 60000, // 1 minute
  });
};

export const useReferralsByLevel = (level: string) => {
  return useQuery({
    queryKey: ["admin-referrals-by-level", level],
    queryFn: () => fetchReferralsByLevel(level),
    enabled: !!level,
  });
};

export const useReferralTree = (userId: string) => {
  return useQuery({
    queryKey: ["admin-referral-tree", userId],
    queryFn: () => fetchReferralTree(userId),
    enabled: !!userId,
  });
};