import { useQuery } from "@tanstack/react-query";
import axios from "@/services/api-instance";

export const fetchResourceUrl = async (pathOrUrl: string): Promise<string> => {
  const response = await axios({
    method: "GET",
    url: `/resources?path=${encodeURIComponent(pathOrUrl)}`,
  });

  return response.data.imageUrl;
};

export const getReportFileName = (pathOrUrl: string): string => {
  const fromReportsPath = pathOrUrl.split("/reports/")[1];
  if (fromReportsPath) {
    return fromReportsPath.split("?")[0]!;
  }

  return pathOrUrl.split("/").pop()?.split("?")[0] || "download";
};

export const downloadResource = async (
  pathOrUrl: string,
  fileName?: string
) => {
  const name = fileName || getReportFileName(pathOrUrl);
  const response = await axios({
    method: "GET",
    url: `/resources?path=${encodeURIComponent(pathOrUrl)}&download=true`,
    responseType: "blob",
  });
  const url = URL.createObjectURL(response.data);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();

  URL.revokeObjectURL(url);
};

export const useGetResources = (path: string) => {
  return useQuery({
    queryKey: ["resources", path],
    queryFn: async () => {
      const imageUrl = await fetchResourceUrl(path);
      return { imageUrl };
    },
    staleTime: 5 * 60 * 1000,
  });
};
