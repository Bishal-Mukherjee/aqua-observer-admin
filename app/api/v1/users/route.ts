import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";
import { NextRequest } from "next/server";

const BASE_ROLE_CONDITION = "(u.role = 'SIGHTER' OR u.role = 'SUB_ADMIN')";

export const GET = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "";
    const role = searchParams.get("role") || "";
    const tier = searchParams.get("tier") || "";
    const gender = searchParams.get("gender") || "";

    const conditions: string[] = [BASE_ROLE_CONDITION];
    const queryParams: unknown[] = [];

    if (search) {
      conditions.push(
        `(u.name ILIKE $${queryParams.length + 1} OR u.phone_number ILIKE $${queryParams.length + 1})`
      );
      queryParams.push(`%${search}%`);
    }

    if (status) {
      conditions.push(`u.status = $${queryParams.length + 1}`);
      queryParams.push(status);
    }

    if (role) {
      conditions.push(`u.role = $${queryParams.length + 1}`);
      queryParams.push(role);
    }

    if (tier) {
      conditions.push(`u.tier = $${queryParams.length + 1}`);
      queryParams.push(tier);
    }

    if (gender) {
      conditions.push(`u.gender = $${queryParams.length + 1}`);
      queryParams.push(gender);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const baseFrom = `
      FROM users u
      LEFT JOIN (
        SELECT submitted_by, COUNT(*) as reportings_count
        FROM reportings
        GROUP BY submitted_by
      ) r ON u.id = r.submitted_by
      LEFT JOIN (
        SELECT submitted_by, COUNT(*) as sightings_count
        FROM sightings
        GROUP BY submitted_by
      ) s ON u.id = s.submitted_by
      ${whereClause}
    `;

    const countQuery = await pool.query(
      `SELECT COUNT(*) as total FROM users u ${whereClause}`,
      queryParams
    );

    const total = parseInt(countQuery.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const dataQuery = await pool.query(
      `SELECT
         u.id,
         u.name,
         u.phone_number AS "phoneNumber",
         u.gender,
         u.role,
         u.tier,
         u.status,
         u.age,
         u.email,
         u.occupation,
         u.created_at AS "createdAt",
         u.last_active_at AS "lastActiveAt",
         COALESCE(r.reportings_count, 0) AS "reportingsCount",
         COALESCE(s.sightings_count, 0) AS "sightingsCount"
       ${baseFrom}
       ORDER BY u.created_at DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    );

    if (isEmpty(dataQuery.rows)) {
      return Response.json(
        {
          message: "No users found",
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

    return Response.json(
      {
        message: "Users fetched successfully",
        result: dataQuery.rows,
        pagination: {
          total,
          page,
          totalPages,
        },
      },
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

export const POST = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const body = await request.json();

    const {
      name,
      phoneNumber,
      gender,
      role,
      district,
      age,
      email,
      occupation,
    } = body;

    const query = await pool.query(
      `INSERT INTO users (name, phone_number, gender, role, district, age, email, occupation)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, phoneNumber, gender, role, district, age, email, occupation]
    );

    return Response.json(
      {
        message: "Profile created successfully",
        result: query.rows[0],
      },
      { status: 201 }
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
