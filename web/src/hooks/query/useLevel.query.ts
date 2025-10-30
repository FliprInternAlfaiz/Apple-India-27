import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { request } from "../../lib/axios.config";
import { levelUrls } from "../api-urls/api.url";

/* ----------------------------- GET ALL LEVELS ----------------------------- */
const getAllLevels = async () => {
  const response = await request({
    url: levelUrls.GET_ALL,
    method: "GET",
  });
  return response?.data || [];
};

export const useGetAllLevelsQuery = () => {
  return useQuery({
    queryKey: ["allLevels"],
    queryFn: getAllLevels,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};

/* --------------------------- GET LEVEL BY NAME ---------------------------- */
const getLevelByName = async (levelName: string) => {
  const response = await request({
    url: levelUrls.GET_BY_NAME(levelName),
    method: "GET",
  });
  return response?.data;
};

export const useGetLevelByNameQuery = (levelName: string) => {
  return useQuery({
    queryKey: ["levelByName", levelName],
    queryFn: () => getLevelByName(levelName),
    enabled: !!levelName,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
};

/* -------------------------- GET LEVEL BY NUMBER --------------------------- */
const getLevelByNumber = async (levelNumber: number) => {
  const response = await request({
    url: levelUrls.GET_BY_NUMBER(levelNumber),
    method: "GET",
  });
  return response?.data;
};

export const useGetLevelByNumberQuery = (levelNumber?: number) => {
  return useQuery({
    queryKey: ["levelByNumber", levelNumber],
    queryFn: () => getLevelByNumber(levelNumber!),
    enabled: !!levelNumber,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
};

/* ----------------------------- CREATE LEVEL ------------------------------- */
interface CreateLevelPayload {
  name: string;
  number: number;
  rewards?: number;
  description?: string;
}

const createLevel = async (payload: CreateLevelPayload) => {
  const response = await request({
    url: levelUrls.CREATE_LEVEL,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useCreateLevelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLevel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allLevels"] });
      notifications.show({
        title: "Success",
        message: data?.message || "Level created successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to create level",
        color: "red",
      });
    },
  });
};

/* ----------------------------- UPDATE LEVEL ------------------------------- */
interface UpdateLevelPayload {
  levelId: string;
  updates: {
    name?: string;
    number?: number;
    rewards?: number;
    description?: string;
  };
}

const updateLevel = async ({ levelId, updates }: UpdateLevelPayload) => {
  const response = await request({
    url: levelUrls.UPDATE_LEVEL(levelId),
    method: "PUT",
    data: updates,
  });
  return response?.data;
};

export const useUpdateLevelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLevel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["allLevels"] });
      notifications.show({
        title: "Success",
        message: data?.message || "Level updated successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message: error?.response?.data?.message || "Failed to update level",
        color: "red",
      });
    },
  });
};

/* --------------------------- UPGRADE USER LEVEL --------------------------- */
interface UpgradeLevelPayload {
  userId?: string; // optional if backend identifies via token
  newLevelNumber: number;
}

const upgradeUserLevel = async (payload: UpgradeLevelPayload) => {
  const response = await request({
    url: levelUrls.UPGRADE_USER,
    method: "POST",
    data: payload,
  });
  return response?.data;
};

export const useUpgradeUserLevelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeUserLevel,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["allLevels"] });
      notifications.show({
        title: "Success",
        message: data?.message || "User level upgraded successfully",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Error",
        message:
          error?.response?.data?.message || "Failed to upgrade user level",
        color: "red",
      });
    },
  });
};
