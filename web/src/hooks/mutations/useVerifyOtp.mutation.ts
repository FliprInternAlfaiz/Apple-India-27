import { useMutation } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { authUrls } from "../api-urls/api.url";

interface VerifyOtpPayload {
  name: string;
  phone: string;
  password: string;
  otp: string;
}

const verifyOtpRequest = async (payload: VerifyOtpPayload) => {
  const response = await request({
    url: authUrls.VERIFYSIGNUPOTP,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useVerifyOtpMutation = () => {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpRequest(payload),
  });
};
