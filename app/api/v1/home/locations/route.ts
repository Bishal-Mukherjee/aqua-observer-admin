import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";
import {
  getTimelineStartDate,
  isValidTimeline,
  type TimelineValue,
} from "@/lib/date";

const MAX_LOCATIONS = 5000;

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") || "reportings"; // 'reportings' or 'sightings'
      const timeline = (searchParams.get("timeline") || "6months").toLowerCase();

      // Validate type parameter
      if (!["reportings", "sightings"].includes(type)) {
        return NextResponse.json(
          {
            message: 'Invalid type. Must be either "reportings" or "sightings"',
          },
          { status: 400 }
        );
      }

      if (!isValidTimeline(timeline)) {
        return NextResponse.json(
          {
            message:
              'Invalid timeline. Must be one of "1month", "3months", "6months", "1year", or "all"',
          },
          { status: 400 }
        );
      }

      const tableName = type === "reportings" ? "reportings" : "sightings";
      const timelineStartDate = getTimelineStartDate(timeline as TimelineValue);

      const client = await pool.connect();

      const timelineCondition = timelineStartDate
        ? "WHERE t.submitted_at >= $1::date"
        : "";
      const queryParams: Array<number | string> = [];
      if (timelineStartDate) {
        queryParams.push(timelineStartDate.toISOString().slice(0, 10));
      }

      const limitParamIndex = queryParams.length + 1;
      queryParams.push(MAX_LOCATIONS + 1);

      const query = `
        SELECT 
          t.id AS "id",
          t.latitude AS "latitude",
          t.longitude AS "longitude",
          t.village_or_ghat AS "villageOrGhat",
          t.block,
          t.district,
          t.submitted_at AS "submittedAt",
		  JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
		  FROM ${tableName} t
		  LEFT JOIN users u ON t.submitted_by = u.id
        ${timelineCondition}
        ORDER BY t.submitted_at DESC
        LIMIT $${limitParamIndex}
      `;

      const result = await client.query(query, queryParams);
      client.release();

      const truncated = result.rows.length > MAX_LOCATIONS;
      const data = truncated ? result.rows.slice(0, MAX_LOCATIONS) : result.rows;

      return NextResponse.json(
        {
          message: `${type} map data fetched successfully`,
          result: {
            data,
            metadata: {
              total: data.length,
              type,
              timeline,
              truncated,
              maxLocations: MAX_LOCATIONS,
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
