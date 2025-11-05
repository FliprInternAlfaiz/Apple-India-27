import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { verificationUrls } from "../api-urls/api.url";

/* =====================================================
   🧩 Types
===================================================== */
interface VerificationStatusResponse {
  success: boolean;
  data: {
    aadhaarNumber: string | null;
    aadhaarPhoto: string | null;
    aadhaarVerificationStatus:
      | "not_submitted"
      | "pending"
      | "approved"
      | "rejected";
    aadhaarSubmittedAt: string | null;
    aadhaarVerifiedAt: string | null;
  };
}

interface UploadAadhaarPayload {
  aadhaarNumber: string;
  aadhaarPhotoUrl: string;
}

interface UploadAadhaarResponse {
  success: boolean;
  message: string;
  data: {
    aadhaarNumber: string;
    aadhaarPhoto: string;
    aadhaarVerificationStatus: string;
  };
}

interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    filename: string;
  };
}

/* =====================================================
   ✅ Fetch Aadhaar verification status
===================================================== */
const fetchVerificationStatus = async () => {
  const response = await request({
    url: verificationUrls.VERIFICATION_STATUS,
    method: "GET",
    withCredentials: true,
  });
  return response;
};

export const useVerificationStatusQuery = () => {
  return useQuery<VerificationStatusResponse>({
    queryKey: ["verification-status"],
    queryFn: fetchVerificationStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/* =====================================================
   ✅ Upload Aadhaar photo (file)
===================================================== */
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("aadhaarPhoto", file);

  const response = await request({
    url: verificationUrls.UPLOAD_FILE, // e.g. /verification/upload-photo
    method: "POST",
    data: formData,
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const useFileUploadMutation = () => {
  return useMutation<FileUploadResponse, Error, File>({
    mutationFn: uploadFile,
  });
};

/* =====================================================
   ✅ Submit Aadhaar verification details
===================================================== */
const uploadAadhaar = async (payload: UploadAadhaarPayload) => {
  const response = await request({
    url: verificationUrls.UPLOAD_AADHAAR, // e.g. /verification/upload-aadhaar
    method: "POST",
    data: payload,
    withCredentials: true,
  });
  return response.data;
};

export const useUploadAadhaarMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<UploadAadhaarResponse, Error, UploadAadhaarPayload>({
    mutationFn: uploadAadhaar,
    onSuccess: () => {
      // ✅ Refetch verification status after successful upload
      queryClient.invalidateQueries({ queryKey: ["verification-status"] });
    },
  });
};
