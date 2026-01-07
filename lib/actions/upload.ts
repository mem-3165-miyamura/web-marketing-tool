// lib/actions/upload.ts
"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@lib/s3";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid"; // npm install uuid を推奨（またはタイムスタンプで代用）

/**
 * 画像をストレージにアップロードする共通関数
 * 内部でWebP変換と軽量化を行い、保存先のURLを返します。
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    // 1. FileオブジェクトをBufferに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. sharpを使用して画像を最適化
    // - WebP形式に変換
    // - 画質を80%に設定（軽量化と見た目のバランス）
    // - 横幅を最大1200pxに制限（アスペクト比維持、拡大はしない）
    const webpBuffer = await sharp(buffer)
      .webp({ quality: 80 })
      .resize(1200, null, {
        withoutEnlargement: true,
        fit: "inside",
      })
      .toBuffer();

    // 3. 一意のファイル名を生成（タイムスタンプ + ランダム文字列）
    const fileExtension = "webp";
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const fileName = `${Date.now()}-${uniqueId}.${fileExtension}`;

    const bucketName = process.env.MINIO_BUCKET_NAME || "popups";

    // 4. S3互換ストレージ（現在はMinIO）へアップロード
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: webpBuffer,
      ContentType: "image/webp",
      // 必要に応じて CacheControl などを設定可能
      CacheControl: "max-age=31536000",
    });

    await s3Client.send(command);

    // 5. 公開URLを生成して返す
    // NEXT_PUBLIC_IMAGE_DOMAIN は http://localhost:9000/popups などを想定
    const baseUrl = process.env.NEXT_PUBLIC_IMAGE_DOMAIN?.replace(/\/$/, "");
    return `${baseUrl}/${fileName}`;
    
  } catch (error) {
    console.error("Image Upload Error:", error);
    throw new Error("画像のアップロード中にエラーが発生しました。");
  }
}

export async function uploadImageToMinIO(file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // ファイル名をユニークにする（例: uuid-filename.webp）
    const fileName = `${Date.now()}-${file.name}`; 
    const bucketName = process.env.MINIO_BUCKET_NAME || "popups";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // 保存した画像のURLを返す
    // http://localhost:9000/popups/filename.jpg
    return `${process.env.NEXT_PUBLIC_IMAGE_DOMAIN}/${fileName}`;
  } catch (error) {
    console.error("Upload Error:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
}