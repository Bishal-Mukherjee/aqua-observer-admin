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
  ], // Only protect /admin routes
};
