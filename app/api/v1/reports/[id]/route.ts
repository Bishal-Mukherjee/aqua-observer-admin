import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const resolvedParams = await params;

    if (!resolvedParams.id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    try {
      const reportId = resolvedParams.id;

      const sql = `
	  SELECT id, 
	  submission_type AS "submissionType", 
	  description, 
	  report_url AS "reportUrl", 
	  csv_data_url AS "csvDataUrl", 
	  parameters,
	  created_by AS "createdBy", 
	  created_at AS "createdAt"
	  FROM reports
	  WHERE id = $1
	`;

      const result = await pool.query(sql, [reportId]);

      return NextResponse.json(
        {
          message: "Report fetched successfully",
          result: result.rows[0],
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error fetching report:", error);
      return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
      );
    }
  }
);
