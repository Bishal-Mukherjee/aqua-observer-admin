import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";
import { useDistrictStore } from "@/store/useDistricts";

export const useGetDistricts = () => {
  const { setDistricts } = useDistrictStore();
  return useQuery({
    queryKey: ["districts"],
    queryFn: async () => {
      const response = await axios({
        method: "GET",
        url: "/region/districts",
      });
      const districts = response.data?.result
        .map(
          (district: { label: { en: string; bn: string }; value: string }) => ({
            label: district.label.en,
            value: district.value,
          })
        )
        ?.sort((a: { label: string }, b: { label: string }) =>
          a.label.localeCompare(b.label)
        );
      setDistricts(districts);
      return districts;
    },
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  });
};
