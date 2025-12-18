import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { luckyDrawUrls } from "../api-urls/api.url";

/* =====================================================
   🧩 Types
===================================================== */
export interface Prize {
  name: string;
  description: string;
  value?: string;
}

export interface LuckyDraw {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  offerDetails: string;
  termsConditions?: string[];
  priority?: number;
  expiryDate?: string;
  winnerSelectionDate?: string;
  maxParticipants?: number;
  prizes?: Prize[];
  isActive: boolean;
  status: 'ongoing' | 'completed' | 'cancelled';
  participantCount: number;
  winners?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedLuckyDrawResponse {
  success: boolean;
  data: {
    luckyDraws: LuckyDraw[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ActiveLuckyDrawsResponse {
  success: boolean;
  data: LuckyDraw[];
}

export interface UploadImageResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

export interface CreateLuckyDrawPayload {
  title: string;
  description: string;
  imageUrl: string;
  offerDetails: string;
  termsConditions?: string[];
  priority?: number;
  expiryDate?: string;
  winnerSelectionDate?: string;
  maxParticipants?: number;
  prizes?: Prize[];
}

export interface CreateLuckyDrawResponse {
  success: boolean;
  message: string;
  data: LuckyDraw;
}

export interface ParticipateResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface SelectWinnersPayload {
  numberOfWinners: number;
}

export interface SelectWinnersResponse {
  success: boolean;
  message: string;
  data: {
    winners: any[];
    totalParticipants: number;
  };
}

/* =====================================================
   ✅ Fetch Active Lucky Draws (Users)
===================================================== */
const fetchActiveLuckyDraws = async () => {
  const response = await request({
    url: luckyDrawUrls.ACTIVE,
    method: "GET",
    withCredentials: true,
  });
  return response;
};

export const useActiveLuckyDrawsQuery = () => {
  return useQuery<ActiveLuckyDrawsResponse>({
    queryKey: ["activeLuckyDraws"],
    queryFn: fetchActiveLuckyDraws,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/* =====================================================
   ✅ Fetch All Lucky Draws (Admin)
===================================================== */
const fetchAllLuckyDraws = async (
  page = 1,
  limit = 10,
  isActive?: boolean,
  status?: string
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (isActive !== undefined) {
    params.append("isActive", isActive.toString());
  }
  if (status) {
    params.append("status", status);
  }

  const response = await request({
    url: `${luckyDrawUrls.ALL}?${params.toString()}`,
    method: "GET",
    withCredentials: true,
  });

  return response.data;
};

export const useAllLuckyDrawsQuery = (
  page = 1,
  limit = 10,
  isActive?: boolean,
  status?: string
) => {
  return useQuery<PaginatedLuckyDrawResponse>({
    queryKey: ["allLuckyDraws", page, limit, isActive, status],
    queryFn: () => fetchAllLuckyDraws(page, limit, isActive, status),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

/* =====================================================
   ✅ Upload Lucky Draw Image
===================================================== */
const uploadLuckyDrawImage = async (file: File) => {
  const formData = new FormData();
  formData.append("luckyDrawImage", file);

  const response = await request({
    url: luckyDrawUrls.UPLOAD_IMAGE,
    method: "POST",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  });

  return response.data;
};

export const useUploadLuckyDrawImage = () => {
  return useMutation<UploadImageResponse, Error, File>({
    mutationFn: uploadLuckyDrawImage,
  });
};

/* =====================================================
   ✅ Create Lucky Draw
===================================================== */
const createLuckyDraw = async (payload: CreateLuckyDrawPayload) => {
  const response = await request({
    url: luckyDrawUrls.CREATE,
    method: "POST",
    data: payload,
    withCredentials: true,
  });
  return response.data;
};

export const useCreateLuckyDraw = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateLuckyDrawResponse, Error, CreateLuckyDrawPayload>({
    mutationFn: createLuckyDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLuckyDraws"] });
      queryClient.invalidateQueries({ queryKey: ["activeLuckyDraws"] });
    },
  });
};

/* =====================================================
   ✅ Participate in Lucky Draw
===================================================== */
const participateInLuckyDraw = async (drawId: string) => {
  const response = await request({
    url: `${luckyDrawUrls.PARTICIPATE}/${drawId}`,
    method: "POST",
    withCredentials: true,
  });
  return response.data;
};

export const useParticipateInLuckyDraw = () => {
  const queryClient = useQueryClient();

  return useMutation<ParticipateResponse, Error, string>({
    mutationFn: participateInLuckyDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeLuckyDraws"] });
      queryClient.invalidateQueries({ queryKey: ["allLuckyDraws"] });
    },
  });
};

/* =====================================================
   ✅ Select Winners (Admin)
===================================================== */
const selectWinners = async ({ drawId, numberOfWinners }: { drawId: string; numberOfWinners: number }) => {
  const response = await request({
    url: `${luckyDrawUrls.SELECT_WINNERS}/${drawId}`,
    method: "POST",
    data: { numberOfWinners },
    withCredentials: true,
  });
  return response.data;
};

export const useSelectWinners = () => {
  const queryClient = useQueryClient();

  return useMutation<SelectWinnersResponse, Error, { drawId: string; numberOfWinners: number }>({
    mutationFn: selectWinners,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLuckyDraws"] });
      queryClient.invalidateQueries({ queryKey: ["activeLuckyDraws"] });
    },
  });
};

/* =====================================================
   ✅ Delete Lucky Draw
===================================================== */
const deleteLuckyDraw = async (drawId: string) => {
  const response = await request({
    url: `${luckyDrawUrls.DELETE}/${drawId}`,
    method: "DELETE",
    withCredentials: true,
  });
  return response.data;
};

export const useDeleteLuckyDraw = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLuckyDraw,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLuckyDraws"] });
      queryClient.invalidateQueries({ queryKey: ["activeLuckyDraws"] });
    },
  });
};

/* =====================================================
   ✅ Toggle Lucky Draw Status
===================================================== */
const toggleLuckyDrawStatus = async (drawId: string) => {
  const response = await request({
    url: `${luckyDrawUrls.TOGGLE_STATUS}/${drawId}`,
    method: "PATCH",
    withCredentials: true,
  });
  return response.data;
};

export const useToggleLuckyDrawStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleLuckyDrawStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allLuckyDraws"] });
      queryClient.invalidateQueries({ queryKey: ["activeLuckyDraws"] });
    },
  });
};

/* =====================================================
   ✅ Get Lucky Draw Details
===================================================== */
const fetchLuckyDrawDetails = async (drawId: string) => {
  const response = await request({
    url: `${luckyDrawUrls.DETAILS}/${drawId}`,
    method: "GET",
    withCredentials: true,
  });
  return response.data;
};

export const useLuckyDrawDetailsQuery = (drawId: string) => {
  return useQuery({
    queryKey: ["luckyDrawDetails", drawId],
    queryFn: () => fetchLuckyDrawDetails(drawId),
    enabled: !!drawId,
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};