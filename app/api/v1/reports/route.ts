import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const userId = request.headers.get("auth-user-id");
    const body = await request.json();

    const { submissionType, description, parameters } = body;

    const sql = `
      INSERT INTO reports (
        submission_type,
        description,
        parameters,
        created_by,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, submission_type, description, report_url, csv_data_url, parameters, created_by, created_at;
    `;

    const values = [
      submissionType,
      description || null,
      JSON.stringify(parameters),
      userId,
    ];

    const result = await pool.query(sql, values);

    return NextResponse.json(
      {
        message: "Report created successfully",
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
});

export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const userId = request.headers.get("auth-user-id");
    const body = await request.json();

    const { reportId, reportUrl, csvDataUrl } = body;

    if (!reportId) {
      return NextResponse.json(
        { error: "reportId is required" },
        { status: 400 },
      );
    }

    const sql = `
      UPDATE reports
      SET report_url = $1, csv_data_url = $2
      WHERE id = $3 AND created_by = $4
      RETURNING id, submission_type, description, report_url, csv_data_url, parameters, created_by, created_at;
    `;

    const values = [reportUrl || null, csvDataUrl || null, reportId, userId];

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Report not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Report updated successfully",
        data: result.rows[0],
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (from) {
      conditions.push(`r.created_at >= $${queryParams.length + 1}::date`);
      queryParams.push(from);
    }

    if (to) {
      conditions.push(
        `r.created_at <= $${
          queryParams.length + 1
        }::date + INTERVAL '1 day' - INTERVAL '1 second'`,
      );
      queryParams.push(to);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countQuery = `SELECT COUNT(*) as total FROM reports r ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    const dataQuery = `
      SELECT r.id,
        r.submission_type AS "submissionType",
        r.description,
        r.report_url AS "reportUrl",
        r.csv_data_url AS "csvDataUrl",
        u.name AS "createdBy",
        r.created_at AS "createdAt"
      FROM reports r
      LEFT JOIN users u ON r.created_by = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
    `;

    const result = await pool.query(dataQuery, [...queryParams, limit, offset]);

    return NextResponse.json(
      {
        message: "Reports fetched successfully",
        result: result.rows,
        pagination: {
          total,
          page,
          totalPages,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
});
