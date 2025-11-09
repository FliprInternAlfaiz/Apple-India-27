
import { useMutation } from "@tanstack/react-query";
import { authUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

interface LoginPayload {
  email: string;
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

export const useLoginAdminMutation = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginRequest({ email, password }),
  });
};
