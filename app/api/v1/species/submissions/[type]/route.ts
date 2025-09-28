import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ type: string }> }
  ) => {
    const resolvedParams = await params;
    const { searchParams } = new URL(request.url);
    const species = searchParams.get("speciesValue");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!species) {
      return NextResponse.json(
        { error: "Missing species parameter" },
        { status: 400 }
      );
    }

    if (
      !resolvedParams.type ||
      !["reportings", "sightings"].includes(resolvedParams.type)
    ) {
      return NextResponse.json(
        {
          error: "Invalid submission type. Must be 'reportings' or 'sightings'",
        },
        { status: 400 }
      );
    }

    try {
      const client = await pool.connect();

      const conditions: string[] = [];
      const queryParams: any[] = [species];
      let paramIdx = 2;

      if (from) {
        conditions.push(`s.submitted_at >= $${paramIdx}::date`);
        queryParams.push(from);
        paramIdx++;
      }
      if (to) {
        conditions.push(
          `s.submitted_at <= $${paramIdx}::date + INTERVAL '1 day' - INTERVAL '1 second'`
        );
        queryParams.push(to);
        paramIdx++;
      }

      const whereClause =
        conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

      if (resolvedParams.type === "sightings") {
        const countResult = await client.query(
          `SELECT COUNT(DISTINCT s.id) as total
           FROM sightings s
           WHERE s.is_valid = true
           AND s.id IN (
             SELECT DISTINCT sighting_id 
             FROM sighting_species 
             WHERE species = $1
           )
           ${whereClause}`,
          queryParams
        );

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const result = await client.query(
          `SELECT
             s.id,
             s.district,
             s.block,
             s.village_or_ghat AS "villageOrGhat",
             s.latitude,
             s.longitude,
             s.water_body AS "waterBody",
             s.water_body_condition AS "waterBodyCondition",
             s.weather_condition AS "weatherCondition",
             s.notes,
             s.submission_context AS "type",
             s.submitted_at AS "submittedAt",
             s.observed_at AS "observedAt",
             s.threats,
             s.fishing_gears AS "fishingGears",
             JSON_BUILD_OBJECT(
               'id', s.submitted_by,
               'name', u.name,
               'phoneNumber', u.phone_number
             ) AS "submittedBy"
           FROM sightings s
           LEFT JOIN users u ON s.submitted_by = u.id
           WHERE s.is_valid = true
           AND s.id IN (
             SELECT DISTINCT sighting_id 
             FROM sighting_species 
             WHERE species = $1
           )
           ${whereClause}
           ORDER BY s.submitted_at DESC
           LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
          [...queryParams, limit, offset]
        );

        client.release();

        return NextResponse.json(
          {
            message: "Sightings fetched successfully",
            result: result.rows,
            pagination: {
              total,
              page,
              totalPages,
            },
          },
          { status: 200 }
        );
      } else if (resolvedParams.type === "reportings") {
        const countResult = await client.query(
          `SELECT COUNT(DISTINCT r.id) as total
           FROM reportings r
           WHERE r.is_valid = true
           AND r.id IN (
             SELECT DISTINCT reporting_id 
             FROM reporting_species 
             WHERE species = $1
           )
           ${whereClause.replace(/s\./g, "r.")}`,
          queryParams
        );

        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        const result = await client.query(
          `SELECT
             r.id,
             r.observed_at AS "observedAt",
             r.latitude AS "latitude",
             r.longitude AS "longitude",
             r.block,
             r.district,
             r.village_or_ghat AS "villageOrGhat",
             r.submitted_at AS "submittedAt",
             r.submission_context AS "type",
             JSON_BUILD_OBJECT(
               'id', r.submitted_by,
               'name', u.name,
               'phoneNumber', u.phone_number
             ) AS "submittedBy"
           FROM reportings r
           LEFT JOIN users u ON r.submitted_by = u.id
           WHERE r.is_valid = true
           AND r.id IN (
             SELECT DISTINCT reporting_id 
             FROM reporting_species 
             WHERE species = $1
           )
           ${whereClause.replace(/s\./g, "r.")}
           ORDER BY r.submitted_at DESC
           LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
          [...queryParams, limit, offset]
        );

        client.release();

        return NextResponse.json(
          {
            message: "Reportings fetched successfully",
            result: result.rows,
            pagination: {
              total,
              page,
              totalPages,
            },
          },
          { status: 200 }
        );
      }

      client.release();

      return NextResponse.json(
        { error: "Invalid submission type" },
        { status: 400 }
      );
    } catch (error) {
      console.error("Error fetching species submissions:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
