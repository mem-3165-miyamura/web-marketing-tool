import { NextResponse } from 'next/server';
import { prisma } from "@lib/prisma";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as parquet from 'parquetjs-lite'; // 型定義と合わせて変数名を修正
import fs from 'fs';
import path from 'path';

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "miniopassword",
  },
  forcePathStyle: true,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oldestLog = await prisma.trackingLog.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!oldestLog) return NextResponse.json({ message: "No data in DB" });

    let cursorDate = new Date(oldestLog.createdAt);
    cursorDate.setHours(0, 0, 0, 0);

    const report = { archived: [] as string[], deleted: [] as string[], errors: [] as string[] };

    // --- メインループ：最古から昨日までを1日ずつ精査 ---
    while (cursorDate < today) {
      const dateStr = cursorDate.toISOString().split('T')[0];
      const fileName = `logs_${dateStr}.parquet`;
      const start = new Date(cursorDate);
      const end = new Date(cursorDate);
      end.setHours(23, 59, 59, 999);

      // 1. S3にファイルが存在するか確認
      let s3Exists = false;
      try {
        await s3.send(new HeadObjectCommand({ Bucket: "tracking-logs", Key: fileName }));
        s3Exists = true;
      } catch (e) {
        s3Exists = false;
      }

      // 2. DBにその日のデータが存在するか確認
      const dbCount = await prisma.trackingLog.count({
        where: { createdAt: { gte: start, lte: end } }
      });

      // --- アーカイブ（救出）ロジック ---
      // S3にないがDBにはある場合、ファイルを生成してアップロード（例2, 例3のリカバリ）
      if (!s3Exists && dbCount > 0) {
        const logs = await prisma.trackingLog.findMany({ where: { createdAt: { gte: start, lte: end } } });
        const filePath = path.join('/tmp', fileName);
        
        try {
          const schema = new parquet.ParquetSchema({
            id: { type: 'UTF8' },
            popUpId: { type: 'UTF8' },
            pattern: { type: 'UTF8' },
            eventType: { type: 'UTF8' },
            createdAt: { type: 'TIMESTAMP_MILLIS' },
          });

          const writer = await parquet.ParquetWriter.openFile(schema, filePath);
          for (const log of logs) {
            await writer.appendRow({
              id: log.id,
              popUpId: log.popUpId,
              pattern: log.pattern,
              eventType: log.eventType,
              createdAt: log.createdAt.getTime(),
            });
          }
          await writer.close();

          const fileStream = fs.createReadStream(filePath);
          await s3.send(new PutObjectCommand({ 
            Bucket: "tracking-logs", 
            Key: fileName, 
            Body: fileStream 
          }));
          
          fs.unlinkSync(filePath); // 一時ファイルを削除
          s3Exists = true; // 次の削除判定のために存在フラグを立てる
          report.archived.push(dateStr);
        } catch (err: any) {
          report.errors.push(`${dateStr}: Archive failed - ${err.message}`);
        }
      }

      // --- クリーンアップ（削除）ロジック ---
      // 基準日：今日から7日以上前
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // S3に保存済み、かつ7日以上前のデータであればDBから削除（例2, 例3の完了分）
      // 7日以内であれば、S3にあってもDBに残す（例1の仕様）
      if (s3Exists && cursorDate < sevenDaysAgo) {
        if (dbCount > 0) {
          await prisma.trackingLog.deleteMany({ where: { createdAt: { gte: start, lte: end } } });
          report.deleted.push(dateStr);
        }
      }

      // 次の日へ移動
      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    return NextResponse.json(report);

  } catch (error: any) {
    console.error("Archive System Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}