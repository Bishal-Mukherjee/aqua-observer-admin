import { NextResponse } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";
import { isEmpty } from "lodash";

export const GET = withAuth(async (request, { params }) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(*) as total FROM modules`;
    const countResult = await pool.query(countSql);

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
        ORDER BY tier
        LIMIT $1 OFFSET $2
      ) m
    `;

    const { rows } = await pool.query(sql, [limit, offset]);

    if (!rows || rows.length === 0 || !rows[0].result) {
      return NextResponse.json(
        {
          message: "No modules found",
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

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();

    if (isEmpty(body.modules)) {
      return NextResponse.json(
        { error: "Modules are required" },
        { status: 400 }
      );
    }

    for (const module of body.modules) {
      const sql = `
      INSERT INTO modules (tier, title_en, title_bn, description_en, description_bn, url, thumbnail, type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
      const values = [
        module.tier,
        module.title.en,
        module.title.bn,
        module.description.en,
        module.description.bn,
        module.url,
        module.thumbnail,
        module.type,
      ];

      await pool.query(sql, values);
    }

    return NextResponse.json(
      { message: "Modules created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (request, { params }) => {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();

    if (!searchParams.get("id")) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    const getModuleQuery = "SELECT * FROM modules WHERE id = $1";

    const { rows } = await pool.query(getModuleQuery, [searchParams.get("id")]);

    if (isEmpty(rows))
      return NextResponse.json({ error: "Module not found" }, { status: 404 });

    const updateModuleQuery = `
      UPDATE modules
      SET
        tier = $1,
        title_en = $2,
        title_bn = $3,
        description_en = $4,
        description_bn = $5,
        url = $6,
        thumbnail = $7,
        type = $8,
		is_active = $9,
		last_updated_at = NOW()
      WHERE id = $10
    `;

    const values = [
      body.tier,
      body.title.en,
      body.title.bn,
      body.description.en,
      body.description.bn,
      body.url,
      body.thumbnail,
      body.type,
      body.isActive,
      searchParams.get("id"),
    ];

    await pool.query(updateModuleQuery, values);

    return NextResponse.json(
      { message: "Modules updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
