import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as parquet from 'parquetjs-lite';
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

    // 一時ディレクトリの確保（ローカル環境対策）
    const tmpDir = './tmp';
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    while (cursorDate < today) {
      const dateStr = cursorDate.toISOString().split('T')[0];
      const fileName = `logs_${dateStr}.parquet`;
      const start = new Date(cursorDate);
      const end = new Date(cursorDate);
      end.setHours(23, 59, 59, 999);

      let s3Exists = false;
      try {
        await s3.send(new HeadObjectCommand({ Bucket: "tracking-logs", Key: fileName }));
        s3Exists = true;
      } catch (e) {
        s3Exists = false;
      }

      const dbCount = await prisma.trackingLog.count({
        where: { createdAt: { gte: start, lte: end } }
      });

      if (!s3Exists && dbCount > 0) {
        const logs = await prisma.trackingLog.findMany({ where: { createdAt: { gte: start, lte: end } } });
        const filePath = path.join(tmpDir, fileName);
        let writer;
        
        try {
          // --- スキーマ定義：DuckDBとの互換性と構成変更への強さを両立 ---
          const schema = new parquet.ParquetSchema({
            id: { type: 'UTF8' },
            popUpId: { type: 'UTF8', optional: true },
            userId: { type: 'UTF8', optional: true },
            visitorId: { type: 'UTF8', optional: true },
            siteId: { type: 'UTF8', optional: true },
            pageUrl: { type: 'UTF8', optional: true },
            eventType: { type: 'UTF8', optional: true },
            pattern: { type: 'UTF8', optional: true },
            metadata: { type: 'UTF8', optional: true },
            createdAt: { type: 'TIMESTAMP_MILLIS' },
          });

          writer = await parquet.ParquetWriter.openFile(schema, filePath);
          for (const log of logs) {
            // undefined対策：nullまたは空文字でガード
            await writer.appendRow({
              id: String(log.id),
              popUpId: (log as any).popUpId || null,
              userId: (log as any).userId || null,
              visitorId: (log as any).visitorId || null,
              siteId: (log as any).siteId || null,
              pageUrl: (log as any).pageUrl || null,
              eventType: log.eventType || null,
              pattern: log.pattern || null,
              metadata: (log as any).metadata ? JSON.stringify((log as any).metadata) : null,
              createdAt: log.createdAt ? log.createdAt.getTime() : Date.now(),
            });
          }
          await writer.close();

          const fileBuffer = fs.readFileSync(filePath);
          await s3.send(new PutObjectCommand({ 
            Bucket: "tracking-logs", 
            Key: fileName, 
            Body: fileBuffer 
          }));
          
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          s3Exists = true;
          report.archived.push(dateStr);
        } catch (err: any) {
          if (writer) await writer.close().catch(() => {});
          // エラーメッセージの可視化（undefined回避）
          const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
          report.errors.push(`${dateStr}: Archive failed - ${errMsg}`);
        }
      }

      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      if (s3Exists && cursorDate < sevenDaysAgo) {
        if (dbCount > 0) {
          await prisma.trackingLog.deleteMany({ where: { createdAt: { gte: start, lte: end } } });
          report.deleted.push(dateStr);
        }
      }

      cursorDate.setDate(cursorDate.getDate() + 1);
    }

    return NextResponse.json(report);

  } catch (error: any) {
    console.error("Archive System Error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}