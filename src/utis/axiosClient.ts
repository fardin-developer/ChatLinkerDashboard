import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const createApiClient = async (): Promise<AxiosInstance> => {
  const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  });

  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  return apiClient;
};

export default createApiClient;
