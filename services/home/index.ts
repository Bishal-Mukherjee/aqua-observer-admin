import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";

export const useGetHomeStats = () => {
  return useQuery({
    queryKey: ["home", "stats"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/home/stats",
      });
      return response.data;
    },
  });
};

export const useGetHomeDistribution = (type: string) => {
  return useQuery({
    queryKey: ["home", "distribution", type],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/home/distribution" + (type ? `?type=${type}` : ""),
      });
      return response.data;
    },
  });
};

export const useGetOverviewMonthly = (type: string, year: string) => {
  return useQuery({
    queryKey: ["home", "monthly", type, year],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/home/monthly?type=${type}&year=${year}`,
      });
      return response.data;
    },
  });
};

export const useGetOverviewLocations = (type: string, limit: number) => {
  return useQuery({
    queryKey: ["home", "locations", type, limit],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/home/locations?type=${type}&limit=${limit}`,
      });
      return response.data;
    },
  });
};

export const useGetRecentActivity = () => {
  return useQuery({
    queryKey: ["home", "recent-activity"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/home/recent-activity",
      });
      return response.data;
    },
  });
};
