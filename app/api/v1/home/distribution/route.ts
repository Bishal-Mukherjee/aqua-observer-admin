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

      const countQuery = `
		SELECT COUNT(*)::integer AS total_count
		FROM ${tableName}
		WHERE district IS NOT NULL
	  `;

      const result = await client.query(query);
      const countResult = await client.query(countQuery);
      client.release();

      const topFiveCount = result.rows.reduce((acc, row) => acc + row.count, 0);
      const totalCount = countResult.rows[0].total_count;
      const otherCount = totalCount - topFiveCount;

      const updatedRows = [...result.rows];

      if (otherCount > 0) {
        updatedRows.push({ region: "Others", count: otherCount });
      }

      return NextResponse.json(
        {
          message: "Top districts fetched successfully",
          result: updatedRows,
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
