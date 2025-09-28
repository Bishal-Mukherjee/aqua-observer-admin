import { useMutation } from "@tanstack/react-query";
import axios from "@/services/api-instance";

export const useSendCode = () => {
  const mutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; isTest?: boolean }) => {
      const response = await axios({
        method: "POST",
        url: "/code/send",
        data: {
          phoneNumber: data.phoneNumber,
          // TODO: remove this condition
          isTest: true,
        },
      });
      return response.data;
    },
  });
  return mutation;
};

export const useVerifyCode = () => {
  const mutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; code: string }) => {
      const response = await axios({
        method: "POST",
        url: "/code/verify",
        data,
      });
      return response.data;
    },
  });
  return mutation;
};
