import { NextRequest, NextResponse } from "next/server";
import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";

interface ApiRouteHandler {
  (request: NextRequest): Promise<NextResponse>;
}

export const validateUserExists = async (id: string): Promise<boolean> => {
  if (!id) return false;
  const client = await pool.connect();
  try {
    const query = "SELECT id FROM users WHERE id = $1";
    const result = await client.query(query, [id]);
    return !isEmpty(result.rows);
  } catch (error) {
    console.error("Database validation error:", error);
    return false;
  } finally {
    client.release();
  }
};

export function withAuth(handler: ApiRouteHandler) {
  return async function protectedHandler(
    request: NextRequest
  ): Promise<NextResponse> {
    try {
      const id = request.headers.get("auth-user-id");

      if (!id) {
        return NextResponse.json(
          {
            message: "Unauthorized: Missing or invalid token",
          },
          { status: 401 }
        );
      }

      const isValidUser = await validateUserExists(id);

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
        [id]
      );

      return await handler(request);
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
