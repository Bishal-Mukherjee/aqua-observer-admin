import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import { pool } from "@/app/api/config/db";
import { sendCode } from "@/app/api/lib/twilio";
import { ALLOWED_ROLES } from "@/constants/constants";

const signinSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+91\d{10}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Invalid phone number",
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

    const { phoneNumber } = body;

    const query = await pool.query(
      "SELECT id, role FROM users WHERE phone_number = $1",
      [phoneNumber]
    );

    if (query.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!ALLOWED_ROLES.includes(query.rows[0]?.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // const sendCodeResponse = await sendCode(phoneNumber);

    // if (sendCodeResponse.status !== "pending") {
    //   return NextResponse.json(
    //     { error: "Failed to send OTP" },
    //     { status: 500 }
    //   );
    // }

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
