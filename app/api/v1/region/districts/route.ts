import { NextResponse } from "next/server";
import { withAuth } from "@/app/api/lib/with-auth";
import { getLookupObjectKey, getObjectFromS3 } from "@/lib/storage";

export const GET = withAuth(async () => {
  try {
    const { bucket, key } = getLookupObjectKey("districts.json");
    const objectBody = await getObjectFromS3(bucket, key);

    if (!objectBody) {
      return NextResponse.json({
        message: "Districts not found",
        result: [],
      });
    }

    const districts = JSON.parse(objectBody);

    if (districts?.length) {
      return NextResponse.json({
        message: "Districts fetched successfully",
        result: districts,
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
