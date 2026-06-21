import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useUsersPagination } from "@/store/pagination/useUsersPagination";

export type UsersFilters = {
  search?: string;
  status?: string;
  role?: string;
  tier?: string;
  gender?: string;
};

export const useGetUsers = (filters: UsersFilters = {}) => {
  const { initializeStore, currentPage } = useUsersPagination();
  const nextPage = currentPage + 1;

  return useQuery({
    queryKey: ["users", currentPage, filters],
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));

      if (filters.search?.trim()) {
        params.set("search", filters.search.trim());
      }
      if (filters.status && filters.status !== "all") {
        params.set("status", filters.status);
      }
      if (filters.role && filters.role !== "all") {
        params.set("role", filters.role);
      }
      if (filters.tier && filters.tier !== "all") {
        params.set("tier", filters.tier);
      }
      if (filters.gender && filters.gender !== "all") {
        params.set("gender", filters.gender);
      }

      const response = await axios({
        method: "GET",
        url: `/users?${params.toString()}`,
      });
      const { pagination } = response.data;
      initializeStore(
        currentPage ?? 1,
        pagination.totalPages,
        pagination.total,
      );
      return response.data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async (updatedUser: any) => {
      const response = await axios({
        method: "PUT",
        url: `/users/${updatedUser.id}`,
        data: updatedUser,
      });
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (user: any) => {
      const response = await axios({
        method: "POST",
        url: "/users",
        data: user,
      });
      return response.data;
    },
  });
};
