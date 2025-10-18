import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";

export const useGetResources = (path: string) => {
  return useQuery({
    queryKey: ["resources", path],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/resources?path=${path}`,
      });

      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
