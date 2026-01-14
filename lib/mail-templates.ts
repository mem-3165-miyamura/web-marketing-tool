type MailParams = {
  name: string;
  content: string;
  imageUrl?: string | null;
};

export const B2BTemplate = (params: MailParams) => `
  <div style="font-family: sans-serif; padding: 20px; color: #333; line-height: 1.6;">
    <h3 style="color: #2563eb;">${params.name} 様</h3>
    <div style="background: #f9fafb; padding: 15px; border-radius: 5px;">
      ${params.content.replace(/\n/g, '<br>')}
    </div>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
    <p style="font-size: 12px; color: #999;">Marketing Tool Automator</p>
  </div>
`;

export const ECTemplate = (params: MailParams) => `
  <div style="font-family: sans-serif; text-align: center; padding: 30px; background-color: #f3f4f6;">
    <div style="background-color: #fff; padding: 30px; border-radius: 15px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
      <h2 style="color: #db2777;">Special For You</h2>
      ${params.imageUrl ? `<img src="${params.imageUrl}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;" />` : ''}
      <p>こんにちは、<strong>${params.name}</strong> さん</p>
      <div style="text-align: left; margin: 20px 0; color: #4b5563;">
        ${params.content.replace(/\n/g, '<br>')}
      </div>
      <a href="#" style="display: inline-block; background-color: #db2777; color: #fff; padding: 12px 35px; text-decoration: none; border-radius: 50px; font-weight: bold;">詳細を見る</a>
    </div>
  </div>
`;

export function renderMailHtml(type: string, params: MailParams) {
  return type === "EC" ? ECTemplate(params) : B2BTemplate(params);
}