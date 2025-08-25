import { NextResponse, type NextRequest } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const PUT = withAuth(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const resolvedParams = await params;
      const body = await request.json();

      const sql = `
          UPDATE species
          SET
            scientific_name = $1,
            category = $2,
            conservation_status = $3,
            habitat = $4,
            region_distribution = $5,
            identification_features = $6,
            image = $7,
            age_group = $8,
            is_active = $9,
            last_updated_at = NOW()
          WHERE id = $10
          RETURNING *;
        `;

      const values = [
        body.scientificName,
        body.category,
        body.conservationStatus,
        body.habitat,
        body.regionDistribution,
        body.identificationFeatures,
        body.image,
        body.ageGroup,
        body.isActive,
        resolvedParams.id,
      ];

      const { rows } = await pool.query(sql, values);

      if (!rows || rows.length === 0) {
        return NextResponse.json(
          { message: "Species not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Species updated successfully",
          result: rows[0],
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating species:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
);
