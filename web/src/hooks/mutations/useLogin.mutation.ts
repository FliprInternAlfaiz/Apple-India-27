import { useMutation } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { authUrls } from "../api-urls/api.url";

interface LoginPayload {
  phone: string;
  password: string;
}

const loginRequest = async (payload: LoginPayload) => {
  const response = await request({
    url: authUrls.LOGIN,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
  });
};
