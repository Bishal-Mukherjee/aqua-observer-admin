import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { hash, compare } from "bcrypt";
import { pool } from "@/app/api/config/db";
import { config } from "@/app/api/config";

const signinSchema = Joi.object({
  phoneNumber: Joi.string().required().messages({
    "any.required": "Phone number is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();

    const { error } = signinSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 500 }
      );
    }

    const { phoneNumber, password } = body;

    const query = await pool.query(
      "SELECT id, password FROM users WHERE phone_number = $1",
      [phoneNumber]
    );

    if (query.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const user = query.rows[0];

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
      },
      config.jwtSecret,
      {
        expiresIn: "1d",
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
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ]
    );

    await pool.query(
      "DELETE FROM refresh_tokens WHERE user_id = $1 AND expires_at < NOW()",
      [user.id]
    );

    return NextResponse.json(
      {
        message: "User signed in successfully",
        result: {
          accessToken,
          refreshToken,
        },
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
