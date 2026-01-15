import nodemailer from "nodemailer";
import { renderMailHtml } from "./mail-templates";

export async function sendMail({ to, subject, templateType, params }: any) {
  // 環境変数から設定を取得、未設定時のデフォルト値を指定
  const host = process.env.SMTP_HOST || "localhost";
  const port = Number(process.env.SMTP_PORT) || 1025;

  // 送信のたびにトランスポート設定を初期化
  const transporter = nodemailer.createTransport({
    host: host, 
    port: port,
    secure: false,
    // 接続のデバッグを有効化
    debug: true, 
    logger: true,
  });

  const html = renderMailHtml(templateType, params);
  
  console.log(`--- [lib/mail.ts] Attempting to send to: ${to} via ${host}:${port} ---`);

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