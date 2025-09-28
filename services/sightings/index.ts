import dayjs from "dayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useSightingsPagination } from "@/store/pagination/useSightingsPagination";

export const useGetSightings = (
  submittedBy?: string,
  fromDate?: Date,
  toDate?: Date,
  enabled?: boolean
) => {
  const { initializeStore, currentPage } = useSightingsPagination();
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: ["sightings", submittedBy, fromDate, toDate, nextPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/sightings?" +
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

export const useGetSightingsInsights = (fromDate?: Date, toDate?: Date) => {
  return useQuery({
    queryKey: ["sightings", "insights", fromDate, toDate],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/sightings/insights?" +
          (fromDate ? `from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : ""),
      });
      return response.data;
    },
  });
};

export const useGetSightingById = (id: string | null) => {
  return useQuery({
    queryKey: ["sighting", id],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/sightings/${id}`,
      });
      return response.data;
    },
    enabled: !!id,
  });
};

export const useToogleSightingStatus = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axios({
        method: "PUT",
        url: `/sightings/${id}`,
      });
      return response.data;
    },
  });
};
