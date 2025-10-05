import axios from "@/services/api-instance";
import { DateRange } from "react-day-picker";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async ({
      dateRange,
      districts,
      species,
      submissionType,
      description,
    }: {
      dateRange?: DateRange;
      districts?: string[];
      species?: string[];
      submissionType?: string;
      description?: string;
    }) => {
      const response = await axios({
        method: "POST",
        url: `${submissionType}/report`,
        data: {
          from: dateRange?.from,
          to: dateRange?.to,
          districts,
          species,
          description,
        },
      });
      return response.data;
    },
  });
};
