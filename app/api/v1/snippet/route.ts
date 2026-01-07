import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) return new NextResponse('// Missing uid', { headers: { 'Content-Type': 'application/javascript' } });

  const snippet = `
(function() {
  const UID = "${uid}";
  const API_BASE = "http://localhost:3000/api/v1";
  let vid = localStorage.getItem('v_id') || 'v_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('v_id', vid);

  const trackEvent = async (popUpId, eventType, pattern) => {
    try {
      await fetch(API_BASE + "/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ popUpId, event: eventType, vid, pattern }),
      });
    } catch (err) { console.error("Track failed", err); }
  };

  const init = async () => {
    try {
      const response = await fetch(API_BASE + "/popups/" + UID + "?vid=" + vid);
      let configs = await response.json();
      if (!configs) return;
      if (!Array.isArray(configs)) configs = [configs];

      configs.forEach(config => {
        // --- ABテスト振り分けロジック ---
        // vidの文字列を数値化してAかBを決定
        const hash = vid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isPatternB = !!config.titleB && (hash % 2 === 1); 
        const pattern = isPatternB ? "B" : "A";

        const data = {
          title: isPatternB ? config.titleB : config.title,
          desc: isPatternB ? (config.descriptionB || config.description) : config.description,
          img: isPatternB ? (config.imageUrlB || config.imageUrl) : config.imageUrl,
          btn: isPatternB ? (config.buttonTextB || config.buttonText) : config.buttonText
        };

        setTimeout(() => {
          const div = document.createElement('div');
          div.style.cssText = 'position:fixed;bottom:20px;right:20px;width:300px;padding:20px;background:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.2);border-radius:12px;z-index:999999;';
          div.innerHTML = (data.img ? '<img src="'+data.img+'" style="width:100%;border-radius:8px;margin-bottom:12px;">' : '') +
                          '<h3>'+data.title+'</h3><p>'+data.desc+'</p>' +
                          '<button id="btn-'+config.id+'" style="width:100%;padding:10px;background:#0070f3;color:#fff;border:none;border-radius:6px;cursor:pointer;">'+data.btn+'</button>';
          document.body.appendChild(div);

          trackEvent(config.id, "view", pattern);

          document.getElementById('btn-'+config.id).onclick = () => {
            trackEvent(config.id, "click", pattern);
            if (config.buttonLink) window.open(config.buttonLink, '_blank');
          };
        }, config.displayDelay || 0);
      });
    } catch (err) { console.error("Init failed", err); }
  };
  init();
})();
  `;

  return new NextResponse(snippet, { headers: { 'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*' } });
}