import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import { sendCode } from "@/app/api/lib/twilio";
import { withAuth } from "@/app/api/lib/with-auth";

const sendCodeSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^\+91\d{10}$/)
    .required()
    .messages({
      "any.required": "Phone number is required",
      "string.pattern.base": "Invalid phone number",
    }),
});

export const POST = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const body = await request.json();

    const { error } = sendCodeSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 500 }
      );
    }

    const { phoneNumber } = body;

    // const query = await pool.query("SELECT id, role FROM users WHERE id = $1", [
    //   id,
    // ]);

    // if (query.rows.length === 0) {
    //   return NextResponse.json({ error: "User not found" }, { status: 404 });
    // }

    const sendCodeResponse = await sendCode(phoneNumber);

    if (sendCodeResponse.status !== "pending") {
      return NextResponse.json(
        { error: "Failed to send OTP" },
        { status: 500 }
      );
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
});
