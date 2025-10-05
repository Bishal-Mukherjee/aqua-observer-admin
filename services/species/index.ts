import { useParams, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import axios from "@/services/api-instance";
import { useSpeciesSubmissionPagination } from "@/store/pagination/useSpeciesSubmissionPagination";
import { useSpecies } from "@/store/useSpecies";

export const useGetSpecies = () => {
  const { setSpecies } = useSpecies();
  return useQuery({
    queryKey: ["species"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/species",
      });
      setSpecies(response.data?.result);
      return response.data;
    },
  });
};

export const useUpdateSpecies = () => {
  return useMutation({
    mutationKey: ["updateSpecies"],
    mutationFn: async (data: {
      id: string;
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

export const useGetSpeciesSubmissions = (fromDate?: Date, toDate?: Date) => {
  const { submissions } = useParams();
  const search = useSearchParams();

  const submissionType =
    submissions === "reportings" ? "reportings" : "sightings";

  const species = search.get("species") || "";
  const { initializeStore, currentPage, districts } =
    useSpeciesSubmissionPagination();
  const joinedDistricts = districts?.join(",");
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: [
      "speciesSubmissions",
      submissionType,
      joinedDistricts,
      species,
      fromDate,
      toDate,
      nextPage,
    ],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          `/species/submissions/${submissionType}?speciesValue=${species}` +
          (fromDate ? `&from=${dayjs(fromDate).format("YYYY-MM-DD")}` : "") +
          (toDate ? `&to=${dayjs(toDate).format("YYYY-MM-DD")}` : "") +
          (joinedDistricts ? `&districts=${joinedDistricts}` : "") +
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
