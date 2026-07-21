import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import baseAxios from "axios";
import axios from "@/services/api-instance";
import { useReportsFilters } from "@/store/useReportsFilters";

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
          from: dateRange?.from
            ? dayjs(dateRange.from).format("YYYY-MM-DD")
            : undefined,
          to: dateRange?.to
            ? dayjs(dateRange.to).format("YYYY-MM-DD")
            : undefined,
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

export const useFetchGeneratedReports = (fromDate?: Date, toDate?: Date) => {
  const { initializeStore, currentPage } = useReportsFilters();
  const nextPage = currentPage + 1;

  return useQuery({
    queryKey: ["generated-reports", fromDate, toDate, currentPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/reports?" +
          `page=${nextPage}` +
          (fromDate ? `&from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : ""),
      });
      const { pagination } = response.data;
      initializeStore(
        currentPage ?? 1,
        pagination.totalPages,
        pagination.total
      );
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
  const token = localStorage.getItem("auth-storage") || "";
  let accessToken = "";

  if (token) {
    accessToken = JSON.parse(token).state.accessToken;
  }

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await baseAxios({
        url: `${process.env.NEXT_PUBLIC_RUDRA_SERVICE_URL}/reports/generate`,
        method: "POST",
        data,
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    },
  });
};
