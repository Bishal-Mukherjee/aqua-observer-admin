import axios from "axios";
import { toast } from "sonner";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const apiInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor (e.g., add auth token)
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-storage") || "";
    if (token) {
      const accessToken = JSON.parse(token).state.accessToken;
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor (e.g., handle errors globally)
apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only retry for /api/v1/ routes and 401 errors
    if (
      error.response &&
      error.response.status === 401 &&
      originalRequest.url &&
      !originalRequest.url.includes("auth") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const tokenData = localStorage.getItem("auth-storage") || "";
      let refreshToken = "";
      if (tokenData) {
        refreshToken = JSON.parse(tokenData).state.refreshToken;
      }

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const response = await axios({
            url: `${baseURL}/api/auth/refresh`,
            method: "POST",
            data: { refreshToken },
          });

          const newAccessToken = response.data.accessToken;

          // Update localStorage
          const authStorage = JSON.parse(tokenData);
          authStorage.state.accessToken = newAccessToken;
          localStorage.setItem("auth-storage", JSON.stringify(authStorage));

          apiInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiInstance(originalRequest);
        } catch (err) {
          processQueue(err, null);
          // when refesh token fails, logout the user
          localStorage.removeItem("auth-storage");
          window.location.href = "/login";
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      // Queue the request until token refresh is done
      return new Promise(function (resolve, reject) {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiInstance(originalRequest));
          },
          reject: (err: any) => {
            reject(err);
          },
        });
      });
    }

    toast.error(error?.response?.data?.error || "Something went wrong!");
    return Promise.reject(error);
  }
);

export default apiInstance;
