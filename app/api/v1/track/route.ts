//app/api/v1/track/route.ts
import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function POST(request: Request) {
  try {
    const { popUpId, event, vid, pattern } = await request.json();

    // IDが空の場合はエラーを返してクラッシュを防ぐ
    if (!popUpId) {
      console.error("Tracking Error: popUpId is missing in request body");
      return NextResponse.json({ error: "popUpId is required" }, { status: 400, headers: corsHeaders });
    }

    // 1. ログの保存 (リレーションを明示)
    await prisma.trackingLog.create({
      data: {
        popUpConfig: {
          connect: { id: popUpId } // popIdを直接入れるより安全な書き方
        },
        userId: vid || "unknown",
        eventType: event,
        pattern: pattern || "A",
        siteId: "main-site",
      },
    });

    // 2. 全体カウンターの更新 (既存機能の維持)
    if (event === "view") {
      await prisma.popUpConfig.update({
        where: { id: popUpId },
        data: { views: { increment: 1 } },
      });
    } else if (event === "click") {
      await prisma.popUpConfig.update({
        where: { id: popUpId },
        data: { clicks: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("Tracking API Error Details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}