import { NextResponse } from "next/server";
import { isEmpty } from "lodash";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async () => {
  try {
    const sql = `
      SELECT json_agg(
        json_build_object(
          'id', t.id,
          'tier', t.tier,
          'title', json_build_object(
            'en', t.title_en,
            'bn', t.title_bn
          ),
          'description', json_build_object(
            'en', t.description_en,
            'bn', t.description_bn
          ),
          'modules', COALESCE(m.modules, 0)::text,
          'users', COALESCE(u.users, 0)::text,
		  'isActive', t.is_active,
          'createdAt', t.created_at,
          'lastUpdatedAt', t.last_updated_at
        )
      ) AS result
      FROM tiers t
      LEFT JOIN (
        SELECT tier, COUNT(*) AS modules
        FROM modules
        GROUP BY tier
      ) m ON t.tier = m.tier
      LEFT JOIN (
        SELECT tier, COUNT(*) AS users
        FROM users
        WHERE role = 'SIGHTER'
        GROUP BY tier
      ) u ON t.tier = u.tier
    `;

    const { rows } = await pool.query(sql);

    if (!rows || rows.length === 0 || !rows[0].result) {
      return NextResponse.json(
        { message: "Tiers fetched successfully", tiers: [] },
        { status: 200 }
      );
    }

    const sortedResults = rows[0].result.sort(
      (a: { tier: string }, b: { tier: string }) => a.tier.localeCompare(b.tier)
    );

    return NextResponse.json(
      { message: "Tiers fetched successfully", result: sortedResults },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tiers:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request) => {
  try {
    const body = await request.json();

    const { tier, modules } = body;

    const getTiersQuery = "SELECT id, tier FROM tiers";

    const { rows: existingTiers } = await pool.query(getTiersQuery);

    const lastAddedTier = existingTiers.sort((a, b) =>
      a.tier.localeCompare(b.tier)
    )[existingTiers.length - 1];

    const upcomingTier = `TIER_${
      parseInt(lastAddedTier.tier.split("_")[1]) + 1
    }`;

    const sql = `
      INSERT INTO tiers (tier, title_en, title_bn, description_en, description_bn)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(sql, [
      upcomingTier,
      tier.title.en,
      tier.title.bn,
      tier.description.en,
      tier.description.bn,
    ]);

    if (!isEmpty(modules)) {
      for (const module of modules) {
        const sql = `
          INSERT INTO modules (title_en, title_bn, description_en, description_bn, thumbnail, url, tier)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

        await pool.query(sql, [
          module.title.en,
          module.title.bn,
          module.description.en,
          module.description.bn,
          module.thumbnail,
          module.url,
          upcomingTier,
        ]);
      }
    }

    return NextResponse.json(
      {
        message: "Tier created successfully",
        tier: rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating tier:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
