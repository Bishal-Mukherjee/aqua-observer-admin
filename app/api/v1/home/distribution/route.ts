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
      const submissionType = searchParams.get("type");

      const tableName =
        submissionType === "reportings" ? "reportings" : "sightings";

      const client = await pool.connect();

      const query = `
        SELECT 
          district AS region,
          COUNT(*)::integer AS count
        FROM ${tableName}
        WHERE district IS NOT NULL
        GROUP BY district 
        ORDER BY count DESC 
        LIMIT 5
      `;

      const result = await client.query(query);
      client.release();

      return NextResponse.json(
        {
          message: "Top districts fetched successfully",
          result: result.rows,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching overview data:", error);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
