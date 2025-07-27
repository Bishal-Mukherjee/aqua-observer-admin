import * as jose from "jose";

export const verifyJWT = (token: string): { id: string } | null => {
  try {
    const decoded = jose.decodeJwt(token) as any;
    return { id: decoded.id };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
