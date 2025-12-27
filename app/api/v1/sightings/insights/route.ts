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
      const from = searchParams.get("from");
      const to = searchParams.get("to");

      const client = await pool.connect();

      let query = `SELECT
		   s.id,
           s.latitude,
           s.longitude,
		   s.village_or_ghat AS "villageOrGhat",
           s.block,
           s.district,
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'type', sp.species,
                   'adult', sp.adult,
                   'adultMale', sp.adult_male,
                   'adultFemale', sp.adult_female,
                   'subAdult', sp.sub_adult,
				   'unidentified', sp.unidentified
                 )
               ), '[]'
             )
             FROM (
               SELECT DISTINCT ON (species)
                 species,
                 adult,
                 adult_male,
                 adult_female,
                 sub_adult,
				 unidentified
               FROM sighting_species
               WHERE sighting_id = s.id
             ) sp
           ) AS "species",
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
         FROM sightings s
         LEFT JOIN users u ON s.submitted_by = u.id`;

      const queryParams = [];
      const conditions = [];

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
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY s.submitted_at DESC`;

      const result = await client.query(query, queryParams);
      client.release();

      return NextResponse.json(
        { message: "Sightings fetched successfully", result: result.rows },
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
