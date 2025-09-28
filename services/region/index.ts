import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";

export const useGetDistricts = () => {
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/region/districts",
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
