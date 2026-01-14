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

  // --- 共通イベント送信 ---
  const trackEvent = async (popUpId, eventType, pattern, extra = {}) => {
    try {
      await fetch(API_BASE + "/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({ 
          popUpId, 
          event: eventType, 
          vid, 
          pattern: pattern || "A",
          pageUrl: window.location.href,
          ...extra 
        }),
      });
    } catch (err) { console.error("Track failed", err); }
  };

  // --- 名寄せ（Identify）専用ロジック ---
  const identifyUser = (email, name = null) => {
    // ページ内の一番最初のポップアップIDを代表として使用（またはUIDそのものを活用）
    // ここでは仕組み上、UIDに紐づく最初のログとして飛ばすか、共通管理用IDを使用
    trackEvent("system_identify", "identify", "A", { 
      email: email, 
      metadata: { name: name, source: "auto_capture" } 
    });
  };

  // 1. URLパラメータからの自動名寄せ (?email=xxx)
  const urlParams = new URLSearchParams(window.location.search);
  const emailFromUrl = urlParams.get('email');
  if (emailFromUrl && emailFromUrl.includes('@')) {
    identifyUser(emailFromUrl);
  }

  // 2. ページ内のフォーム送信を監視して自動名寄せ
  window.addEventListener('submit', function(e) {
    const emailInput = e.target.querySelector('input[type="email"], input[name*="email"]');
    if (emailInput && emailInput.value) {
      // 名前入力フィールドがあればついでに拾う
      const nameInput = e.target.querySelector('input[name*="name"], input[id*="name"]');
      identifyUser(emailInput.value, nameInput ? nameInput.value : null);
    }
  }, true);

  const init = async () => {
    try {
      const response = await fetch(API_BASE + "/popups/" + UID + "?vid=" + vid);
      let configs = await response.json();
      if (!configs || (Array.isArray(configs) && configs.length === 0)) return;
      if (!Array.isArray(configs)) configs = [configs];

      configs.forEach(config => {
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
          div.id = 'ma-popup-' + config.id;
          div.style.cssText = 'position:fixed;bottom:20px;right:20px;width:300px;padding:20px;background:#fff;box-shadow:0 10px 25px rgba(0,0,0,0.2);border-radius:12px;z-index:999999;font-family:sans-serif;';
          div.innerHTML = (data.img ? '<img src="'+data.img+'" style="width:100%;border-radius:8px;margin-bottom:12px;">' : '') +
                          '<h3 style="margin:0 0 8px;font-size:18px;">'+data.title+'</h3>' +
                          '<p style="margin:0 0 16px;font-size:14px;color:#666;">'+data.desc+'</p>' +
                          '<button id="btn-'+config.id+'" style="width:100%;padding:12px;background:#0070f3;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">'+data.btn+'</button>';
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