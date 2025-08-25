import { useMutation } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useAuth } from "@/store/useAuth";

export const useSignIn = () => {
  const mutation = useMutation({
    mutationFn: async (data: { phoneNumber: string }) => {
      const response = await axios({
        method: "POST",
        url: "/auth/signin",
        // TODO: remove this condition
        data: {
          phoneNumber: data.phoneNumber,
          isTest: true,
        },
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
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      const response = await axios({
        method: "POST",
        url: "/auth/verify",
        data,
      });

      if (response.status !== 200) {
        throw new Error("Failed to verify code");
      }

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
