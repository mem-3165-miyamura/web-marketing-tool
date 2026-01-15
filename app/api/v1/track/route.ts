import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { calculateNewStatus } from "@/lib/services/evaluator";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// メール送信とログ記録を共通化
async function executeMailSend(visitor: any, config: any, adminId: string, popUpId: string) {
  try {
    console.log(`✅ Attempting to send mail: [${config.name}] to ${visitor.email}`);
    const result = await sendMail({
      to: visitor.email,
      subject: config.subject,
      templateType: config.templateType,
      params: { 
        name: visitor.name || "お客様", 
        content: config.content,
        imageUrl: config.imageUrl 
      },
    });

    if (result) {
      console.log("🚀 Mail dispatched successfully.");
      await prisma.trackingLog.create({
        data: {
          userId: adminId,
          visitorId: visitor.id,
          eventType: "mail_sent",
          metadata: { mailConfigId: config.id, subject: config.subject },
          popUpId: popUpId,
        },
      });
      return true;
    }
  } catch (e) {
    console.error("❌ Mail Send Error:", e);
  }
  return false;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { popUpId, event, vid, email, metadata, pageUrl, userId: adminUserId, pattern } = body;
    const currentVid = vid || "unknown";
    
    // システムイベント（identify等）を除いた、純粋なポップアップIDを特定
    const isRealPopUp = popUpId && popUpId !== "system_identify" && !popUpId.startsWith("system_");
    const targetId = popUpId || null;

    console.log("--- 🕵️ MA Tracking & Delivery Diagnostic ---");
    console.log(`Event: [${event}], Email: [${email}], User: [${adminUserId}], PopUp: [${targetId}]`);
    
    // 1. 行動ログを保存
    const newLog = await prisma.trackingLog.create({
      data: {
        userId: adminUserId || "system",
        eventType: event,
        popUpId: targetId,
        pattern: pattern || "A",
        metadata: metadata || {},
        pageUrl: pageUrl || null,
      },
    });

    // ★追加: PopUpConfig側のカウンター（views/clicks）をインクリメント
    if (isRealPopUp && (event === "view" || event === "click")) {
      try {
        await prisma.popUpConfig.update({
          where: { id: popUpId },
          data: {
            [event === "view" ? "views" : "clicks"]: { increment: 1 },
          },
        });
        console.log(`📈 Incremented ${event} for PopUp: ${popUpId}`);
      } catch (updateError) {
        // IDが存在しない等のエラーをハンドリング
        console.error("⚠️ Failed to increment PopUp counter:", updateError);
      }
    }

    let targetVisitor = null;
    let isStatusChanged = false;

    if (email) {
      // 2. 名寄せ
      targetVisitor = await prisma.visitor.upsert({
        where: { email },
        update: { lastVid: currentVid },
        create: { 
          email, 
          lastVid: currentVid, 
          status: "LEAD", 
          name: metadata?.name || null,
          userId: adminUserId, 
        },
      });
      
      // ログの紐付け
      await prisma.trackingLog.updateMany({
        where: { 
          visitorId: null,
          OR: [
            { id: newLog.id },
            { metadata: { path: ["vid"], equals: currentVid } }
          ]
        },
        data: { visitorId: targetVisitor.id },
      });

      // 3. リアルタイム・ステータス再判定
      const [allLogs, adminUser] = await Promise.all([
        prisma.trackingLog.findMany({ where: { visitorId: targetVisitor.id } }),
        prisma.user.findUnique({ 
          where: { id: adminUserId }, 
          select: { statusRules: true } 
        })
      ]);

      const nextStatus = calculateNewStatus(allLogs, adminUser?.statusRules);

      if (targetVisitor.status !== nextStatus) {
        const oldStatus = targetVisitor.status;
        targetVisitor = await prisma.visitor.update({
          where: { id: targetVisitor.id },
          data: { status: nextStatus },
        });
        console.log(`✨ Status Promoted: ${oldStatus} -> ${nextStatus}`);
        isStatusChanged = true;
      }
    }

    if (!targetVisitor) {
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // 4. メール配信ロジックの照合
    const activeMailConfig = await prisma.mailConfig.findFirst({
      where: { 
        targetStatus: targetVisitor.status as any, 
        triggerEvent: event, 
        enabled: true,
        userId: adminUserId 
      },
    });

    if (activeMailConfig) {
      console.log(`🎯 Match Found: [${activeMailConfig.name}] for Status [${targetVisitor.status}]`);
      await executeMailSend(targetVisitor, activeMailConfig, adminUserId, targetId || "system");
    }

    return NextResponse.json({ 
      success: true, 
      status: targetVisitor.status,
      promoted: isStatusChanged 
    }, { headers: corsHeaders });

  } catch (error) {
    console.error("❌ Critical API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}