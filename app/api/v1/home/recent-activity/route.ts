import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const client = await pool.connect();

    try {
      const query = `
        WITH latest_reporting AS (
          SELECT
            r.id,
            r.district,
            r.block,
            r.village_or_ghat AS "villageOrGhat",
            r.is_valid AS "isValid",
            r.submitted_at AS "submittedAt",
            u.name AS "submittedBy"
          FROM reportings r
          LEFT JOIN users u ON r.submitted_by = u.id
          ORDER BY r.submitted_at DESC
          LIMIT 1
        ),
        latest_sighting AS (
          SELECT
            s.id,
            s.district,
            s.block,
            s.village_or_ghat AS "villageOrGhat",
            s.is_valid AS "isValid",
            s.submitted_at AS "submittedAt",
            u.name AS "submittedBy"
          FROM sightings s
          LEFT JOIN users u ON s.submitted_by = u.id
          ORDER BY s.submitted_at DESC
          LIMIT 1
        ),
        latest_sighter AS (
          SELECT
            id,
            name,
            email,
            created_at AS "createdAt",
			last_active_at AS "lastActiveAt"
          FROM users
          WHERE role = 'SIGHTER' AND last_active_at IS NOT NULL
          ORDER BY created_at DESC
          LIMIT 1
        ),
        latest_report AS (
          SELECT
            r.id,
            r.submission_type AS "submissionType",
            r.description,
            r.report_url AS "reportUrl",
            r.created_at AS "createdAt",
            u.name AS "createdBy"
          FROM reports r
          LEFT JOIN users u ON r.created_by = u.id
          WHERE r.report_url IS NOT NULL
          ORDER BY r.created_at DESC
          LIMIT 1
        )
        SELECT
          (SELECT row_to_json(latest_reporting) FROM latest_reporting) AS "latestReporting",
          (SELECT row_to_json(latest_sighting) FROM latest_sighting) AS "latestSighting",
          (SELECT row_to_json(latest_sighter) FROM latest_sighter) AS "latestSighter",
          (SELECT row_to_json(latest_report) FROM latest_report) AS "latestReport"
      `;

      const result = await client.query(query);
      const row = result.rows[0];

      return NextResponse.json(
        {
          message: "Recent activity fetched successfully",
          result: {
            latestReporting: row.latestReporting ?? null,
            latestSighting: row.latestSighting ?? null,
            latestSighter: row.latestSighter ?? null,
            latestReport: row.latestReport ?? null,
          },
        },
        { status: 200 },
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error("Error fetching recent activity:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
});
