import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

// Types
interface TaskFilters {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
  isActive?: boolean;
  levelNumber?: number;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateTaskPayload extends FormData {}
interface UpdateTaskPayload {
  taskId: string;
  data: FormData;
}

// Fetch all tasks
const fetchAllTasks = async (filters: TaskFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await request({
    url: `${adminUrls.TASKS}?${params.toString()}`,
    method: "GET",
  });

  return response.data;
};

// Fetch task by ID
const fetchTaskById = async (taskId: string) => {
  const response = await request({
    url: adminUrls.TASK_BY_ID(taskId),
    method: "GET",
  });
  return response.data;
};

// Create task
const createTask = async (formData: CreateTaskPayload) => {
  const response = await request({
    url: adminUrls.TASKS,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update task
const updateTask = async ({ taskId, data }: UpdateTaskPayload) => {
  const response = await request({
    url: adminUrls.TASK_BY_ID(taskId),
    method: "PUT",
    data,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Delete task
const deleteTask = async (taskId: string) => {
  const response = await request({
    url: adminUrls.TASK_BY_ID(taskId),
    method: "DELETE",
  });
  return response.data;
};

// Toggle task status
const toggleTaskStatus = async (taskId: string) => {
  const response = await request({
    url: adminUrls.TOGGLE_TASK_STATUS(taskId),
    method: "PATCH",
  });
  return response.data;
};

// React Query hooks
export const useAllTasks = (filters: TaskFilters) =>
  useQuery({
    queryKey: ["admin-tasks", filters],
    queryFn: () => fetchAllTasks(filters),
    staleTime: 30000, // 30 seconds
  });

export const useTaskById = (taskId: string) =>
  useQuery({
    queryKey: ["admin-task", taskId],
    queryFn: () => fetchTaskById(taskId),
    enabled: !!taskId,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["admin-task"] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });
};

export const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleTaskStatus,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });
};
