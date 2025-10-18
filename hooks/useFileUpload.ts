import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (bucket: string, dirname: string, file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${dirname}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { ...data, publicURL: publicUrlData.publicUrl }; // Returns file metadata and public URL on success
    } catch (err: any) {
      setError(err.message);
      console.error("File upload error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFile, isLoading, error };
};
