import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import axios from "@/services/api-instance";
import { useSightingsFilters } from "@/store/useSightingsFilters";

export const useGetSightings = (
  fromDate?: Date,
  toDate?: Date,
  enabled?: boolean
) => {
  const search = useSearchParams();
  const pathname = usePathname();

  const { initializeStore, currentPage, districts } = useSightingsFilters();
  const joinedDistricts = districts?.join(",");
  const nextPage = currentPage + 1;
  const submittedBy = search.get("id") || undefined;
  const isValidParam = pathname.includes("invalid") ? "false" : "true";

  return useQuery({
    queryKey: [
      "sightings",
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
          "/sightings?" +
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

export const useGetSightingsInBatch = () => {
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await axios({
        method: "POST",
        url: "/sightings/batch",
        data: { ids },
      });
      return response.data;
    },
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
