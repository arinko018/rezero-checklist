const Jimp = require('jimp');

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = parseInt(q.pct   || '0', 10);
  const done  = q.done  || '0';
  const total = q.total || '0';

  const W = 1200, H = 630;

  // ── ベース画像作成（ピンク→ラベンダーグラデーション） ──
  const image = new Jimp(W, H);

  image.scan(0, 0, W, H, (x, y, idx) => {
    const t = x / W;
    image.bitmap.data[idx]   = Math.round(252 - t * 44);
    image.bitmap.data[idx+1] = Math.round(228 - t * 43);
    image.bitmap.data[idx+2] = Math.round(236 + t * 14);
    image.bitmap.data[idx+3] = 255;
  });

  // ── ボケ装飾円 ──
  const drawCircle = (cx, cy, r, cr, cg, cb) => {
    image.scan(
      Math.max(0, cx-r), Math.max(0, cy-r),
      Math.min(W, cx+r) - Math.max(0, cx-r),
      Math.min(H, cy+r) - Math.max(0, cy-r),
      (x, y, idx) => {
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        if (dist < r) {
          const a = 0.5 * (1 - dist/r);
          image.bitmap.data[idx]   = Math.min(255, Math.round(image.bitmap.data[idx]   * (1-a) + cr * a));
          image.bitmap.data[idx+1] = Math.min(255, Math.round(image.bitmap.data[idx+1] * (1-a) + cg * a));
          image.bitmap.data[idx+2] = Math.min(255, Math.round(image.bitmap.data[idx+2] * (1-a) + cb * a));
        }
      }
    );
  };
  drawCircle(100,  80, 200, 255, 182, 193);
  drawCircle(1100, 550, 180, 206, 147, 216);
  drawCircle(1000,  70, 150, 255, 204, 224);

  // ── 白いカード ──
  image.scan(40, 30, 1120, 570, (x, y, idx) => {
    const a = 0.86;
    image.bitmap.data[idx]   = Math.min(255, Math.round(image.bitmap.data[idx]   * (1-a) + 255 * a));
    image.bitmap.data[idx+1] = Math.min(255, Math.round(image.bitmap.data[idx+1] * (1-a) + 255 * a));
    image.bitmap.data[idx+2] = Math.min(255, Math.round(image.bitmap.data[idx+2] * (1-a) + 255 * a));
  });

  // ── ゴールド区切り線 ──
  const drawLine = (y1) => {
    image.scan(80, y1, 1040, 2, (x, y, idx) => {
      image.bitmap.data[idx]   = 218;
      image.bitmap.data[idx+1] = 165;
      image.bitmap.data[idx+2] = 32;
      image.bitmap.data[idx+3] = 200;
    });
  };
  drawLine(172);
  drawLine(460);

  // ── 進捗バー ──
  image.scan(120, 490, 960, 26, (x, y, idx) => {
    image.bitmap.data[idx] = 220; image.bitmap.data[idx+1] = 190; image.bitmap.data[idx+2] = 240;
  });
  const fillW = Math.round(960 * pct / 100);
  if (fillW > 0) {
    image.scan(120, 490, fillW, 26, (x, y, idx) => {
      const t = (x - 120) / 960;
      image.bitmap.data[idx]   = Math.round(208 - t * 80);
      image.bitmap.data[idx+1] = Math.round(48  + t * 10);
      image.bitmap.data[idx+2] = Math.round(176 - t * 50);
    });
  }

  // ── フォント読み込み（jimp内蔵ビットマップフォント） ──
  const [f64, f32, f16] = await Promise.all([
    Jimp.loadFont(Jimp.FONT_SANS_64_BLACK),
    Jimp.loadFont(Jimp.FONT_SANS_32_BLACK),
    Jimp.loadFont(Jimp.FONT_SANS_16_BLACK),
  ]);

  const center = (font, y, text) =>
    image.print(font, 0, y, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, W);

  // タイトル
  await center(f32,  70, 'Re:ZERO  Starting Life in Another World');
  await center(f16, 118, 'Read / Watch Checklist');
  // ラベル
  await center(f32, 185, 'Completion Rate');
  // 大きな%
  await center(f64, 270, pct + '%');
  // 達成数
  await center(f32, 385, done + ' / ' + total + ' items');
  // URL
  await center(f16, 540, 'rezero-checklist.netlify.app');

  const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
