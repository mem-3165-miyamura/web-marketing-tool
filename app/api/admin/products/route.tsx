import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json({ error: "商品取得失敗" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price, imageUrl, category, stock } = body;

    // 必須項目のチェック
    if (!name || !price || !category) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        imageUrl: imageUrl || "",
        category,
        stock: Number(stock) || 0,
        userId: session.user.id, // ログインしているユーザーのIDを保存
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("POST Product Error:", error);
    return NextResponse.json({ error: "商品登録失敗" }, { status: 500 });
  }
}