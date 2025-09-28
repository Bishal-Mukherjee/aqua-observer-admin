import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import axios from "@/services/api-instance";
import { useReportingsPagination } from "@/store/pagination/useReportingsPagination";

export const useGetReportings = (
  submittedBy?: string,
  fromDate?: Date,
  toDate?: Date,
  enabled?: boolean
) => {
  const { initializeStore, currentPage } = useReportingsPagination();
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: ["reportings", submittedBy, fromDate, toDate, currentPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/reportings?" +
          (submittedBy ? `submittedBy=${submittedBy}` : "") +
          (fromDate ? `&from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : "") +
          (currentPage ? `&page=${nextPage}` : ""),
      });
      const { pagination } = response.data;
      initializeStore(
        currentPage ?? 1,
        pagination.totalPages,
        pagination.total
      );
      return response.data;
    },
    enabled: enabled ?? true,
  });
};

export const useGetReportingsInsights = (fromDate?: Date, toDate?: Date) => {
  return useQuery({
    queryKey: ["reportings", "insights", fromDate, toDate],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/reportings/insights?" +
          (fromDate ? `from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : ""),
      });
      return response.data;
    },
  });
};

export const useGetReportingById = (id: string | null) => {
  return useQuery({
    queryKey: ["reporting", id],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/reportings/${id}`,
      });
      return response.data;
    },
    enabled: !!id,
  });
};

export const useToogleReportingStatus = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axios({
        method: "PUT",
        url: `/reportings/${id}`,
      });
      return response.data;
    },
  });
};
