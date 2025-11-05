import { useQuery } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { teamUrls } from "../api-urls/api.url";

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
