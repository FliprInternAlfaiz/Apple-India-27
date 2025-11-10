// hooks/useAdminLevels.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// Types
interface LevelFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateLevelPayload {
  levelNumber: number;
  levelName: string;
  investmentAmount: number;
  rewardPerTask: number;
  dailyTaskLimit: number;
  aLevelCommissionRate: number;
  bLevelCommissionRate: number;
  cLevelCommissionRate: number;
  icon?: string;
  description?: string;
  order?: number;
}

interface UpdateLevelPayload {
  levelId: string;
  data: Partial<CreateLevelPayload> & {
    isActive?: boolean;
  };
}

// Fetch all levels
const fetchAllLevels = async (filters: LevelFilters) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: `${adminUrls.LEVELS}?${params.toString()}`,
    method: "GET",
  });

  return response.data;
};

// Fetch single level
const fetchLevelById = async (levelId: string) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "GET",
  });

  return response.data;
};

// Create level
const createLevel = async (data: CreateLevelPayload) => {
  const response = await request({
    url: adminUrls.LEVELS,
    method: "POST",
    data,
  });

  return response.data;
};

// Update level
const updateLevel = async ({ levelId, data }: UpdateLevelPayload) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "PUT",
    data,
  });

  return response.data;
};

// Delete level
const deleteLevel = async (levelId: string) => {
  const response = await request({
    url: `${adminUrls.LEVELS}/${levelId}`,
    method: "DELETE",
  });

  return response.data;
};

// Hooks
export const useAllLevels = (filters: LevelFilters) => {
  return useQuery({
    queryKey: ["admin-levels", filters],
    queryFn: () => fetchAllLevels(filters),
    staleTime: 30000, // 30 seconds
  });
};

export const useLevelById = (levelId: string) => {
  return useQuery({
    queryKey: ["admin-level", levelId],
    queryFn: () => fetchLevelById(levelId),
    enabled: !!levelId,
  });
};

export const useCreateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
    },
  });
};

export const useUpdateLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
      queryClient.invalidateQueries({ queryKey: ["admin-level"] });
    },
  });
};

export const useDeleteLevel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLevel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-levels"] });
    },
  });
};