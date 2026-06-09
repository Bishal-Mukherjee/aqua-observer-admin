import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const {
      from,
      to,
      districts,
      species,
      waterBody,
      waterBodyConditions,
      weatherConditions,
      threats,
      fishingGears,
    } = body;

    const client = await pool.connect();

    let baseQuery = `FROM sightings s
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

    if (districts && Array.isArray(districts) && districts.length > 0) {
      const districtPlaceholders = districts
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(`s.district IN (${districtPlaceholders})`);
      queryParams.push(...districts);
    }

    if (species && Array.isArray(species) && species.length > 0) {
      const speciesPlaceholders = species
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(
        `EXISTS (SELECT 1 FROM sighting_species ss WHERE ss.sighting_id = s.id AND ss.species IN (${speciesPlaceholders}))`
      );
      queryParams.push(...species);
    }

    if (waterBody && Array.isArray(waterBody) && waterBody.length > 0) {
      const waterBodyFilters = waterBody.map((body) => {
        queryParams.push(body);
        return `$${queryParams.length} = ANY(s.water_body)`;
      });
      conditions.push(`(${waterBodyFilters.join(" OR ")})`);
    }

    if (
      waterBodyConditions &&
      Array.isArray(waterBodyConditions) &&
      waterBodyConditions.length > 0
    ) {
      const waterBodyConditionPlaceholders = waterBodyConditions
        .map((_, index) => `$${queryParams.length + index + 1}`)
        .join(",");
      conditions.push(
        `s.water_body_condition IN (${waterBodyConditionPlaceholders})`
      );
      queryParams.push(...waterBodyConditions);
    }

    if (
      weatherConditions &&
      Array.isArray(weatherConditions) &&
      weatherConditions.length > 0
    ) {
      const weatherConditionsFilter = weatherConditions.map((condition) => {
        queryParams.push(condition);
        return `$${queryParams.length} = ANY(s.weather_condition)`;
      });
      conditions.push(`(${weatherConditionsFilter.join(" OR ")})`);
    }

    if (threats && Array.isArray(threats) && threats.length > 0) {
      const threatsConditions = threats.map((threat) => {
        queryParams.push(threat);
        return `$${queryParams.length} = ANY(s.threats)`;
      });
      conditions.push(`(${threatsConditions.join(" OR ")})`);
    }

    if (
      fishingGears &&
      Array.isArray(fishingGears) &&
      fishingGears.length > 0
    ) {
      const fishingGearsConditions = fishingGears.map((gear) => {
        queryParams.push(gear);
        return `$${queryParams.length} = ANY(s.fishing_gears)`;
      });
      conditions.push(`(${fishingGearsConditions.join(" OR ")})`);
    }

    if (conditions.length > 0) {
      baseQuery += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Main query to get sightings
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
         ${baseQuery}
         ORDER BY s.submitted_at DESC`;

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
