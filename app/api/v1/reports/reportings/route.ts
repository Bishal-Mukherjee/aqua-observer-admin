import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { from, to, districts, species, submissionContext, isValid } = body;

    const client = await pool.connect();

    let baseQuery = `FROM reportings r
         LEFT JOIN users u ON r.submitted_by = u.id`;

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
      conditions.push(
        `EXISTS (SELECT 1 FROM reporting_species rs WHERE rs.reporting_id = r.id AND rs.species IN (${speciesPlaceholders}))`
      );
      queryParams.push(...species);
    }

    if (
      submissionContext &&
      Array.isArray(submissionContext) &&
      submissionContext.length > 0
    ) {
      const submissionContextPlaceholders = submissionContext
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(
        `r.submission_context IN (${submissionContextPlaceholders})`
      );
      queryParams.push(...submissionContext);
    }

    if (isValid !== undefined && isValid !== null) {
      conditions.push(`r.is_valid = $${queryParams.length + 1}`);
      queryParams.push(isValid);
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
           r.images,
           r.submission_context AS "submissionContext",
           r.submitted_at AS "submittedAt",
           r.observed_at AS "observedAt",
           r.is_valid AS "isValid",
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'type', sp.species,
                   'adult', JSON_BUILD_OBJECT(
                     'stranded', sp.adult_stranded,
                     'injured', sp.adult_injured,
                     'dead', sp.adult_dead
                   ),
                   'adultMale', JSON_BUILD_OBJECT(
                     'stranded', sp.adult_male_stranded,
                     'injured', sp.adult_male_injured,
                     'dead', sp.adult_male_dead
                   ),
                   'adultFemale', JSON_BUILD_OBJECT(
                     'stranded', sp.adult_female_stranded,
                     'injured', sp.adult_female_injured,
                     'dead', sp.adult_female_dead
                   ),
                   'subAdult', JSON_BUILD_OBJECT(
                     'stranded', sp.sub_adult_stranded,
                     'injured', sp.sub_adult_injured,
                     'dead', sp.sub_adult_dead
                   )
                 )
               ), '[]'
             )
             FROM (
               SELECT DISTINCT ON (species)
                 species,
                 adult_stranded,
                 adult_injured,
                 adult_dead,
                 adult_male_stranded,
                 adult_male_injured,
                 adult_male_dead,
                 adult_female_stranded,
                 adult_female_injured,
                 adult_female_dead,
                 sub_adult_stranded,
                 sub_adult_injured,
                 sub_adult_dead
               FROM reporting_species
               WHERE reporting_id = r.id
             ) sp
           ) AS "species",
           (
             SELECT COALESCE(
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'species', rc.species,
                   'cause', rc.cause,
                   'otherCause', rc.other_cause
                 )
               ), '[]'
             )
             FROM reporting_causes rc
             WHERE rc.reporting_id = r.id
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
        message: "Report generated successfully",
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
