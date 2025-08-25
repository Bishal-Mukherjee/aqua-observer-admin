import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiInstance = axios.create({
  baseURL: baseURL || "http://localhost:3000/api/v1",
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

// Response interceptor (e.g., handle errors globally)
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optionally handle specific error codes
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiInstance;
