const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const https = require('https');

// DejaVu Sansフォントをダウンロードしてキャッシュ
const FONT_PATH = '/tmp/DejaVuSans-Bold.ttf';
const FONT_URL  = 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf';

async function ensureFont() {
  if (fs.existsSync(FONT_PATH)) return;
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(FONT_PATH);
    https.get(FONT_URL, res => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';
  const lang  = q.lang  || 'ja';
  const isEn  = lang === 'en';

  await ensureFont();

  const label = 'Completion Rate';
  const items = `${done} / ${total} items`;
  const title2 = 'Read / Watch Checklist';

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fce4ec"/>
      <stop offset="40%" stop-color="#f3e5f5"/>
      <stop offset="70%" stop-color="#ede7f6"/>
      <stop offset="100%" stop-color="#e8eaf6"/>
    </linearGradient>
    <linearGradient id="pctg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d060a0"/>
      <stop offset="50%" stop-color="#9c27b0"/>
      <stop offset="100%" stop-color="#6030b0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="120" cy="-40" r="200" fill="rgba(255,182,193,0.4)" opacity="0.6"/>
  <circle cx="1080" cy="670" r="180" fill="rgba(206,147,216,0.4)" opacity="0.6"/>
  <circle cx="980" cy="80" r="160" fill="rgba(255,204,224,0.45)" opacity="0.6"/>
  <circle cx="200" cy="520" r="150" fill="rgba(199,179,234,0.4)" opacity="0.6"/>
  <rect x="140" y="65" width="920" height="500" rx="32"
        fill="rgba(255,255,255,0.82)" stroke="rgba(200,160,240,0.55)" stroke-width="2"/>
  <text x="600" y="158" text-anchor="middle"
        font-family="DejaVu Sans" font-size="44" font-weight="bold" fill="#9c27b0">Re:ZERO</text>
  <text x="600" y="200" text-anchor="middle"
        font-family="DejaVu Sans" font-size="24" fill="#b039c8">Starting Life in Another World</text>
  <text x="600" y="234" text-anchor="middle"
        font-family="DejaVu Sans" font-size="20" font-weight="bold" fill="#9c27b0">${title2}</text>
  <line x1="210" y1="258" x2="990" y2="258" stroke="rgba(218,165,32,0.65)" stroke-width="1.5"/>
  <text x="600" y="293" text-anchor="middle"
        font-family="DejaVu Sans" font-size="22" fill="#9c3fb0">${label}</text>
  <text x="600" y="415" text-anchor="middle"
        font-family="DejaVu Sans" font-size="110" font-weight="bold"
        fill="url(#pctg)">${pct}%</text>
  <text x="600" y="468" text-anchor="middle"
        font-family="DejaVu Sans" font-size="24" fill="#9040b8">* ${items} *</text>
  <text x="95" y="88"  font-size="30" fill="rgba(255,255,255,0.9)" text-anchor="middle">*</text>
  <text x="1108" y="108" font-size="24" fill="rgba(255,255,255,0.9)" text-anchor="middle">*</text>
  <text x="62" y="395" font-size="20" fill="rgba(255,255,255,0.85)" text-anchor="middle">*</text>
  <text x="1138" y="425" font-size="22" fill="rgba(255,255,255,0.9)" text-anchor="middle">*</text>
</svg>`;

  try {
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontFiles: [FONT_PATH],
        loadSystemFonts: false,
        defaultFontFamily: 'DejaVu Sans',
      },
    });
    const pngData = resvg.render().asPng();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
      body: Buffer.from(pngData).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};
