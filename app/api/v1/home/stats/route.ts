import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const client = await pool.connect();

    // Calculate dates once
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const twoMonthsAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 2,
      now.getDate()
    );
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    try {
      // Single optimized query using CTEs (Common Table Expressions)
      const statsQuery = `
        WITH sightings_stats AS (
          SELECT 
            COUNT(*)::integer as total,
            COUNT(CASE WHEN submitted_at >= $1 THEN 1 END)::integer as current_month,
            COUNT(CASE WHEN submitted_at >= $2 AND submitted_at < $1 THEN 1 END)::integer as previous_month
          FROM sightings
          WHERE submitted_at >= $2
        ),
        reportings_stats AS (
          SELECT 
            COUNT(*)::integer as total,
            COUNT(CASE WHEN submitted_at >= $1 THEN 1 END)::integer as current_month,
            COUNT(CASE WHEN submitted_at >= $2 AND submitted_at < $1 THEN 1 END)::integer as previous_month
          FROM reportings
          WHERE submitted_at >= $2
        ),
        observers_stats AS (
          SELECT 
            COUNT(CASE WHEN last_active_at >= $3 THEN 1 END)::integer as current_active,
            COUNT(CASE WHEN last_active_at >= $4 AND last_active_at < $3 THEN 1 END)::integer as previous_active
          FROM users
          WHERE role = 'SIGHTER' AND last_active_at >= $4
        )
        SELECT 
          s.total as total_sightings,
          s.current_month as sightings_current,
          s.previous_month as sightings_previous,
          r.total as total_reportings,
          r.current_month as reportings_current,
          r.previous_month as reportings_previous,
          o.current_active as observers_current,
          o.previous_active as observers_previous
        FROM sightings_stats s, reportings_stats r, observers_stats o
      `;

      const result = await client.query(statsQuery, [
        oneMonthAgo.toISOString(),
        twoMonthsAgo.toISOString(),
        oneWeekAgo.toISOString(),
        twoWeeksAgo.toISOString(),
      ]);

      const data = result.rows[0];

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      const statsData = {
        totalSightings: {
          value: data.total_sightings,
          change: calculateChange(
            data.sightings_current,
            data.sightings_previous
          ),
          changeType:
            data.sightings_current >= data.sightings_previous
              ? "increase"
              : "decrease",
          changeText: "from last month",
        },
        activeObservers: {
          value: data.observers_current,
          change: calculateChange(
            data.observers_current,
            data.observers_previous
          ),
          changeType:
            data.observers_current >= data.observers_previous
              ? "increase"
              : "decrease",
          changeText: "from last week",
        },
        totalReportings: {
          value: data.total_reportings,
          change: calculateChange(
            data.reportings_current,
            data.reportings_previous
          ),
          changeType:
            data.reportings_current >= data.reportings_previous
              ? "increase"
              : "decrease",
          changeText: "from last month",
        },
      };

      client.release();

      return NextResponse.json(
        {
          message: "Overview statistics fetched successfully",
          result: statsData,
        },
        { status: 200 }
      );
    } catch (queryError) {
      client.release();
      throw queryError;
    }
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
