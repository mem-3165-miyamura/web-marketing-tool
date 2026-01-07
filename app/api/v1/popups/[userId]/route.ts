import { prisma } from "@lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { uid: string } }
) {
  try {
    const uid = params.uid;

    // ユーザーIDに紐づく、配信中(enabled)のポップアップを全取得
    const popups = await prisma.popUpConfig.findMany({
      where: {
        userId: uid,
        enabled: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!popups || popups.length === 0) {
      return NextResponse.json([], { // 404ではなく空配列を返すのが安全
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    return NextResponse.json(popups, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}