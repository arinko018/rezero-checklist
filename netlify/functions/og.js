const { Resvg } = require('@resvg/resvg-js');
const path = require('path');
const fs   = require('fs');

// npmパッケージ roboto-fontface に含まれるフォントファイルを使う
// Netlifyのworking directoryはリポジトリルート(/var/task)
function findFont() {
  const candidates = [
    // Netlify Lambda上のパス
    path.join(process.cwd(), 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Bold.ttf'),
    path.join(process.cwd(), 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Medium.ttf'),
    path.join(process.cwd(), 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Regular.ttf'),
    // フォールバック: __dirnameからの相対パス
    path.join(__dirname, '..', '..', 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Bold.ttf'),
    // /tmpにキャッシュされたフォント
    '/tmp/font.ttf',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p) && fs.statSync(p).size > 10000) return p;
  }
  return null;
}

async function downloadFontIfNeeded() {
  let found = findFont();
  if (found) return found;

  // CDNからダウンロード
  const urls = [
    'https://cdn.jsdelivr.net/gh/dejavu-fonts/dejavu-fonts/ttf/DejaVuSans-Bold.ttf',
    'https://fonts.gstatic.com/s/roboto/v32/KFOlCnqEu92Fr1MmWUlfBBc-.woff2',
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync('/tmp/font.ttf', buf);
        console.log('Font downloaded from:', url, 'size:', buf.length);
        return '/tmp/font.ttf';
      }
    } catch(e) {
      console.error('Font download failed:', url, e.message);
    }
  }
  return null;
}

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';

  const fontPath = await downloadFontIfNeeded();
  console.log('Using font:', fontPath);

  // コンパクトデザイン（余白小さく）
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
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="80" cy="60" r="160" fill="rgba(255,182,193,0.45)" opacity="0.7"/>
  <circle cx="1120" cy="570" r="150" fill="rgba(206,147,216,0.45)" opacity="0.7"/>
  <circle cx="1050" cy="80" r="120" fill="rgba(255,204,224,0.5)" opacity="0.6"/>
  <rect x="40" y="30" width="1120" height="570" rx="28"
        fill="rgba(255,255,255,0.85)" stroke="rgba(200,160,240,0.6)" stroke-width="2"/>
  <text x="600" y="105" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="42" font-weight="bold" fill="#9c27b0">Re:ZERO - Starting Life in Another World</text>
  <text x="600" y="148" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="26" fill="#b039c8">Read / Watch Checklist</text>
  <line x1="80" y1="168" x2="1120" y2="168" stroke="rgba(218,165,32,0.7)" stroke-width="2"/>
  <text x="600" y="215" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="28" fill="#9c3fb0">Completion Rate</text>
  <text x="600" y="390" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="180" font-weight="bold"
        fill="url(#pg)">${pct}%</text>
  <text x="600" y="450" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="32" fill="#8040b8">* ${done} / ${total} items *</text>
  <line x1="80" y1="472" x2="1120" y2="472" stroke="rgba(218,165,32,0.5)" stroke-width="1.5"/>
  <text x="600" y="518" text-anchor="middle"
        font-family="Roboto,DejaVu Sans,sans-serif" font-size="22" fill="rgba(120,60,180,0.7)">rezero-checklist.netlify.app</text>
</svg>`;

  try {
    const fontOpts = fontPath
      ? { fontFiles: [fontPath], loadSystemFonts: false, defaultFontFamily: 'Roboto' }
      : { loadSystemFonts: true };

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: fontOpts,
    });
    const png = resvg.render().asPng();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' },
      body: Buffer.from(png).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error('Render error:', err);
    return { statusCode: 500, body: 'Render error: ' + err.message };
  }
};
