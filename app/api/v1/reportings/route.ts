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
      const districtsParam = searchParams.get("districts");
      const isValidParam = searchParams.get("isValid");
      const isValid = isValidParam !== null ? isValidParam === "true" : true;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = 10;
      const offset = (page - 1) * limit;

      let districts = null;

      if (districtsParam) {
        districts = districtsParam
          .split(",")
          .map((d) => d.trim())
          .filter((d) => d);
      }

      const client = await pool.connect();

      let baseQuery = `FROM reportings r
         LEFT JOIN users u ON r.submitted_by = u.id`;

      const queryParams = [];
      const conditions = [];

      if (submittedBy) {
        conditions.push(`r.submitted_by = $${queryParams.length + 1}`);
        queryParams.push(submittedBy);
      }

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

      if (districts && districts.length > 0) {
        const districtPlaceholders = districts
          .map((_, index) => `$${queryParams.length + index + 1}`)
          .join(",");
        conditions.push(`r.district IN (${districtPlaceholders})`);
        queryParams.push(...districts);
      }

      conditions.push(`r.is_valid = $${queryParams.length + 1}`);
      queryParams.push(isValid);

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
           JSON_BUILD_OBJECT(
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy"
         ${baseQuery}
         ORDER BY r.submitted_at DESC
         LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;

      queryParams.push(limit, offset);

      const result = await client.query(dataQuery, queryParams);
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
    } catch (error) {
      console.error("Error fetching reportings:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
