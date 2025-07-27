import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";
import { NextRequest } from "next/server";

export const GET = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const { searchParams } = request.nextUrl;

    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;

    const query = await pool.query(
      ` SELECT name, phone_number, gender, address, profile_pic_url, role, tier, status, created_at, last_active_at
        FROM users
        WHERE (role = 'SIGHTER' OR role = 'SUB_ADMIN') LIMIT $1 OFFSET (($2 - 1) * $1)
      `,
      [limit, page]
    );

    const countQuery = await pool.query(
      `SELECT COUNT(*) FROM users WHERE (role = 'SIGHTER' OR role = 'SUB_ADMIN')`
    );

    if (isEmpty(query.rows)) {
      return Response.json(
        { message: "No users found", total: 0, result: [] },
        { status: 200 }
      );
    }

    return Response.json(
      { total: Number(countQuery.rows[0].count), result: query.rows },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
});
