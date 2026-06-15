import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client } from "@/app/api/config/s3";
import { config } from "@/app/api/config";

const S3_URL_PATTERN =
  /^https?:\/\/(?:([^.]+)\.s3(?:[.-][\w-]+)?\.amazonaws\.com\/(.+)|s3(?:[.-][\w-]+)?\.amazonaws\.com\/([^/]+)\/(.+))$/;

export function getS3Bucket(): string {
  return config.s3.bucket;
}

export function parseStoragePath(pathOrUrl: string): {
  bucket: string;
  key: string;
} {
  const bucket = getS3Bucket();
  const s3Match = pathOrUrl.match(S3_URL_PATTERN);

  if (s3Match) {
    const urlBucket = s3Match[1] || s3Match[3]!;
    const key = decodeURIComponent(s3Match[2] || s3Match[4]!);

    if (urlBucket !== bucket) {
      throw new Error(`Object is not in configured S3 bucket: ${bucket}`);
    }

    return { bucket, key };
  }

  if (!pathOrUrl.includes("/")) {
    throw new Error("Invalid storage path format");
  }

  return { bucket, key: pathOrUrl };
}

export function buildObjectKey(
  prefix: string,
  dirname: string,
  filename: string
): string {
  return `${prefix}/${dirname}/${filename}`;
}

export function buildObjectUrl(key: string): string {
  const region = config.aws.region;
  return `https://${getS3Bucket()}.s3.${region}.amazonaws.com/${key}`;
}

export async function createPresignedGetUrl(
  bucket: string,
  key: string,
  expiresIn: number
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function uploadToS3(
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getObjectFromS3(
  bucket: string,
  key: string
): Promise<string> {
  const response = await getS3Client().send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );

  return (await response.Body?.transformToString()) ?? "";
}

export function getLookupObjectKey(filename: string): {
  bucket: string;
  key: string;
} {
  return {
    bucket: getS3Bucket(),
    key: `${config.s3.lookupPrefix}/${filename}`,
  };
}
