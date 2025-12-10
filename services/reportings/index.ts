import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import axios from "@/services/api-instance";
import { useReportingsFilters } from "@/store/useReportingsFilters";

export const useGetReportings = (
  fromDate?: Date,
  toDate?: Date,
  enabled?: boolean
) => {
  const search = useSearchParams();
  const pathname = usePathname();

  const { initializeStore, currentPage, districts } = useReportingsFilters();
  const joinedDistricts = districts?.join(",");
  const nextPage = currentPage + 1;
  const submittedBy = search.get("id") || undefined;
  const isValidParam = pathname.includes("invalid") ? "false" : "true";

  return useQuery({
    queryKey: [
      "reportings",
      submittedBy,
      joinedDistricts,
      fromDate,
      toDate,
      currentPage,
    ],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          "/reportings?" +
          (submittedBy ? `submittedBy=${submittedBy}` : "") +
          (fromDate ? `&from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : "") +
          (joinedDistricts ? `&districts=${joinedDistricts}` : "") +
          (currentPage ? `&page=${nextPage}` : "") +
          (isValidParam ? `&isValid=${isValidParam}` : ""),
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

export const useGetReportingsInBatch = () => {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await axios({
        method: "POST",
        url: "/reportings/batch",
        data: { ids },
      });
      return response.data;
    },
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
