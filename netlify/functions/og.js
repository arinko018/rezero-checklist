const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');

const FONT_PATH = '/tmp/DejaVuSans-Bold.ttf';
// jsDelivr CDN (redirectなしで直接ダウンロード可能)
const FONT_URL  = 'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts/ttf/DejaVuSans-Bold.ttf';

async function ensureFont() {
  if (fs.existsSync(FONT_PATH) && fs.statSync(FONT_PATH).size > 10000) return;
  // Node.js 18+ の native fetch を使用
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`Font download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(FONT_PATH, buf);
}

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';

  try {
    await ensureFont();
  } catch (fontErr) {
    // フォントDL失敗しても続行（文字なしでも画像は出る）
    console.error('Font error:', fontErr.message);
  }

  // 余白を詰めたコンパクトなデザイン
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fce4ec"/>
      <stop offset="50%" stop-color="#f3e5f5"/>
      <stop offset="100%" stop-color="#e8eaf6"/>
    </linearGradient>
    <linearGradient id="pg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d060a0"/>
      <stop offset="100%" stop-color="#7030b0"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- ボケ装飾 -->
  <circle cx="80" cy="60" r="160" fill="rgba(255,182,193,0.45)" opacity="0.7"/>
  <circle cx="1120" cy="570" r="150" fill="rgba(206,147,216,0.45)" opacity="0.7"/>
  <circle cx="1050" cy="80" r="120" fill="rgba(255,204,224,0.5)" opacity="0.6"/>

  <!-- カード（余白なし・フル幅に近い） -->
  <rect x="40" y="30" width="1120" height="570" rx="28"
        fill="rgba(255,255,255,0.85)" stroke="rgba(200,160,240,0.6)" stroke-width="2"/>

  <!-- タイトル行 -->
  <text x="600" y="105" text-anchor="middle"
        font-family="DejaVu Sans" font-size="42" font-weight="bold" fill="#9c27b0">Re:ZERO - Starting Life in Another World</text>
  <text x="600" y="148" text-anchor="middle"
        font-family="DejaVu Sans" font-size="26" fill="#b039c8">Read / Watch Checklist</text>

  <!-- 区切り線 -->
  <line x1="80" y1="168" x2="1120" y2="168" stroke="rgba(218,165,32,0.7)" stroke-width="2"/>

  <!-- ラベル -->
  <text x="600" y="215" text-anchor="middle"
        font-family="DejaVu Sans" font-size="28" fill="#9c3fb0">Completion Rate</text>

  <!-- 大きな % -->
  <text x="600" y="380" text-anchor="middle"
        font-family="DejaVu Sans" font-size="180" font-weight="bold"
        fill="url(#pg)">${pct}%</text>

  <!-- 達成数 -->
  <text x="600" y="445" text-anchor="middle"
        font-family="DejaVu Sans" font-size="30" fill="#8040b8">* ${done} / ${total} items *</text>

  <!-- 区切り線 -->
  <line x1="80" y1="468" x2="1120" y2="468" stroke="rgba(218,165,32,0.5)" stroke-width="1.5"/>

  <!-- 下部サイト名 -->
  <text x="600" y="510" text-anchor="middle"
        font-family="DejaVu Sans" font-size="22" fill="rgba(120,60,180,0.7)">rezero-checklist.netlify.app</text>

  <!-- キラキラ -->
  <text x="90" y="65" font-size="28" fill="rgba(255,255,255,0.9)" text-anchor="middle">*</text>
  <text x="1110" y="80" font-size="22" fill="rgba(255,255,255,0.9)" text-anchor="middle">*</text>
  <text x="60" y="420" font-size="18" fill="rgba(255,255,255,0.8)" text-anchor="middle">*</text>
  <text x="1140" y="440" font-size="20" fill="rgba(255,255,255,0.85)" text-anchor="middle">*</text>
</svg>`;

  try {
    const fontOptions = fs.existsSync(FONT_PATH)
      ? { fontFiles: [FONT_PATH], loadSystemFonts: false, defaultFontFamily: 'DejaVu Sans' }
      : { loadSystemFonts: true };

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: fontOptions,
    });
    const pngData = resvg.render().asPng();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' },
      body: Buffer.from(pngData).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};
