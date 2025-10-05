import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { from, to, districts, species } = body;

    const client = await pool.connect();

    let baseQuery = `FROM reportings r
         LEFT JOIN users u ON r.submitted_by = u.id
         LEFT JOIN reporting_species rs ON r.id = rs.reporting_id`;

    const queryParams = [];
    const conditions = [];

    if (from) {
      conditions.push(`r.submitted_at >= $${queryParams.length + 1}::date`);
      queryParams.push(from);
    }

    if (to) {
      conditions.push(
        `r.submitted_at <= $${
          queryParams.length + 1
        }::date + INTERVAL '1 day' - INTERVAL '1 second'`
      );
      queryParams.push(to);
    }

    if (districts && Array.isArray(districts) && districts.length > 0) {
      const districtPlaceholders = districts
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(`r.district IN (${districtPlaceholders})`);
      queryParams.push(...districts);
    }

    if (species && Array.isArray(species) && species.length > 0) {
      const speciesPlaceholders = species
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(`rs.species IN (${speciesPlaceholders})`);
      queryParams.push(...species);
    }

    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Main query to get reportings
    let dataQuery = `SELECT
           r.id,
           r.latitude,
           r.longitude,
           r.district,
           r.block,
           r.village_or_ghat AS "villageOrGhat",
           r.submitted_at AS "submittedAt",
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'type', s.species,
                   'adult', JSON_BUILD_OBJECT(
                     'stranded', s.adult_stranded,
                     'injured', s.adult_injured,
                     'dead', s.adult_dead
                   ),
                   'adultMale', JSON_BUILD_OBJECT(
                     'stranded', s.adult_male_stranded,
                     'injured', s.adult_male_injured,
                     'dead', s.adult_male_dead
                   ),
                   'adultFemale', JSON_BUILD_OBJECT(
                     'stranded', s.adult_female_stranded,
                     'injured', s.adult_female_injured,
                     'dead', s.adult_female_dead
                   ),
                   'subAdult', JSON_BUILD_OBJECT(
                     'stranded', s.sub_adult_stranded,
                     'injured', s.sub_adult_injured,
                     'dead', s.sub_adult_dead
                   )
                 )
               ), '[]'
             )
             FROM (
               SELECT DISTINCT ON (species)
                 species,
                 adult_stranded, adult_injured, adult_dead,
                 adult_male_stranded, adult_male_injured, adult_male_dead,
                 adult_female_stranded, adult_female_injured, adult_female_dead,
                 sub_adult_stranded, sub_adult_injured, sub_adult_dead
               FROM reporting_species
               WHERE reporting_id = r.id
             ) s
           ) AS "species",
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'species', c.species,
                   'cause', c.cause,
                   'otherCause', c.other_cause
                 )
               ), '[]'
             )
             FROM reporting_causes c
             WHERE c.reporting_id = r.id
           ) AS "causes",
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
         ${baseQuery}
         ORDER BY r.submitted_at DESC`;

    const result = await client.query(dataQuery, queryParams);
    client.release();

    return NextResponse.json(
      {
        message: "Report data fetched successfully",
        result: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
