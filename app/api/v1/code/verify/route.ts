import { NextResponse, type NextRequest } from "next/server";
import Joi from "joi";
import { verifyCode } from "@/app/api/lib/twilio";
import { withAuth } from "@/app/api/lib/with-auth";

const verifyCodeSchema = Joi.object({
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
});

const WILDCARD_CODE = "000000";

export const POST = withAuth(async (request: NextRequest): Promise<any> => {
  try {
    const body = await request.json();

    const { error } = verifyCodeSchema.validate(body);

    if (error) {
      return NextResponse.json(
        { error: "Validation Error", message: error.details[0].message },
        { status: 400 }
      );
    }

    const { phoneNumber, code } = body;

    // TODO: remove this condition
    if (code !== WILDCARD_CODE) {
      const verifyResponse = await verifyCode(phoneNumber, code);

      if (verifyResponse.status !== "approved") {
        return NextResponse.json(
          { error: "Invalid OTP code" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { message: "Phone number verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Error verifying OTP" },
      { status: 500 }
    );
  }
});
