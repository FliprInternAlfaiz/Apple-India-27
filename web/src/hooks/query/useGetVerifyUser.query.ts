import { useQuery } from "@tanstack/react-query";
import { authUrls } from "../api-urls/api.url";
import { request } from "../../lib/axios.config";

export const verifyUser = async () => {
   const response: TServerResponse = await request({
    url: authUrls.VERIFYUSER,
    method: "GET",
  });
    return response;

};

export const useVerifyUserQuery = () => {
  return useQuery({
    queryKey: ["verifyUser"],
    queryFn: () => verifyUser(),
    retry: false, 
  });
};