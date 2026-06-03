const satori = require('satori');
const sharp  = require('sharp');
const path   = require('path');
const fs     = require('fs');

// roboto-fontface npm パッケージから直接フォントファイルを読む
function loadFontData() {
  const candidates = [
    path.join(process.cwd(), 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Bold.ttf'),
    path.join(process.cwd(), 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Regular.ttf'),
    path.join(__dirname, '..', '..', 'node_modules', 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Bold.ttf'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log('Font found:', p);
      return fs.readFileSync(p);
    }
  }
  console.warn('Font not found in node_modules');
  return null;
}

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';

  const fontData = loadFontData();
  if (!fontData) {
    return { statusCode: 500, body: 'Font not found. Check roboto-fontface is installed.' };
  }

  // satori は React要素ツリーでSVGを生成（テキストをパスに変換するので字体サーバー不要）
  const element = {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
        fontFamily: 'Roboto',
        position: 'relative',
      },
      children: [
        // ボケ装飾
        { type: 'div', props: { style: { position: 'absolute', top: -60, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,182,193,0.5)' }, children: '' } },
        { type: 'div', props: { style: { position: 'absolute', bottom: -50, right: -30, width: 260, height: 260, borderRadius: '50%', background: 'rgba(206,147,216,0.45)' }, children: '' } },
        { type: 'div', props: { style: { position: 'absolute', top: 40, right: 60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,204,224,0.5)' }, children: '' } },
        // 白カード
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.86)',
              border: '2px solid rgba(200,160,240,0.6)',
              borderRadius: '28px',
              padding: '28px 56px 32px',
              width: '1100px',
              gap: '6px',
            },
            children: [
              { type: 'div', props: { style: { fontSize: 40, fontWeight: 700, color: '#9c27b0', textAlign: 'center' }, children: 'Re:ZERO - Starting Life in Another World' } },
              { type: 'div', props: { style: { fontSize: 24, color: '#b039c8' }, children: 'Read / Watch Checklist' } },
              // 区切り線
              { type: 'div', props: { style: { width: '100%', height: 2, background: 'rgba(218,165,32,0.6)', margin: '6px 0' }, children: '' } },
              { type: 'div', props: { style: { fontSize: 26, color: '#9c3fb0' }, children: 'Completion Rate' } },
              // 大きな%
              { type: 'div', props: { style: { fontSize: 160, fontWeight: 700, color: '#9c27b0', lineHeight: 1.05 }, children: pct + '%' } },
              { type: 'div', props: { style: { fontSize: 28, color: '#8040b8' }, children: '★ ' + done + ' / ' + total + ' items ★' } },
              // 区切り線
              { type: 'div', props: { style: { width: '100%', height: 1.5, background: 'rgba(218,165,32,0.5)', margin: '6px 0' }, children: '' } },
              { type: 'div', props: { style: { fontSize: 20, color: 'rgba(120,60,180,0.7)' }, children: 'rezero-checklist.netlify.app' } },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [{ name: 'Roboto', data: fontData, weight: 700, style: 'normal' }],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' },
    body: png.toString('base64'),
    isBase64Encoded: true,
  };
};
