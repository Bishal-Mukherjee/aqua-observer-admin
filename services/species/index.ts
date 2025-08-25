import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";

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
