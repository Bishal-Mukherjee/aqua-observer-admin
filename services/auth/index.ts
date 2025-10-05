import { useMutation } from "@tanstack/react-query";
import { authApiInstance } from "@/services/auth/api-instance";
import { useAuth } from "@/store/useAuth";

export const useSignIn = () => {
  const mutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await authApiInstance.post("/api/auth/signin", {
        phoneNumber: `+91${data.phoneNumber}`,
      });
      if (response.status !== 200) {
        throw new Error("Failed to sign in");
      }
      return response.data;
    },
  });
  return mutation;
};

export const useVerifyCode = () => {
  const { setAuth } = useAuth();

  const mutation = useMutation({
    mutationFn: async (data: {
      phoneNumber: string;
      code: string;
      rememberMe: boolean;
    }) => {
      const response = await authApiInstance.post("/api/auth/verify", {
        phoneNumber: `+91${data.phoneNumber}`,
        code: data.code,
        rememberMe: data.rememberMe,
      });
      if (response.status !== 200) {
        throw new Error("Failed to verify code");
      }
      console.log("Response Data:", response.data);
      setAuth(
        response.data.result.accessToken,
        response.data.result.refreshToken,
        response.data.result.user
      );
      return response.data;
    },
  });
  return mutation;
};
