import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { conferenceNewsUrls } from "../api-urls/api.url";

/* =====================================================
   🧩 Types
===================================================== */
export interface ConferenceNews {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  priority?: number;
  expiryDate?: string;
  clickUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedConferenceNewsResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  paginated:string;
  data: ConferenceNews[];
}

export interface ActiveConferenceNewsResponse {
  success: boolean;
  data: ConferenceNews[];
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    imageUrl: string;
    filename: string;
  };
}

export interface CreateConferenceNewsPayload {
  title: string;
  description: string;
  imageUrl: string;
  priority?: number;
  expiryDate?: string;
  clickUrl?: string;
}

export interface CreateConferenceNewsResponse {
  success: boolean;
  message: string;
  data: ConferenceNews;
}

/* =====================================================
   ✅ Fetch Active Conference News
===================================================== */
const fetchActiveConferenceNews = async () => {
  const response = await request({
    url: conferenceNewsUrls.ACTIVE, // e.g. /conference-news/active
    method: "GET",
    withCredentials: true,
  });
  return response.data;
};

export const useActiveConferenceNewsQuery = () => {
  return useQuery({
    queryKey: ["activeConferenceNews"],
    queryFn: fetchActiveConferenceNews,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/* =====================================================
   ✅ Fetch All Conference News (Admin)
===================================================== */
const fetchAllConferenceNews = async (page = 1, limit = 10, isActive?: boolean) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (isActive !== undefined) {
    params.append("isActive", isActive.toString());
  }

  const response = await request({
    url: `${conferenceNewsUrls.ALL}?${params.toString()}`,
    method: "GET",
    withCredentials: true,
  });

  return response.data;
};

export const useAllConferenceNewsQuery = (
  page = 1,
  limit = 10,
  isActive?: boolean
) => {
  return useQuery<PaginatedConferenceNewsResponse>({
    queryKey: ["allConferenceNews", page, limit, isActive],
    queryFn: () => fetchAllConferenceNews(page, limit, isActive),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/* =====================================================
   ✅ Upload Conference News Image
===================================================== */
const uploadConferenceNewsImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await request({
    url: conferenceNewsUrls.UPLOAD_IMAGE, 
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  return response.data;
};

export const useUploadConferenceNewsImage = () => {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: uploadConferenceNewsImage,
  });
};

/* =====================================================
   ✅ Create Conference News
===================================================== */
const createConferenceNews = async (payload: CreateConferenceNewsPayload) => {
  const response = await request({
    url: conferenceNewsUrls.CREATE, // e.g. /conference-news/create
    method: "POST",
    data: payload,
    withCredentials: true,
  });
  return response.data;
};

export const useCreateConferenceNews = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateConferenceNewsResponse, Error, CreateConferenceNewsPayload>({
    mutationFn: createConferenceNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allConferenceNews"] });
      queryClient.invalidateQueries({ queryKey: ["activeConferenceNews"] });
    },
  });
};

/* =====================================================
   ✅ Close Conference News
===================================================== */
const closeConferenceNews = async (newsId: string) => {
  const response = await request({
    url: `${conferenceNewsUrls.CLOSE}/${newsId}`,
    method: "POST",
    withCredentials: true,
  });
  return response.data;
};

export const useCloseConferenceNews = () => {
  return useMutation({
    mutationFn: closeConferenceNews,
  });
};

/* =====================================================
   ✅ Delete Conference News
===================================================== */
const deleteConferenceNews = async (newsId: string) => {
  const response = await request({
    url: `${conferenceNewsUrls.DELETE}/${newsId}`,
    method: "DELETE",
    withCredentials: true,
  });
  return response.data;
};

export const useDeleteConferenceNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConferenceNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allConferenceNews"] });
      queryClient.invalidateQueries({ queryKey: ["activeConferenceNews"] });
    },
  });
};

/* =====================================================
   ✅ Toggle Conference News Status
===================================================== */
const toggleConferenceNewsStatus = async (newsId: string) => {
  const response = await request({
    url: `${conferenceNewsUrls.TOGGLE_STATUS}/${newsId}`,
    method: "PATCH",
    withCredentials: true,
  });
  return response.data;
};

export const useToggleConferenceNewsStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleConferenceNewsStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allConferenceNews"] });
      queryClient.invalidateQueries({ queryKey: ["activeConferenceNews"] });
    },
  });
};
