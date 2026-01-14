// lib/actions/popup.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { uploadImage } from "./upload";
import type { FormState } from "@/lib/types/popup";

/**
 * 新規ポップアップを作成するServer Action
 */
export async function createPopUp(formData: FormData) {
  const session = await auth();
  
  // セッションチェック
  if (!session?.user || !(session.user as any).id) {
    throw new Error("セッションが切れています。再度サインインしてください。");
  }
  const userId = (session.user as any).id;

  // --- フォームデータの取得 ---
  const name = formData.get("name") as string;
  
  // パターンA
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const buttonText = formData.get("buttonText") as string;
  const buttonLink = formData.get("buttonLink") as string;
  const imageFile = formData.get("imageFile") as File;

  // パターンB
  const titleB = formData.get("titleB") as string | null;
  const descriptionB = formData.get("descriptionB") as string | null;
  const buttonTextB = formData.get("buttonTextB") as string | null;
  const imageFileB = formData.get("imageFileB") as File | null;

  let imageUrl: string | null = null;
  let imageUrlB: string | null = null;

  try {
    // 画像のアップロード処理
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile);
    }
    if (imageFileB && imageFileB.size > 0) {
      imageUrlB = await uploadImage(imageFileB);
    }

    // DBへの保存
    await prisma.popUpConfig.create({
      data: {
        name,
        enabled: true,
        // パターンA
        title,
        description,
        buttonText: buttonText || "詳細を見る",
        buttonLink: buttonLink || "#",
        imageUrl,
        // パターンB
        titleB: titleB || null,
        descriptionB: descriptionB || null,
        buttonTextB: buttonTextB || null,
        imageUrlB: imageUrlB || null,
        // 初期統計値
        views: 0,
        clicks: 0,
        // ユーザー紐付け（存在しないIDエラーを防ぐ書き方）
        user: {
          connect: { id: userId }
        }
      },
    });
  } catch (error) {
    console.error("PopUp Create Error 詳細:", error);
    throw new Error("ポップアップの保存に失敗しました。サインアウトしてやり直してみてください。");
  }

  revalidatePath("/");
  redirect("/");
}

/**
 * 削除処理
 */
export async function deletePopUp(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("認証が必要です");

  await prisma.popUpConfig.delete({
    where: {
      id,
      userId: (session.user as any).id,
    },
  });

  revalidatePath("/");
}

/**
 * 更新処理 (useActionState 用)
 */
export async function updatePopUp(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    
    if (!userId) {
      return { success: false, message: "ログインが必要です" };
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    
    // パターンA
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) ?? "";
    const buttonText = (formData.get("buttonText") as string) ?? "";
    const buttonLink = (formData.get("buttonLink") as string) ?? "";
    const imageFile = formData.get("imageFile") as File | null;

    // パターンB
    const titleB = formData.get("titleB") as string | null;
    const descriptionB = formData.get("descriptionB") as string | null;
    const buttonTextB = formData.get("buttonTextB") as string | null;
    const imageFileB = formData.get("imageFileB") as File | null;

    if (!id || !name || !title) {
      return { success: false, message: "必須項目が不足しています" };
    }

    let imageUrl: string | null = null;
    let imageUrlB: string | null = null;

    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImage(imageFile);
    }
    if (imageFileB && imageFileB.size > 0) {
      imageUrlB = await uploadImage(imageFileB);
    }

    await prisma.popUpConfig.update({
      where: { 
        id,
        userId: userId // 本人確認
      },
      data: {
        name,
        title,
        description,
        buttonText,
        buttonLink,
        ...(imageUrl ? { imageUrl } : {}),
        titleB: titleB || null,
        descriptionB: descriptionB || null,
        buttonTextB: buttonTextB || null,
        ...(imageUrlB ? { imageUrlB } : {}),
      },
    });

    revalidatePath("/");
    return { success: true, message: "ポップアップを更新しました" };

  } catch (error) {
    console.error("PopUp Update Error:", error);
    return { success: false, message: "更新中にエラーが発生しました" };
  }
}