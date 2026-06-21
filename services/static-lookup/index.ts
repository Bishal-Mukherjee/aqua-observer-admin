import axios from "@/services/api-instance";

export const getStaticLookupData = async (lookupKey: string) => {
  try {
    const response = await axios({
      url: `/static-lookup/${lookupKey}`,
      method: "GET",
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching static lookup data for ${lookupKey}:`, error);
    throw error;
  }
};
