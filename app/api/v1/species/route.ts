import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import { pool } from "@/app/api/config/db";
import { withAuth } from "@/app/api/lib/with-auth";

const CATEGORIES = ["BIRD", "MAMMAL", "REPTILE"];

const CONSERVATION_STATUS = [
  "CRITICALLY_ENDANGERED",
  "ENDANGERED",
  "VULNERABLE",
  "NEAR_THREATENED",
  "LEAST_CONCERN",
];

const HABITAT_OPTIONS = [
  "RIVERS",
  "WETLANDS",
  "COASTAL_AREAS",
  "MANGROVES",
  "ESTUARIES",
  "FRESHWATER_LAKES",
  "MARINE",
  "COASTAL",
  "LAKES",
  "MARSHES",
  "PONDS",
  "FIELDS",
];

const AGE_GROUP_OPTIONS = ["duo", "trio"];

const createSpeciesSchema = Joi.object({
  labelEn: Joi.string().max(150).trim().required().messages({
    "any.required": "English label is required",
    "string.max": "English label must be less than 150 characters",
  }),
  labelBn: Joi.string().max(150).trim().allow(null, "").messages({
    "string.max": "Bengali label must be less than 150 characters",
  }),
  scientificName: Joi.string().allow(null, "").max(150).trim().messages({
    "string.max": "Scientific name must be less than 150 characters",
  }),
  category: Joi.string()
    .allow(null, "")
    .valid(...CATEGORIES)
    .messages({
      "any.only": `Category must be one of: ${CATEGORIES.join(", ")}`,
    }),
  conservationStatus: Joi.string()
    .allow(null, "")
    .valid(...CONSERVATION_STATUS)
    .messages({
      "any.only": `Conservation status must be one of: ${CONSERVATION_STATUS.join(
        ", "
      )}`,
    }),
  habitat: Joi.array()
    .items(Joi.string().valid(...HABITAT_OPTIONS))
    .allow(null)
    .default([])
    .messages({
      "any.only": `Habitat options must be from: ${HABITAT_OPTIONS.join(", ")}`,
    }),
  geographicDistribution: Joi.array().allow(null).default([]),
  identificationFeatures: Joi.array()
    .items(Joi.string().trim())
    .default([])
    .messages({
      "array.base": "Identification features must be an array",
    }),
  image: Joi.string().allow(null, "").uri().messages({
    "string.uri": "Image must be a valid URL",
  }),
  ageGroup: Joi.string()
    .required()
    .valid(...AGE_GROUP_OPTIONS)
    .messages({
      "any.required": "Age group is required",
      "any.only": `Age group must be one of: ${AGE_GROUP_OPTIONS.join(", ")}`,
    }),
});

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

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();

    const { error } = createSpeciesSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 500 }
      );
    }

    const {
      labelEn,
      labelBn,
      scientificName,
      category,
      conservationStatus,
      habitat,
      geographicDistribution,
      identificationFeatures,
      image,
      ageGroup,
    } = body;

    const sql = `
      INSERT INTO species (
        label_en,
        label_bn,
        value,
        scientific_name,
        category,
        conservation_status,
        habitat,
        region_distribution,
        identification_features,
        image,
        age_group,
        is_active,
        created_at,
        last_updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW());
    `;

    const values = [
      labelEn,
      labelBn || null,
      labelEn.toLowerCase().replace(/\s+/g, "_"),
      scientificName || null,
      category,
      conservationStatus,
      habitat,
      geographicDistribution,
      identificationFeatures,
      image || null,
      ageGroup,
      true,
    ];

    await pool.query(sql, values);

    return NextResponse.json(
      { message: "Species created successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error creating species:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
