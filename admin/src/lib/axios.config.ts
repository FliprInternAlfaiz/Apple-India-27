import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ROUTES } from "../enum/routes";

const client = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BASE_URL,
  withCredentials: true,
});
interface IAxiosResponse {
  response?: {
    status?: number;
  };
}
export const request = async (options: AxiosRequestConfig<unknown>) => {
  const onSuccess = (response: AxiosResponse) => response.data;
  const onError = (error: unknown) => {
    if (
      (error as IAxiosResponse)?.response?.status === 401 &&
      location.pathname !== ROUTES.LOGIN
    ) {
      window.location.replace(ROUTES.LOGIN);
    }
    return { ...(error as IAxiosResponse).response };
  };

  try {
    const response = await client(options);
     console.log(response)
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};
