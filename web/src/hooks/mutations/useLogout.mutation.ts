import { useMutation } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { authUrls } from "../api-urls/api.url";

const logoutRequest = async () => {
  const response = await request({
    url: authUrls.LOGOUT, 
    method: "POST",
  });
  return response;
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: logoutRequest,
  });
};
