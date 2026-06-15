import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/app/api/config/redis";
import { withAuth } from "@/app/api/lib/with-auth";
import {
  buildObjectKey,
  buildObjectUrl,
  createPresignedGetUrl,
  getS3Bucket,
  parseStoragePath,
  uploadToS3,
} from "@/lib/storage";

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

    const cacheKey = `image-url:${path}`;
    const cachedUrl = await redisClient.get(cacheKey);

    if (cachedUrl) {
      return NextResponse.json({ imageUrl: cachedUrl });
    }

    const { bucket, key } = parseStoragePath(path);
    const signedUrl = await createPresignedGetUrl(
      bucket,
      key,
      SIGNED_URL_EXPIRY_SECONDS
    );

    await redisClient.set(
      cacheKey,
      signedUrl,
      "EX",
      SIGNED_URL_EXPIRY_SECONDS
    );

    return NextResponse.json({ imageUrl: signedUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const prefix = formData.get("prefix");
    const dirname = formData.get("dirname");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    if (typeof prefix !== "string" || !prefix) {
      return NextResponse.json({ error: "Missing prefix" }, { status: 400 });
    }

    if (typeof dirname !== "string" || !dirname) {
      return NextResponse.json({ error: "Missing dirname" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const filename = `${Date.now()}.${fileExt}`;
    const key = buildObjectKey(prefix, dirname, filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadToS3(
      getS3Bucket(),
      key,
      buffer,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      path: key,
      publicURL: buildObjectUrl(key),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
});
