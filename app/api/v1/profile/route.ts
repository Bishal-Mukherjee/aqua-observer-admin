import { NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const id = request.headers.get("auth-user-id");
    const query = await pool.query(
      "SELECT name, phone_number, gender, address, profile_pic_url, role, tier, status, created_at, last_active_at FROM users WHERE id = $1",
      [id]
    );
    return Response.json(
      { result: query.rows[0], total: query.rows.length },
      { status: 200 }
    );
  } catch (e) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
});
