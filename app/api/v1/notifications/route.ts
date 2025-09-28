import { NextResponse } from "next/server";
import { withAuth } from "@/app/api/lib/with-auth";
import { pool } from "@/app/api/config/db";

export const GET = withAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const countQuery = await pool.query(
      `SELECT COUNT(*) as total
       FROM notifications 
       WHERE recipient_role = 'ADMIN'`
    );

    const total = parseInt(countQuery.rows[0].total);
    const totalPages = Math.ceil(total / perPage);

    const query = await pool.query(
      `SELECT
        id,
        submission_id AS "submissionId",
        submission_type AS "submissionType",
        title,
        content,
        created_at AS "createdAt"
      FROM notifications 
      WHERE recipient_role = 'ADMIN'
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );

    return NextResponse.json({
      message: "Notifications fetched successfully",
      result: query.rows,
      pagination: {
        page,
        total,
        totalPages,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
