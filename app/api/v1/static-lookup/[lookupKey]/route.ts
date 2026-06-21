import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/api/lib/with-auth";
import { getLookupObjectKey, getObjectFromS3 } from "@/lib/storage";

export const GET = withAuth(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ lookupKey: string }> },
  ) => {
    try {
      const { lookupKey } = await params;
      const { bucket, key } = getLookupObjectKey(`${lookupKey}.json`);
      const objectBody = await getObjectFromS3(bucket, key);

      if (!objectBody) {
        return NextResponse.json(
          { error: "Lookup data not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(JSON.parse(objectBody));
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
