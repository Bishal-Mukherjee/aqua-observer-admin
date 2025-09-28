import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useModulesPagination } from "@/store/pagination/useModulesPagination";

export const useGetModules = (tier: string) => {
  const { initializeStore, currentPage } = useModulesPagination();
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: ["modules", tier, nextPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url:
          tier !== "ALL"
            ? `/modules/${tier}?page=${nextPage}`
            : `/modules?page=${nextPage}`,
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
