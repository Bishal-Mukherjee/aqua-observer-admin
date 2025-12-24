import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'ids' must be a non-empty array." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    const idPlaceholders = ids.map((_, index) => `$${index + 1}`).join(",");
    const queryParams = [...ids];

    let baseQuery = `FROM sightings s
         LEFT JOIN users u ON s.submitted_by = u.id
         WHERE s.id IN (${idPlaceholders})`;

    let dataQuery = `SELECT
           s.id,
           s.latitude,
           s.longitude,
           s.district,
           s.block,
           s.village_or_ghat AS "villageOrGhat",
           s.water_body AS "waterBody",
           s.water_body_condition AS "waterBodyCondition",
           s.weather_condition AS "weatherCondition",
           s.threats,
           s.fishing_gears AS "fishingGears",
           s.notes,
           s.submitted_at AS "submittedAt",
           s.observed_at AS "observedAt",
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
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
         ${baseQuery}
         ORDER BY s.submitted_at DESC`;

    const result = await client.query(dataQuery, queryParams);
    client.release();

    return NextResponse.json(
      {
        message: "Batch sightings report generated successfully",
        result: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating batch sightings report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
