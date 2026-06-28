import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import dayjs from "dayjs";
import { getMonthIndex, type TimelineValue } from "@/lib/date";

export type MonthlyDistrictSubmissionsParams = {
  type: "sightings" | "reportings";
  year: string;
  month: string;
  district: string;
};

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

export type TopSpeciesEntry = {
  species: string;
  label: { en: string; bn: string };
  image: string;
  category: string;
  conservationStatus: string;
  individualCount: number;
  submissionCount: number;
  sharePercent: number;
};

export const useGetTopSpecies = () => {
  return useQuery({
    queryKey: ["home", "top-species"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/home/top-species",
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

export const useGetOverviewLocations = (
  type: string,
  timeline: TimelineValue = "6months"
) => {
  return useQuery({
    queryKey: ["home", "locations", type, timeline],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/home/locations?type=${type}&timeline=${timeline}`,
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

export const useGetMonthlyDistrictSubmissions = () => {
  return useMutation({
    mutationFn: async ({
      type,
      year,
      month,
      district,
    }: MonthlyDistrictSubmissionsParams) => {
      const monthNumber = getMonthIndex(month);
      if (!monthNumber) {
        throw new Error(`Invalid month label: ${month}`);
      }

      const yearNum = Number(year);
      const monthStart = dayjs(
        `${yearNum}-${String(monthNumber).padStart(2, "0")}-01`
      );
      const from = monthStart.format("YYYY-MM-DD");
      const to = monthStart.endOf("month").format("YYYY-MM-DD");

      const response = await axios({
        method: "GET",
        url: `/${type}?from=${from}&to=${to}&districts=${encodeURIComponent(
          district
        )}&all=true`,
      });
      return response.data;
    },
  });
};
