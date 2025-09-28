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
      const submittedBy = searchParams.get("submittedBy");
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = 10;
      const offset = (page - 1) * limit;

      const client = await pool.connect();

      let baseQuery = `FROM sightings s
           LEFT JOIN users u ON s.submitted_by = u.id`;

      const queryParams = [];
      const conditions = [];

      if (submittedBy) {
        conditions.push(`s.submitted_by = $${queryParams.length + 1}`);
        queryParams.push(submittedBy);
      }

      if (from) {
        conditions.push(`s.submitted_at >= $${queryParams.length + 1}::date`);
        queryParams.push(from);
      }

      if (to) {
        conditions.push(
          `s.submitted_at <= $${
            queryParams.length + 1
          }::date + INTERVAL '1 day' - INTERVAL '1 second'`
        );
        queryParams.push(to);
      }

      if (conditions.length > 0) {
        baseQuery += ` WHERE ${conditions.join(" AND ")}`;
      }

      // Count total records
      const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      const countResult = await client.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      // Main query with pagination
      let dataQuery = `SELECT
           s.id,
           s.district,
           s.block,
           s.village_or_ghat AS "villageOrGhat",
           s.latitude,
           s.longitude,
           s.water_body AS "waterBody",
           s.water_body_condition AS "waterBodyCondition",
           s.weather_condition AS "weatherCondition",
           s.images,
           s.notes,
           s.submission_context AS "type",
           s.is_valid AS "isValid",
           s.submitted_at AS "submittedAt",
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'type', sp.species,
                   'adult', sp.adult,
                   'adultMale', sp.adult_male,
                   'adultFemale', sp.adult_female,
                   'subAdult', sp.sub_adult
                 )
               ), '[]'
             )
             FROM (
               SELECT DISTINCT ON (species)
                 species,
                 adult,
                 adult_male,
                 adult_female,
                 sub_adult
               FROM sighting_species
               WHERE sighting_id = s.id
             ) sp
           ) AS "species",
           s.threats,
           s.fishing_gears AS "fishingGears",
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy",	
           s.observed_at AS "observedAt"
         ${baseQuery}
         ORDER BY s.submitted_at DESC
         LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

      queryParams.push(limit, offset);

      const result = await client.query(dataQuery, queryParams);
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
    } catch (error) {
      console.error("Error fetching sightings:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
