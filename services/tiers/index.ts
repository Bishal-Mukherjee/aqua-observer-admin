import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useTiersStore } from "@/store/useTiers";

export const useGetTiers = () => {
  const { setTiers } = useTiersStore();
  return useQuery({
    queryKey: ["tiers"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/tiers",
      });
      setTiers(response.data?.result || []);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTier = () => {
  return useMutation({
    mutationFn: async (newTier: any) => {
      const response = await axios({
        method: "POST",
        url: "/tiers",
        data: newTier,
      });
      return response.data;
    },
  });
};

export const useUpdateTier = () => {
  return useMutation({
    mutationFn: async (updatedTier: any) => {
      const response = await axios({
        method: "PUT",
        url: `/tiers/${updatedTier.tier.id}`,
        data: updatedTier,
      });
      return response.data;
    },
  });
};
