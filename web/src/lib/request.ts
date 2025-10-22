import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

export interface IServerResponse {
  statusCode: 200 | 201 | 204 | 400 | 401 | 429 | 500;
  status: "success" | "error";
  title: string;
  message: string;
  data?: object;
  extraData?: object | string;
  pageData?: {
    totalPages: number;
    totalDocuments: number;
    currentPage: number;
    total?: number;
  };
}

const client = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_BASE_URL ?? "http://192.168.0.223:8080",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const request = async (options: AxiosRequestConfig<object>) => {
  try {
    const response = await client(options);
    return response;
  } catch (error) {
    const err = (error as AxiosError).response?.data as IServerResponse;
    return { ...err };
  }
};
