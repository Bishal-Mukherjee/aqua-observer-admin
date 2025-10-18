import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { redisClient } from "@/app/api/config/redis";
import { withAuth } from "@/app/api/lib/with-auth";

const SIGNED_URL_EXPIRY_SECONDS = 3 * 24 * 60 * 60; // 3 days

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { error: "Missing 'path' query parameter" },
        { status: 400 }
      );
    }

    const [bucketName, ...restPath] = path.split("/");

    if (!bucketName || restPath.length === 0) {
      return NextResponse.json(
        { error: "Invalid 'path' format" },
        { status: 400 }
      );
    }

    const cacheKey = `image-url:${path}`;

    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      return NextResponse.json({ imageUrl: cachedUrl });
    }

    const { data, error: supabaseError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(restPath.join("/"), SIGNED_URL_EXPIRY_SECONDS);

    if (!data?.signedUrl || supabaseError) {
      throw new Error(supabaseError?.message || "No signed URL returned");
    }

    await redisClient.set(
      cacheKey,
      data.signedUrl,
      "EX",
      SIGNED_URL_EXPIRY_SECONDS
    );

    return NextResponse.json({ imageUrl: data.signedUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
