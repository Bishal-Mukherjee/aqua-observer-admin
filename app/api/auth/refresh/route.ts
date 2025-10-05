import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { compare } from "bcrypt";
import { pool } from "@/app/api/config/db";
import { config } from "@/app/api/config";

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { error } = refreshTokenSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 400 }
      );
    }

    const { refreshToken } = body;

    const tokenQuery = await pool.query(
      `SELECT rt.user_id, rt.token_hash, u.id, u.name, u.phone_number AS "phoneNumber", u.gender, u.role, u.status
       FROM refresh_tokens rt
       JOIN users u ON rt.user_id = u.id
       WHERE rt.expires_at > NOW()`
    );

    let user = null;

    for (const row of tokenQuery.rows) {
      const match = await compare(refreshToken, row.token_hash);
      if (match) {
        user = row;
        break;
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign(
      { id: user.id },
      config.jwtSecret,
      { expiresIn: "1m" } // or "30d" if you want to support rememberMe // 1d
    );

    return NextResponse.json(
      {
        message: "Access token refreshed successfully",
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          gender: user.gender,
          role: user.role,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error", message: JSON.stringify(err) },
      { status: 500 }
    );
  }
};
