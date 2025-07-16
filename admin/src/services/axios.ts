import axios from "axios";
import type { AxiosError } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          {
            token: localStorage.getItem("refreshToken"),
          },
          {
            withCredentials: true,
          },
        );
        localStorage.setItem("token", response.data.accessToken);
        const config = error.config!;
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return axiosInstance(config);
      } catch (err) {
        localStorage.removeItem("token");
        window.location.href = "/sign-in";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
