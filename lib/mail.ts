import nodemailer from "nodemailer";
import { renderMailHtml } from "./mail-templates";

export async function sendMail({ to, subject, templateType, params }: any) {
  // 送信のたびにトランスポート設定を初期化（確実に接続するため）
  const transporter = nodemailer.createTransport({
    host: "127.0.0.1", // localhostの代わりにIPを指定
    port: 1025,
    secure: false,
    // 接続のデバッグを有効化
    debug: true, 
    logger: true,
  });

  const html = renderMailHtml(templateType, params);
  
  console.log(`--- [lib/mail.ts] Attempting to send to: ${to} ---`);

  try {
    const info = await transporter.sendMail({
      from: '"MA System" <noreply@example.com>',
      to,
      subject,
      html,
    });
    
    console.log(`--- [lib/mail.ts] Send Success! MessageId: ${info.messageId} ---`);
    return info;
  } catch (error) {
    console.error("--- [lib/mail.ts] Send Failed Error: ---", error);
    throw error;
  }
}