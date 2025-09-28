import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import axios from "@/services/api-instance";
import { useSpeciesSubmissionPagination } from "@/store/pagination/useSpeciesSubmissionPagination";

export const useGetSpecies = () => {
  return useQuery({
    queryKey: ["species"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/species",
      });

      return response.data;
    },
  });
};

export const useUpdateSpecies = () => {
  return useMutation({
    mutationKey: ["updateSpecies"],
    mutationFn: async (data: {
      id: number;
      scientificName: string;
      category: string;
      conservationStatus: string;
      habitat: string[];
      regionDistribution: string[];
      identificationFeatures: string[];
      image: string;
      ageGroup: string;
      isActive: boolean;
    }) => {
      const response = await axios({
        method: "PUT",
        url: `/species/${data.id}`,
        data,
      });

      return response.data;
    },
  });
};

export const useGetSpeciesSubmissions = (
  submissions: "reportings" | "sightings",
  species: string = "",
  fromDate?: Date,
  toDate?: Date
) => {
  const { initializeStore, currentPage } = useSpeciesSubmissionPagination();
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: [
      "speciesSubmissions",
      submissions,
      species,
      fromDate,
      toDate,
      nextPage,
    ],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          `/species/submissions/${submissions}?speciesValue=${species}` +
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
  });
};
