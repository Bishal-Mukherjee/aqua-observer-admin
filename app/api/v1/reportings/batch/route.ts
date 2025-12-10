import { NextResponse, type NextRequest } from "next/server";
import { isArray, isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !isArray(ids) || isEmpty(ids)) {
      return NextResponse.json(
        { error: "Invalid request. 'ids' must be a non-empty array." },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    const idPlaceholders = ids.map((_, index) => `$${index + 1}`).join(",");
    const queryParams = [...ids];

    let baseQuery = `FROM reportings r
         LEFT JOIN users u ON r.submitted_by = u.id
         WHERE r.id IN (${idPlaceholders})`;

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
        message: "Batch report generated successfully",
        result: result.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating batch report:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
