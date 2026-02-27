import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { Env } from "../config/env.js";

export class StorageService {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;

  constructor(config: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    bucket: string;
    publicUrl?: string;
  }) {
    this.client = new S3Client({
      region: "auto",
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
  }

  async uploadFile(params: {
    key: string;
    body: Buffer;
    contentType: string;
  }): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );

    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, "")}/${params.key}`;
    }

    // Default R2 URL if publicUrl is not provided
    // https://<account_id>.r2.cloudflarestorage.com/<bucket>/<key>
    // Note: This endpoint usually requires auth unless public access is configured differently.
    return `${this.bucket}/${params.key}`;
  }
}

export function createStorageService(config: Env): StorageService | null {
  if (
    !config.R2_ACCESS_KEY_ID ||
    !config.R2_SECRET_ACCESS_KEY ||
    !config.R2_ENDPOINT ||
    !config.R2_BUCKET_NAME
  ) {
    console.warn(
      "[StorageService] Missing R2 credentials. Storage service will be unavailable.",
    );
    return null;
  }

  return new StorageService({
    accessKeyId: config.R2_ACCESS_KEY_ID,
    secretAccessKey: config.R2_SECRET_ACCESS_KEY,
    endpoint: config.R2_ENDPOINT,
    bucket: config.R2_BUCKET_NAME,
    publicUrl: config.R2_PUBLIC_URL,
  });
}
