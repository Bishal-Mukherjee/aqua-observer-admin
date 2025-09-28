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
      return NextResponse.json(
        { error: "Missing sighting ID" },
        { status: 400 }
      );
    }

    try {
      const client = await pool.connect();

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
		   	 'id', s.submitted_by,
             'name', u.name,
             'phoneNumber', u.phone_number
           ) AS "submittedBy",	
           s.observed_at AS "observedAt"
           FROM sightings s
           LEFT JOIN users u ON s.submitted_by = u.id
           WHERE s.id = $1`,
        [resolvedParams.id]
      );

      client.release();

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Sighting not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: "Sighting fetched successfully", result: result.rows[0] },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching sighting:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
