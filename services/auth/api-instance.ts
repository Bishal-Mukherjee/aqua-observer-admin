import axios from "axios";
import { toast } from "sonner";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

// only for handling auth related requests
export const authApiInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

authApiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error(
        error.response.data?.error ||
          "Unauthorized access. Please log in again."
      );
    }
    return Promise.reject(error);
  }
);
