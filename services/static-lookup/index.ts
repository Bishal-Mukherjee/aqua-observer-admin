import axios from "@/services/api-instance";

export const getStaticLookupData = async (lookupKey: string) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${process.env.NEXT_PUBLIC_LOOKUP_BUCKET}/${lookupKey}.json`;
    const response = await axios({ url, method: "GET" });
    return response.data;
  } catch (error) {
    console.error(`Error fetching static lookup data for ${lookupKey}:`, error);
    throw error;
  }
};
