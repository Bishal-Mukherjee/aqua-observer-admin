import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import { pool } from "@/app/api/config/db";
import { sendCode } from "@/app/api/lib/twilio";

const signinSchema = Joi.object({
  phoneNumber: Joi.string().length(10).required().messages({
    "any.required": "Phone number is required",
    "string.length": "Phone number must be exactly 10 digits",
  }),
  isTest: Joi.boolean().optional(),
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

    const { phoneNumber, isTest } = body;

    const query = await pool.query(
      "SELECT id FROM users WHERE phone_number = $1",
      [phoneNumber]
    );

    if (query.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // TODO: remove this condition
    if (!isTest) {
      const sendCodeResponse = await sendCode(phoneNumber);

      if (sendCodeResponse.status !== "pending") {
        return NextResponse.json(
          { error: "Failed to send OTP" },
          { status: 500 }
        );
      }
    }

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
