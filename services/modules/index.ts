import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useModulesPagination } from "@/store/pagination/useModulesPagination";

export const useGetModules = (tier: string) => {
  const { currentPage, initializeStore } = useModulesPagination();
  return useQuery({
    queryKey: ["modules", tier, currentPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          tier !== "ALL"
            ? `/modules/${tier}?page=${currentPage}`
            : `/modules?page=${currentPage}`,
      });
      initializeStore(currentPage, response.data?.pagination.totalPages);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useCreateModules = () => {
  return useMutation({
    mutationFn: async (newModules: any) => {
      const response = await axios({
        method: "POST",
        url: "/modules",
        data: { modules: newModules },
      });
      return response.data;
    },
  });
};

export const useUpdateModule = () => {
  return useMutation({
    mutationFn: async (updatedModule: any) => {
      const response = await axios({
        method: "PUT",
        url: `/modules?id=${updatedModule.id}`,
        data: updatedModule,
      });
      return response.data;
    },
  });
};
