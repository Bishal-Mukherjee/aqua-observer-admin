import { NextResponse } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async (request, { params }) => {
  const resolvedParams = await params;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;
    const tier = String(resolvedParams.tier).toUpperCase();

    const countSql = `SELECT COUNT(*) as total FROM modules WHERE tier = $1`;
    const countResult = await pool.query(countSql, [tier]);

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const sql = `
      SELECT json_agg(
        json_build_object(
          'id', m.id,
          'tier', m.tier,
          'title', json_build_object(
            'en', m.title_en,
            'bn', m.title_bn
          ),
          'description', json_build_object(
            'en', m.description_en,
            'bn', m.description_bn
          ),
          'url', m.url,
          'thumbnail', m.thumbnail,
          'type', m.type,
          'isActive', m.is_active,
          'createdAt', m.created_at,
          'lastUpdatedAt', m.last_updated_at
        )
      ) AS result
      FROM (
        SELECT * FROM modules 
        WHERE tier = $1
        ORDER BY id
        LIMIT $2 OFFSET $3
      ) m
    `;

    const { rows } = await pool.query(sql, [tier, limit, offset]);

    if (!rows || rows.length === 0 || !rows[0].result) {
      return NextResponse.json(
        {
          message: "No modules found for this tier",
          result: [],
          pagination: {
            total: 0,
            page,
            totalPages: 0,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        message: "Modules fetched successfully",
        result: rows[0].result,
        pagination: {
          total,
          page,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
