import { NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const id = request.headers.get("auth-user-id");
    const query = await pool.query(
      `SELECT 
        id, 
        name, 
        phone_number AS "phoneNumber", 
        gender, 
        role, 
        status,
		last_active_at AS "lastActiveAt"
      FROM users WHERE id = $1`,
      [id]
    );
    return Response.json(
      { message: "Profile retrieved successfully", result: query.rows[0] },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
