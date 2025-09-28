import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") || "reportings"; // 'reportings' or 'sightings'
      const limit = searchParams.get("limit") || "50"; // Default to 50 recent entries

      // Validate type parameter
      if (!["reportings", "sightings"].includes(type)) {
        return NextResponse.json(
          {
            message: 'Invalid type. Must be either "reportings" or "sightings"',
          },
          { status: 400 }
        );
      }

      const tableName = type === "reportings" ? "reportings" : "sightings";

      const client = await pool.connect();

      const query = `
        SELECT 
          t.id AS "id",
          t.latitude AS "latitude",
          t.longitude AS "longitude",
          t.village_or_ghat AS "villageOrGhat",
          t.block,
          t.district,
          u.name AS "submittedBy",
          t.submitted_at AS "submittedAt",
		  JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
		  FROM ${tableName} t
		  LEFT JOIN users u ON t.submitted_by = u.id
        ORDER BY t.submitted_at DESC
        LIMIT $1
      `;

      const result = await client.query(query, [parseInt(limit)]);
      client.release();

      return NextResponse.json(
        {
          message: `Recent ${type} map data fetched successfully`,
          result: {
            data: result.rows,
            metadata: {
              total: result.rows.length,
              type,
              limit: parseInt(limit),
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching map data:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
