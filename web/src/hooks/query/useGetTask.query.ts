import { useMutation, useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { taskUrls } from "../api-urls/api.url";

// ---------------- TYPES ----------------
export type TaskType = {
  _id: string;
  videoUrl: string;
  thumbnail: string;
  level: string;
  rewardPrice: number;
  order?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TPagination = {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
};

export type TTaskResponse = {
  tasks: TaskType[];
  pagination: TPagination;
};


// ---------------- GET TASKS ----------------
export const getTasks = async (params?: { page?: number; limit?: number; level?: string }): Promise<TTaskResponse> => {
  const response = await request({
    url: taskUrls.GET_USER_TASKS,
    method: "GET",
    params,
  });
  return response.data as TTaskResponse; // cast to TTaskResponse
};

// ---------------- INFINITE QUERY ----------------
export const useInfiniteTasksQuery = (params?: { level?: string; limit?: number }) => {
  const limit = params?.limit || 4;

  return useInfiniteQuery<
    TTaskResponse,               // response per page
    unknown,                     // error
    InfiniteData<TTaskResponse>, // infinite data
    [string, string?],           // query key
    number                        // pageParam type
  >({
    queryKey: ["tasks", params?.level],
    queryFn: async ({ pageParam = 1 }) => {
      return await getTasks({ ...params, page: pageParam, limit });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.tasks.length < limit) return undefined;
      return lastPage.pagination.currentPage + 1; // next page
    },
    initialPageParam: 1,
  });
};

// ---------------- CREATE TASK ----------------
export const createTask = async (data: {
  videoUrl: string;
  thumbnail: string;
  level: string;
  rewardPrice: number;
  order?: number;
}): Promise<TServerResponse> => {
  const response = await request({
    url: taskUrls.CREATE_TASK,
    method: "POST",
    data,
  });
  return response;
};

// ---------------- MUTATION ----------------
export const useCreateTaskMutation = () => {
  return useMutation<TServerResponse, unknown, {
    videoUrl: string;
    thumbnail: string;
    level: string;
    rewardPrice: number;
    order?: number;
  }>({
    mutationFn: (data) => createTask(data),
  });
};
