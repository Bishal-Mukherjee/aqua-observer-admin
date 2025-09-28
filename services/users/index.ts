import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useUsersPagination } from "@/store/pagination/useUsersPagination";

export const useGetUsers = () => {
  const { initializeStore, currentPage } = useUsersPagination();
  const nextPage = currentPage + 1;
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/users" + (currentPage ? `?page=${nextPage}` : ""),
      });
      const { pagination } = response.data;
      initializeStore(
        currentPage ?? 1,
        pagination.totalPages,
        pagination.totalRecords
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
