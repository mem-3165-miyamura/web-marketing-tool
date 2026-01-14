import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> } // 1. paramsをPromiseに変更し、名前をuserIdに。
): Promise<NextResponse> { // 2. 戻り値の型を明示
  try {
    // 3. awaitでparamsを展開
    const { userId } = await params;

    // ユーザーIDに紐づく、配信中(enabled)のポップアップを全取得
    const popups = await prisma.popUpConfig.findMany({
      where: {
        userId: userId,
        enabled: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!popups || popups.length === 0) {
      return NextResponse.json([], {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    return NextResponse.json(popups, {
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    console.error(error); // デバッグ用にエラーを出力
    return NextResponse.json({ error: "Failed to fetch popups" }, { status: 500 });
  }
}