import axios from "axios";
import { NextResponse } from "next/server";
import { withAuth } from "@/app/api/lib/with-auth";
import { config } from "@/app/api/config";

export const GET = withAuth(async () => {
  try {
    const url = `${config.supabase.url}/storage/v1/object/${config.supabase.lookupBucket}/districts.json`;

    const districts = await axios({ url, method: "GET" });

    if (districts.data?.length) {
      return NextResponse.json({
        message: "Districts fetched successfully",
        result: districts.data,
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
