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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 2, // 2 minutes
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
  userId?: string;
  newLevelNumber: number;
}

const upgradeUserLevel = async (payload: UpgradeLevelPayload) => {
  const response = await request({
    url: levelUrls.UPGRADE_USER,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useUpgradeUserLevelMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upgradeUserLevel,
    onSuccess: (res) => {
      console.log(res)
      const { statusCode, title, message, data } = res || {};

      if (statusCode === 200) {
        notifications.show({
          title: title || "Success",
          message: message || "Level purchased successfully!",
          color: "green",
          autoClose: 4000,
        });

        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        queryClient.invalidateQueries({ queryKey: ["allLevels"] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        queryClient.invalidateQueries({ queryKey: ["infiniteTasks"] });

        if (data) {
          const userLevel = {
            currentLevel: data.newLevel,
            currentLevelNumber: data.levelNumber,
            mainWallet: data.remainingBalance,
            investmentAmount: data.totalInvestment,
          };
          localStorage.setItem("userLevel", JSON.stringify(userLevel));
        }
      } else {
        notifications.show({
          title: title || "Purchase Failed",
          message:
            message || "Something went wrong while upgrading your level.",
          color: "red",
          autoClose: 4000,
        });
      }

      return res;
    },
    onError: (error: any) => {
      notifications.show({
        title: error?.response?.data?.title || "Error",
        message:
          error?.response?.data?.message ||
          "Unable to purchase level. Please try again later.",
        color: "red",
        autoClose: 4000,
      });
      throw error;
    },
  });
};