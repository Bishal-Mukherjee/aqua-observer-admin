import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import defaultAxios from "axios";
import axios from "@/services/api-instance";

export const useFetchFilteredDocs = () => {
  return useMutation({
    mutationFn: async ({
      dateRange,
      districts,
      species,
      submissionType,
      description,
      waterBody,
      waterBodyConditions,
      weatherConditions,
      threats,
      fishingGears,
    }: {
      dateRange?: DateRange;
      districts?: string[];
      species?: string[];
      submissionType: string;
      description?: string;
      waterBody?: string[];
      waterBodyConditions?: string[];
      weatherConditions?: string[];
      threats?: string[];
      fishingGears?: string[];
    }) => {
      const response = await axios({
        method: "POST",
        url: `/reports/${submissionType}`,
        data: {
          from: dayjs(dateRange?.from).format("YYYY-MM-DD"),
          to: dayjs(dateRange?.to).format("YYYY-MM-DD"),
          districts,
          species,
          description,
          waterBody,
          waterBodyConditions,
          weatherConditions,
          threats,
          fishingGears,
        },
      });
      return response.data;
    },
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (data: {
      submissionType: string;
      description?: string;
      parameters: any;
    }) => {
      const response = await axios({
        method: "POST",
        url: "/reports",
        data,
      });
      return response.data;
    },
  });
};

export const useUpdateReport = () => {
  return useMutation({
    mutationFn: async (data: {
      reportId: string;
      reportUrl?: string;
      csvDataUrl?: string;
    }) => {
      const response = await axios({
        method: "PUT",
        url: "/reports",
        data,
      });
      return response.data;
    },
  });
};

export const useFetchGeneratedReports = () => {
  return useQuery({
    queryKey: ["generated-reports"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/reports",
      });
      return response.data;
    },
  });
};

export const useFetchReportById = (reportId: string) => {
  return useQuery({
    queryKey: ["report-by-id", reportId],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/reports/${reportId}`,
      });
      return response.data;
    },
  });
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await defaultAxios({
        url: `${process.env.NEXT_PUBLIC_SUBMISSION_URL}/generate-reports/${data.type}`,
        method: "POST",
        data,
        responseType: "blob",
      });
      return response.data;
    },
  });
};
