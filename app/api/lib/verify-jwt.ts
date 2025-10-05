import * as jose from "jose";

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jose.decodeJwt(token) as any;
    if (!decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true;
  }
};

export const verifyJWT = (token: string): { id: string } | null => {
  try {
    if (isTokenExpired(token)) return null;
    const decoded = jose.decodeJwt(token) as any;
    return { id: decoded.id };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
