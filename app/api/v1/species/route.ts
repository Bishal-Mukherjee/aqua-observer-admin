import { NextResponse } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async () => {
  try {
    const sql = `
      SELECT
        id,
        json_build_object('en', label_en, 'bn', label_bn) AS label,
        value,
        scientific_name AS "scientificName",
        category,
        conservation_status AS "conservationStatus",
        habitat,
        region_distribution AS "regionDistribution",
        identification_features AS "identificationFeatures",
        image,
        age_group AS "ageGroup",
		is_active AS "isActive",
        created_at   AS "createdAt",
        last_updated_at AS "lastUpdatedAt"
      FROM species
      ORDER BY id;
    `;
    const { rows } = await pool.query(sql);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Species fetched successfully", species: [] },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Species fetched successfully", result: rows },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
