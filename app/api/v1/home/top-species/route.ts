import { NextResponse, type NextRequest } from "next/server";
import { PoolClient } from "pg";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

type TopSpeciesRow = {
  species: string;
  label: { en: string; bn: string };
  image: string;
  category: string;
  conservationStatus: string;
  individualCount: number;
  submissionCount: number;
  sharePercent: number;
};

const mapRow = (
  row: Record<string, unknown>,
  categoryTotal: number
): TopSpeciesRow => {
  const individualCount = Number(row.individual_count) || 0;
  const sharePercent =
    categoryTotal > 0
      ? Math.round((individualCount / categoryTotal) * 100)
      : 0;

  return {
    species: row.species as string,
    label: row.label as { en: string; bn: string },
    image: (row.image as string) || "",
    category: (row.category as string) || "",
    conservationStatus: (row.conservation_status as string) || "",
    individualCount,
    submissionCount: Number(row.submission_count) || 0,
    sharePercent,
  };
};

async function getTopSightings(client: PoolClient): Promise<TopSpeciesRow[]> {
  const totalResult = await client.query(`
    SELECT COALESCE(SUM(
      COALESCE(ss.adult, 0) + COALESCE(ss.adult_male, 0) +
      COALESCE(ss.adult_female, 0) + COALESCE(ss.sub_adult, 0) +
      COALESCE(ss.unidentified, 0)
    ), 0)::integer AS total
    FROM sighting_species ss
    INNER JOIN sightings s ON s.id = ss.sighting_id AND s.is_valid = true
  `);
  const categoryTotal = Number(totalResult.rows[0]?.total) || 0;

  const result = await client.query(`
    SELECT
      ss.species,
      json_build_object('en', sp.label_en, 'bn', sp.label_bn) AS label,
      sp.image,
      sp.category,
      sp.conservation_status,
      COUNT(DISTINCT ss.sighting_id)::integer AS submission_count,
      SUM(
        COALESCE(ss.adult, 0) + COALESCE(ss.adult_male, 0) +
        COALESCE(ss.adult_female, 0) + COALESCE(ss.sub_adult, 0) +
        COALESCE(ss.unidentified, 0)
      )::integer AS individual_count
    FROM sighting_species ss
    INNER JOIN sightings s ON s.id = ss.sighting_id AND s.is_valid = true
    INNER JOIN species sp ON sp.value = ss.species
    GROUP BY ss.species, sp.label_en, sp.label_bn, sp.image, sp.category, sp.conservation_status
    HAVING SUM(
      COALESCE(ss.adult, 0) + COALESCE(ss.adult_male, 0) +
      COALESCE(ss.adult_female, 0) + COALESCE(ss.sub_adult, 0) +
      COALESCE(ss.unidentified, 0)
    ) > 0
    ORDER BY individual_count DESC
    LIMIT 3
  `);

  return result.rows.map((row) => mapRow(row, categoryTotal));
}

async function getTopReportings(client: PoolClient): Promise<TopSpeciesRow[]> {
  const individualExpr = `
    COALESCE(rs.adult_stranded, 0) + COALESCE(rs.adult_injured, 0) + COALESCE(rs.adult_dead, 0) +
    COALESCE(rs.adult_male_stranded, 0) + COALESCE(rs.adult_male_injured, 0) + COALESCE(rs.adult_male_dead, 0) +
    COALESCE(rs.adult_female_stranded, 0) + COALESCE(rs.adult_female_injured, 0) + COALESCE(rs.adult_female_dead, 0) +
    COALESCE(rs.sub_adult_stranded, 0) + COALESCE(rs.sub_adult_injured, 0) + COALESCE(rs.sub_adult_dead, 0)
  `;

  const totalResult = await client.query(`
    SELECT COALESCE(SUM(${individualExpr}), 0)::integer AS total
    FROM reporting_species rs
    INNER JOIN reportings r ON r.id = rs.reporting_id AND r.is_valid = true
  `);
  const categoryTotal = Number(totalResult.rows[0]?.total) || 0;

  const result = await client.query(`
    SELECT
      rs.species,
      json_build_object('en', sp.label_en, 'bn', sp.label_bn) AS label,
      sp.image,
      sp.category,
      sp.conservation_status,
      COUNT(DISTINCT rs.reporting_id)::integer AS submission_count,
      SUM(${individualExpr})::integer AS individual_count
    FROM reporting_species rs
    INNER JOIN reportings r ON r.id = rs.reporting_id AND r.is_valid = true
    INNER JOIN species sp ON sp.value = rs.species
    GROUP BY rs.species, sp.label_en, sp.label_bn, sp.image, sp.category, sp.conservation_status
    HAVING SUM(${individualExpr}) > 0
    ORDER BY individual_count DESC
    LIMIT 3
  `);

  return result.rows.map((row) => mapRow(row, categoryTotal));
}

async function getTopDeadInjured(client: PoolClient): Promise<TopSpeciesRow[]> {
  const individualExpr = `
    COALESCE(rs.adult_injured, 0) + COALESCE(rs.adult_dead, 0) +
    COALESCE(rs.adult_male_injured, 0) + COALESCE(rs.adult_male_dead, 0) +
    COALESCE(rs.adult_female_injured, 0) + COALESCE(rs.adult_female_dead, 0) +
    COALESCE(rs.sub_adult_injured, 0) + COALESCE(rs.sub_adult_dead, 0)
  `;

  const totalResult = await client.query(`
    SELECT COALESCE(SUM(${individualExpr}), 0)::integer AS total
    FROM reporting_species rs
    INNER JOIN reportings r ON r.id = rs.reporting_id AND r.is_valid = true
  `);
  const categoryTotal = Number(totalResult.rows[0]?.total) || 0;

  const result = await client.query(`
    SELECT
      rs.species,
      json_build_object('en', sp.label_en, 'bn', sp.label_bn) AS label,
      sp.image,
      sp.category,
      sp.conservation_status,
      COUNT(DISTINCT rs.reporting_id)::integer AS submission_count,
      SUM(${individualExpr})::integer AS individual_count
    FROM reporting_species rs
    INNER JOIN reportings r ON r.id = rs.reporting_id AND r.is_valid = true
    INNER JOIN species sp ON sp.value = rs.species
    GROUP BY rs.species, sp.label_en, sp.label_bn, sp.image, sp.category, sp.conservation_status
    HAVING SUM(${individualExpr}) > 0
    ORDER BY individual_count DESC
    LIMIT 3
  `);

  return result.rows.map((row) => mapRow(row, categoryTotal));
}

export const GET = withAuth(async (_request: NextRequest) => {
  try {
    const client = await pool.connect();

    try {
      const [sightings, reportings, deadInjured] = await Promise.all([
        getTopSightings(client),
        getTopReportings(client),
        getTopDeadInjured(client),
      ]);

      client.release();

      return NextResponse.json(
        {
          message: "Top species fetched successfully",
          result: {
            sightings,
            reportings,
            deadInjured,
          },
        },
        { status: 200 }
      );
    } catch (queryError) {
      client.release();
      throw queryError;
    }
  } catch (error) {
    console.error("Error fetching top species:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
