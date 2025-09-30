import { NextResponse, type NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  return NextResponse.json({
    DB_HOST: process.env.DB_HOST,
    NODE_ENV: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter((key) => key.startsWith("DB_")),
  });
};
