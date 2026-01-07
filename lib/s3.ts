// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY || !process.env.MINIO_SECRET_KEY) {
  throw new Error("MinIOの環境変数が設定されていません");
}

export const s3Client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT, // http://localhost:9000
  region: "us-east-1", // MinIOでは任意の値でOK
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: true, // MinIOを使用する場合は必須
});