import { useQuery } from "@tanstack/react-query";
import { request } from "../../lib/axios.config";
import { ROUTES } from "../../enum/routes";
import { authUrls } from "../api-urls/api.url";

const unProtectedRoute: string[] = ["/", ROUTES.LOGIN];

const adminAuth = async () => {
  const response: TServerResponse = await request({
    url: authUrls.PROFILE,
    method: "POST",
    withCredentials: true,
  });

  const pathName = location.pathname;
  if (response?.status === "success" && unProtectedRoute.includes(pathName)) {
    location.replace(ROUTES.DASHBOARD);
  }

  return response;
};

export const useAdminAuthQuery = () => {
  return useQuery({
    queryKey: ["admin"],
    queryFn: adminAuth,
  });
};
