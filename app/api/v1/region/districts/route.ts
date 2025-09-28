import { NextResponse } from "next/server";
import { redisClient } from "@/app/api/config/redis";
import { withAuth } from "@/app/api/lib/with-auth";

export const GET = withAuth(async () => {
  try {
    const districts = (await redisClient.call(
      "JSON.GET",
      "districts"
    )) as string;

    if (districts) {
      return NextResponse.json({
        message: "Districts fetched successfully",
        result: JSON.parse(districts),
      });
    }

    return NextResponse.json({
      message: "Districts not found",
      result: [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
