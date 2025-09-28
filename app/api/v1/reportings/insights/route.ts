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
           r.id,
           r.latitude,
           r.longitude,
           r.village_or_ghat AS "villageOrGhat",
           r.block,
           r.district,
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
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
         FROM reportings r
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

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      query += ` ORDER BY r.submitted_at DESC`;

      const result = await client.query(query, queryParams);
      client.release();

      return NextResponse.json(
        { message: "Reportings fetched successfully", result: result.rows },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching reportings:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
