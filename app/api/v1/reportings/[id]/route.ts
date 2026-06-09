import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const resolvedParams = await params;

    if (!resolvedParams.id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }

    try {
      const client = await pool.connect();

      const [result, speciesResult, causesResult] = await Promise.all([
        client.query(
          `SELECT
             r.id,
             r.observed_at AS "observedAt",
             r.latitude AS "latitude",
             r.longitude AS "longitude",
             r.block,
             r.district,
             r.village_or_ghat AS "villageOrGhat",
             r.landmark,
             r.images,
             r.submission_context AS "submissionContext",
             r.submitted_at AS "submittedAt",
             r.is_valid AS "isValid",
			 r.submission_context AS "type",
			 r.is_valid AS "isValid",
			 r.notes,
             JSON_BUILD_OBJECT(
               'id', r.submitted_by,
               'name', u.name,
               'phoneNumber', u.phone_number
             ) AS "submittedBy"
            FROM reportings r
            LEFT JOIN users u ON r.submitted_by = u.id
            WHERE r.id = $1
         `,
          [resolvedParams.id]
        ),
        client.query(
          `SELECT
             species AS "type",
             JSON_BUILD_OBJECT(
               'stranded', adult_stranded,
               'injured', adult_injured,
               'dead', adult_dead
             ) AS "adult",
             JSON_BUILD_OBJECT(
               'stranded', adult_male_stranded,
               'injured', adult_male_injured,
               'dead', adult_male_dead
             ) AS "adultMale",
             JSON_BUILD_OBJECT(
               'stranded', adult_female_stranded,
               'injured', adult_female_injured,
               'dead', adult_female_dead
             ) AS "adultFemale",
             JSON_BUILD_OBJECT(
               'stranded', sub_adult_stranded,
               'injured', sub_adult_injured,
               'dead', sub_adult_dead
             ) AS "subAdult"
           FROM reporting_species 
           WHERE reporting_id = $1`,
          [resolvedParams.id]
        ),
        client.query(
          `SELECT 
			species, 
			cause,
			other_cause AS "otherCause"  
			FROM reporting_causes 
			WHERE reporting_id = $1`,
          [resolvedParams.id]
        ),
      ]);

      client.release();

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      const reportData = {
        ...result.rows[0],
        species: speciesResult.rows,
        causes: causesResult.rows,
      };

      return NextResponse.json(
        { message: "Report fetched successfully", result: reportData },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching report:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);

export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const resolvedParams = await params;
    if (!resolvedParams.id) {
      return NextResponse.json({ error: "Missing report ID" }, { status: 400 });
    }
    try {
      const client = await pool.connect();

      const query = await client.query(
        'SELECT id, is_valid AS "isValid" FROM reportings WHERE id=$1',
        [resolvedParams.id]
      );

      if (query.rows.length === 0) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 }
        );
      }

      const { isValid } = query.rows[0];

      await client.query(`UPDATE reportings SET is_valid = $2 WHERE id = $1`, [
        resolvedParams.id,
        !isValid,
      ]);
      client.release();
      return NextResponse.json(
        { message: "Report status updated successfully" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating report status:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
