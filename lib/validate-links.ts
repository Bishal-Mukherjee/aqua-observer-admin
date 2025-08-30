import validator from "validator";
import axios from "axios";

export default async function validateUrl(url: string) {
  // Format validation
  if (!validator.isURL(url)) {
    return { valid: false, error: "Invalid URL format" };
  }

  // Existence check
  try {
    const response = await axios.head(url, { timeout: 6000 });
    return { valid: true, status: response.status };
  } catch (error: any) {
    return {
      valid: false,
      error: error.response?.status || error.message,
    };
  }
}
