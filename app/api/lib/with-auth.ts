import { NextRequest, NextResponse } from "next/server";
import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { ALLOWED_ROLES } from "@/constants/constants";

interface ApiRouteHandler {
  (
    request: NextRequest,
    context: { params: any },
    userId?: string
  ): Promise<NextResponse>;
}

export const validateUserExists = async (id: string): Promise<boolean> => {
  if (!id) return false;
  const client = await pool.connect();
  try {
    const query = "SELECT id, role FROM users WHERE id = $1";
    const result = await client.query(query, [id]);
    return !isEmpty(result.rows) && ALLOWED_ROLES.includes(result.rows[0].role);
  } catch (error) {
    console.error("Database validation error:", error);
    return false;
  } finally {
    client.release();
  }
};

export function withAuth(handler: ApiRouteHandler) {
  return async function protectedHandler(
    request: NextRequest,
    context: { params: any }
  ): Promise<NextResponse> {
    try {
      const userId = request.headers.get("auth-user-id");

      if (!userId) {
        return NextResponse.json(
          {
            message: "Unauthorized: Missing or invalid token",
          },
          { status: 401 }
        );
      }

      const isValidUser = await validateUserExists(userId);

      if (!isValidUser) {
        return NextResponse.json(
          {
            message: "User not found",
          },
          { status: 403 }
        );
      }

      await pool.query(
        "UPDATE users SET last_active_at = NOW() WHERE id = $1",
        [userId]
      );

      // Pass the original context/params and userId separately
      return await handler(request, context, userId);
    } catch (error) {
      console.error("Authentication middleware error:", error);
      return NextResponse.json(
        {
          error: "Internal Server Error",
          message: "Authentication process failed",
          code: "AUTH_PROCESS_ERROR",
        },
        { status: 500 }
      );
    }
  };
}
