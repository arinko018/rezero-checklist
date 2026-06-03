// pngjs: 純粋なJavaScript、ネイティブ依存ゼロ、確実に動く
const { PNG } = require('pngjs');

exports.handler = async (event) => {
  const q   = event.queryStringParameters || {};
  const pct = parseInt(q.pct || '0', 10);

  const W = 1200, H = 630;
  const img = new PNG({ width: W, height: H });

  // 背景グラデーション（ピンク→ラベンダー）
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = x / W;
      const idx = (W * y + x) * 4;
      img.data[idx]   = Math.round(252 - t * 44);  // R
      img.data[idx+1] = Math.round(228 - t * 43);  // G
      img.data[idx+2] = Math.round(236 + t * 14);  // B
      img.data[idx+3] = 255;
    }
  }

  // ボケ装飾円（ピンク）
  const drawCircle = (cx, cy, r, cr, cg, cb, alpha) => {
    for (let y = Math.max(0, cy-r); y < Math.min(H, cy+r); y++) {
      for (let x = Math.max(0, cx-r); x < Math.min(W, cx+r); x++) {
        const dist = Math.sqrt((x-cx)**2 + (y-cy)**2);
        if (dist < r) {
          const a = alpha * (1 - dist/r);
          const idx = (W * y + x) * 4;
          img.data[idx]   = Math.min(255, img.data[idx]   * (1-a) + cr * a);
          img.data[idx+1] = Math.min(255, img.data[idx+1] * (1-a) + cg * a);
          img.data[idx+2] = Math.min(255, img.data[idx+2] * (1-a) + cb * a);
        }
      }
    }
  };
  drawCircle(100, 80, 200, 255, 182, 193, 0.5);
  drawCircle(1100, 550, 180, 206, 147, 216, 0.45);
  drawCircle(1000, 70, 150, 255, 204, 224, 0.5);

  // 白いカード
  for (let y = 30; y < 600; y++) {
    for (let x = 40; x < 1160; x++) {
      const idx = (W * y + x) * 4;
      const a = 0.86;
      img.data[idx]   = Math.round(img.data[idx]   * (1-a) + 255 * a);
      img.data[idx+1] = Math.round(img.data[idx+1] * (1-a) + 255 * a);
      img.data[idx+2] = Math.round(img.data[idx+2] * (1-a) + 255 * a);
    }
  }

  // 進捗バー（pct%分を紫で）
  const barX = 120, barY = 480, barW = 960, barH = 28;
  // バー背景（薄紫）
  for (let y = barY; y < barY+barH; y++) {
    for (let x = barX; x < barX+barW; x++) {
      const idx = (W * y + x) * 4;
      img.data[idx] = 220; img.data[idx+1] = 190; img.data[idx+2] = 240; img.data[idx+3] = 255;
    }
  }
  // バー塗り（紫グラデーション）
  const fillW = Math.round(barW * pct / 100);
  for (let y = barY; y < barY+barH; y++) {
    for (let x = barX; x < barX+fillW; x++) {
      const t = (x - barX) / barW;
      const idx = (W * y + x) * 4;
      img.data[idx]   = Math.round(208 - t * 80);  // R
      img.data[idx+1] = Math.round(48  + t * 10);  // G
      img.data[idx+2] = Math.round(176 - t * 50);  // B
      img.data[idx+3] = 255;
    }
  }

  // ゴールドの区切り線
  const drawLine = (x1, y1, x2, y2, r, g, b) => {
    const len = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));
    for (let i = 0; i <= len; i++) {
      const x = Math.round(x1 + (x2-x1)*i/len);
      const y = Math.round(y1 + (y2-y1)*i/len);
      if (x >= 0 && x < W && y >= 0 && y < H) {
        const idx = (W * y + x) * 4;
        img.data[idx] = r; img.data[idx+1] = g; img.data[idx+2] = b; img.data[idx+3] = 180;
      }
    }
  };
  // 2px太さの線
  for (let dy = 0; dy < 2; dy++) drawLine(80, 170+dy, 1120, 170+dy, 218, 165, 32);
  for (let dy = 0; dy < 2; dy++) drawLine(80, 460+dy, 1120, 460+dy, 218, 165, 32);

  const buffer = PNG.sync.write(img);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
