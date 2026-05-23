import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { hash } from "bcrypt";
import { pool } from "@/app/api/config/db";
import { config } from "@/app/api/config";
import { verifyCode } from "@/app/api/lib/twilio";
import { ALLOWED_ROLES } from "@/constants/constants";

const verifyOtpSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+91\d{10}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Invalid phone number",
    }),
  code: Joi.string().length(6).required().messages({
    "any.required": "OTP code is required",
    "string.length": "OTP code must be exactly 6 digits",
  }),
  rememberMe: Joi.boolean().optional(),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const { error } = verifyOtpSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 500 }
      );
    }

    const { phoneNumber, code, rememberMe = false } = body;

    const query = await pool.query(
      `SELECT id, name, phone_number AS "phoneNumber", gender, role, status, last_active_at AS "lastActiveAt" FROM users WHERE phone_number = $1`,
      [phoneNumber]
    );

    if (!ALLOWED_ROLES.includes(query.rows[0]?.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const verifyResponse = await verifyCode(phoneNumber, code);

    if (verifyResponse.status !== "approved") {
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 401 });
    }

    const user = query.rows[0];

    const accessTokenExpiresIn = rememberMe ? "30d" : "1d";
    const refreshTokenExpiresInMs = rememberMe
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      config.jwtSecret,
      {
        expiresIn: accessTokenExpiresIn,
      }
    );

    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshTokenHash = await hash(refreshToken, 10);

    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) 
         VALUES ($1, $2, $3, NOW())`,
      [
        user.id,
        refreshTokenHash,
        new Date(Date.now() + refreshTokenExpiresInMs),
      ]
    );

    await pool.query(
      "DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()",
      [user.id]
    );

    return NextResponse.json(
      {
        message: "OTP verified successfully",
        result: {
          accessToken,
          refreshToken,
          user,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Internal Server Error", message: JSON.stringify(err) },
      { status: 500 }
    );
  }
};
