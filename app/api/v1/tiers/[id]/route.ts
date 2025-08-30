import { NextResponse } from "next/server";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const PUT = withAuth(async (request, { params }) => {
  const resolvedParams = await params;

  try {
    const id = String(resolvedParams.id);
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: "Tier ID is required" },
        { status: 400 }
      );
    }

    const selectQuery = `
      SELECT
        json_build_object(
          'title', json_build_object(
            'en', title_en,
            'bn', title_bn
          ),
          'description', json_build_object(
            'en', description_en,
            'bn', description_bn
          ),
		  'isActive', is_active
        ) AS tier
      FROM tiers
      WHERE id = $1
    `;

    const { rows } = await pool.query(selectQuery, [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Tier not found" }, { status: 404 });
    }

    const updatedTier = {
      title: {
        en: body.tier.title.en,
        bn: body.tier.title.bn,
      },
      description: {
        en: body.tier.description.en,
        bn: body.tier.description.bn,
      },
      isActive: body.tier.isActive,
    };

    if (JSON.stringify(updatedTier) !== JSON.stringify(rows[0].tier)) {
      const updateQuery = `
          UPDATE tiers
          SET title_en = $1, title_bn = $2, description_en = $3, description_bn = $4, is_active = $5, last_updated_at = NOW()
          WHERE id = $6
        `;
      await pool.query(updateQuery, [
        updatedTier.title.en,
        updatedTier.title.bn,
        updatedTier.description.en,
        updatedTier.description.bn,
        updatedTier.isActive,
        id,
      ]);
    }

    if (body.modules && Array.isArray(body.modules)) {
      for (const module of body.modules) {
        const moduleQuery = "UPDATE modules SET is_active = $1 WHERE id = $2";
        await pool.query(moduleQuery, [module.isActive, module.id]);
      }
    }

    const { rows: updatedRows } = await pool.query(selectQuery, [id]);
    return NextResponse.json(
      {
        message: "Tier updated successfully",
        result: updatedRows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating tier:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
