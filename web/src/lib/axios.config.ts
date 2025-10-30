import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ROUTES } from "../enum/routes";

const client = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BASE_URL,
  withCredentials: true, 
});

interface IAxiosResponse {
  response?: {
    status?: number;
    data?: any;
  };
}

export const request = async (options: AxiosRequestConfig<unknown>) => {
  const onSuccess = (response: AxiosResponse) => response.data;

  const onError = (error: unknown) => {
    const res = (error as IAxiosResponse).response;
 if (res?.status === 401 && location.pathname !== ROUTES.LOGIN) {
      console.warn("Unauthorized – handled by ProtectedRoute");
      // do NOT hard-redirect here; ProtectedRoute will handle navigation
    }
    return { ...(res ?? {}), status: res?.status || 500 };
  };

  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};
