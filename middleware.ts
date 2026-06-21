import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/app/api/lib/verify-jwt";

export async function middleware(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required", message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader?.split(" ")[1];

    const decoded = verifyJWT(token);
    if (!decoded) {
      return new NextResponse(
        JSON.stringify({
          error: "Invalid token",
          message: "Token verification failed",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return NextResponse.next({
      headers: {
        "auth-user-id": decoded.id,
      },
    });
  } catch (err) {
    console.error("JWT Error:", err);
  }
}

// 🔐 Protect these routes
export const config = {
  matcher: [
    "/api/v1/users/:path*",
    "/api/v1/profile/:path*",
    "/api/v1/species/:path*",
    "/api/v1/tiers/:path*",
    "/api/v1/modules/:path*",
    "/api/v1/code/:path*",
    "/api/v1/region/:path*",
    "/api/v1/notifications/:path*",
    "/api/v1/reportings/:path*",
    "/api/v1/sightings/:path*",
    "/api/v1/home/:path*",
    "/api/v1/resources/:path*",
    "/api/v1/reports/:path*",
    "/api/v1/static-lookup/:path*",
  ], // Only protect /admin routes
};
