import {
  useMutation,
  useInfiniteQuery,
  type InfiniteData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { taskUrls } from "../api-urls/api.url";

export type TaskType = {
  _id: string;
  videoUrl: string;
  thumbnail: string;
  level: string;
  rewardPrice: number;
  order?: number;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TPagination = {
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  limit: number;
};

export type TTaskStats = {
  todayCompleted: number;
  totalAvailable: number;
  dailyLimit: number;
  remainingTasks: number;
  limitReached: boolean;
  userLevel: string | null;
  userLevelNumber: number | null;
  rewardPerTask?: number;
  maxDailyEarning?: number;
  todayIncome?: number; // Added this field
};

export type TTaskResponse = {
  tasks: TaskType[];
  pagination: TPagination;
  stats?: TTaskStats;
  requiresLevelPurchase?: boolean;
};

export type TSingleTaskResponse = {
  task: TaskType;
};

export type TCompleteTaskResponse = {
  status: "success" | "error";
  rewardAmount: number;
  commissionWallet: number;
  todayTasksCompleted: number;
  totalTasksCompleted: number;
  todayIncome: number;
  dailyLimit: number;
  remainingTasks: number;
};

export const getTasks = async (params?: {
  page?: number;
  limit?: number;
  level?: string;
}): Promise<TTaskResponse> => {
  try {
    const response = await request({
      url: taskUrls.GET_USER_TASKS,
      method: "GET",
      params,
    });

    if (response?.data) {
      return {
        tasks: response.data.tasks || [],
        pagination: response.data.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalTasks: 0,
          limit: params?.limit || 10,
        },
        stats: response.data.stats || {
          todayCompleted: 0,
          totalAvailable: 0,
          dailyLimit: 0,
          remainingTasks: 0,
          limitReached: false,
          userLevel: null,
          userLevelNumber: null,
          todayIncome: 0,
        },
        requiresLevelPurchase: response.data.requiresLevelPurchase || false,
      };
    }

    return {
      tasks: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalTasks: 0,
        limit: params?.limit || 10,
      },
      stats: {
        todayCompleted: 0,
        totalAvailable: 0,
        dailyLimit: 0,
        remainingTasks: 0,
        limitReached: false,
        userLevel: null,
        userLevelNumber: null,
        todayIncome: 0,
      },
    };
  } catch (error: any) {
    if (error?.response?.status === 403) {
      return {
        tasks: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalTasks: 0,
          limit: params?.limit || 10,
        },
        stats: {
          todayCompleted: 0,
          totalAvailable: 0,
          dailyLimit: 0,
          remainingTasks: 0,
          limitReached: false,
          userLevel: null,
          userLevelNumber: null,
          todayIncome: 0,
        },
        requiresLevelPurchase: true,
      };
    }

    throw error;
  }
};

export const useInfiniteTasksQuery = (params?: {
  level?: string;
  limit?: number;
}) => {
  const limit = params?.limit || 4;

  return useInfiniteQuery<
    TTaskResponse,
    unknown,
    InfiniteData<TTaskResponse>,
    [string, string?],
    number
  >({
    queryKey: ["tasks", params?.level],
    queryFn: async ({ pageParam = 1 }) => {
      return await getTasks({ ...params, page: pageParam, limit });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage?.requiresLevelPurchase) return undefined;
      
      if (!lastPage?.tasks?.length) return undefined;

      const { currentPage, totalPages } = lastPage.pagination || {};
      if (!currentPage || !totalPages || currentPage >= totalPages) return undefined;

      return currentPage + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 30, // 30 seconds for fresher data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
  });
};

export const getTaskById = async (
  taskId: string
): Promise<TSingleTaskResponse> => {
  try {
    const response = await request({
      url: `${taskUrls.GET_TASK_BY_ID}/${taskId}`,
      method: "GET",
    });
    
    if (!response?.data?.task) {
      throw new Error("Task not found");
    }
    
    return response.data as TSingleTaskResponse;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

export const useTaskQuery = (taskId: string) => {
  return useQuery<TSingleTaskResponse, Error>({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 30, // 30 seconds for fresher data
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

export const completeTask = async (
  taskId: string
): Promise<TCompleteTaskResponse> => {
  const response = await request({
    url: `${taskUrls.COMPLETE_TASK}/${taskId}/complete`,
    method: "POST",
  });
  return response.data;
};

export const useCompleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<TCompleteTaskResponse, Error, string>({
    mutationFn: (taskId) => completeTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["verifyUser"] });
    },
  });
};

export const createTask = async (data: {
  videoUrl: string;
  thumbnail: string;
  level: string;
  rewardPrice: number;
  order?: number;
}): Promise<any> => {
  const response = await request({
    url: taskUrls.CREATE_TASK,
    method: "POST",
    data,
  });
  return response;
};

export const useCreateTaskMutation = () => {
  return useMutation<
    any,
    unknown,
    {
      videoUrl: string;
      thumbnail: string;
      level: string;
      rewardPrice: number;
      order?: number;
    }
  >({
    mutationFn: (data) => createTask(data),
  });
};