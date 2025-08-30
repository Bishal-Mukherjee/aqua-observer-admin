import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""; // Replace with your Supabase URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseKey);

export const useFileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (bucket: string, file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `uploads/${Date.now()}.${fileExt}`;

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

  return {
    uploadFile,
    isLoading,
    error,
  };
};
