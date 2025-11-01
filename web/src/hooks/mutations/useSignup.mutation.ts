import { useMutation } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { authUrls } from "../api-urls/api.url";

interface SignupPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

const signupRequest = async (payload: SignupPayload) => {
  const response = await request({
    url: authUrls.SIGNUP,
    withCredentials: true,
    method: "POST",
    data: payload,
  });
  return response;
};

export const useSignupMutation = () => {
  return useMutation({
     mutationFn:(payload: SignupPayload) => signupRequest(payload)});
};
