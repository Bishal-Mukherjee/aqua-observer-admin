import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useNotificationPagination } from "@/store/pagination/useNotificationPagination";

export const useGetNotifications = () => {
  const { currentPage, initializeStore } = useNotificationPagination();
  const query = useQuery({
    queryKey: ["notifications", currentPage],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: `/notifications?page=${currentPage}`,
      });
      initializeStore(currentPage, response.data?.pagination.totalPages);
      return response.data;
    },
  });
  return query;
};
