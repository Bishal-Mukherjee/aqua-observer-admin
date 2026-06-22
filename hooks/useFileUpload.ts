import { useState } from "react";
import axios from "@/services/api-instance";
import { REPORTS_PREFIX } from "@/constants/storage";

export const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (prefix: string, dirname: string, file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", prefix);
      formData.append("dirname", dirname);

      const response = await axios({
        method: "POST",
        url: "/resources",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err.message);
      console.error("File upload error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadReportFile = async (
    reportId: string,
    file: File,
    fileName: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", REPORTS_PREFIX);
      formData.append("reportId", reportId);
      formData.append("fileName", fileName);

      const response = await axios({
        method: "POST",
        url: "/resources",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (err: any) {
      setError(err.message);
      console.error("Report file upload error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFile, uploadReportFile, isLoading, error };
};
