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
  dailyLimit:number;
  remainingTasks:number;
  limitReached:number;
};

export type TTaskResponse = {
  tasks: TaskType[];
  pagination: TPagination;
  stats?: TTaskStats;
};

export type TSingleTaskResponse = {
  task: TaskType;
};

export type TCompleteTaskResponse = {
  status: "success" | "error";
  rewardAmount: number;
  newBalance: number;
  todayTasksCompleted: number;
  totalTasksCompleted: number;
  todayIncome: number;
};

export const getTasks = async (params?: {
  page?: number;
  limit?: number;
  level?: string;
}): Promise<TTaskResponse> => {

    const response = await request({
      url: taskUrls.GET_USER_TASKS,
      method: "GET",
      params,
    });

    return response.data as TTaskResponse;
  
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
      if (!lastPage?.tasks?.length) return undefined;

      const { currentPage, totalPages } = lastPage.pagination || {};
      if (!currentPage || currentPage >= totalPages) return undefined;

      return currentPage + 1;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
    retry: false, 
  });
};


export const getTaskById = async (
  taskId: string
): Promise<TSingleTaskResponse> => {
  const response = await request({
    url: `${taskUrls.GET_TASK_BY_ID}/${taskId}`,
    method: "GET",
  });
  return response.data as TSingleTaskResponse;
};

export const useTaskQuery = (taskId: string) => {
  return useQuery<TSingleTaskResponse, Error>({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: !!taskId,
    staleTime: 1000 * 60 * 5,
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
  return useMutation<
    TServerResponse,
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
