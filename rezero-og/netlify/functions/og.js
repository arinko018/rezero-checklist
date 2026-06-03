const { createCanvas } = require('canvas');

exports.handler = async (event) => {
  const q   = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';
  const lang  = q.lang  || 'ja';
  const isEn  = lang === 'en';

  const W = 1200, H = 630;
  const canvas = createCanvas(W, H);
  const ctx    = canvas.getContext('2d');

  // ── 背景グラデーション ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   '#fce4ec');
  bg.addColorStop(0.4, '#f3e5f5');
  bg.addColorStop(0.7, '#ede7f6');
  bg.addColorStop(1,   '#e8eaf6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── ボケ装飾（グロウ円） ──
  const glow = (x, y, r, color) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  };
  glow(120,  -80, 220, 'rgba(255,182,193,0.5)');
  glow(1080, 710, 200, 'rgba(206,147,216,0.45)');
  glow(1000,  80, 180, 'rgba(255,204,224,0.5)');
  glow(200,  500, 160, 'rgba(199,179,234,0.4)');

  // ── 白いカード ──
  const cX = W/2, cY = H/2 + 10, cW = 900, cH = 480;
  ctx.save();
  ctx.shadowBlur = 50; ctx.shadowColor = 'rgba(160,80,220,0.2)';
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  // roundRect polyfill
  const r = 32;
  const x = cX-cW/2, y = cY-cH/2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+cW-r, y); ctx.arcTo(x+cW, y, x+cW, y+r, r);
  ctx.lineTo(x+cW, y+cH-r); ctx.arcTo(x+cW, y+cH, x+cW-r, y+cH, r);
  ctx.lineTo(x+r, y+cH); ctx.arcTo(x, y+cH, x, y+cH-r, r);
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  // カード枠線
  ctx.save();
  ctx.strokeStyle = 'rgba(200,160,240,0.55)'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+cW-r, y); ctx.arcTo(x+cW, y, x+cW, y+r, r);
  ctx.lineTo(x+cW, y+cH-r); ctx.arcTo(x+cW, y+cH, x+cW-r, y+cH, r);
  ctx.lineTo(x+r, y+cH); ctx.arcTo(x, y+cH, x, y+cH-r, r);
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath(); ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';

  // ── タイトル ──
  ctx.save();
  ctx.font = 'bold 40px "DejaVu Sans", sans-serif';
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(160,60,180,0.4)';
  ctx.fillStyle = '#9c27b0';
  ctx.fillText('Re:ZERO', cX, cY - 195);
  ctx.restore();

  ctx.save();
  ctx.font = '26px "DejaVu Sans", sans-serif';
  ctx.fillStyle = '#b039c8';
  ctx.fillText(isEn ? 'in Another World' : 'Starting Life in Another World', cX, cY - 158);
  ctx.restore();

  ctx.save();
  ctx.font = 'bold 22px "DejaVu Sans", sans-serif';
  ctx.fillStyle = '#9c27b0';
  ctx.fillText(isEn ? 'Read / Watch Checklist' : 'Read / Watch Checklist', cX, cY - 125);
  ctx.restore();

  // ── ゴールドの区切り線 ──
  ctx.save();
  const sep = ctx.createLinearGradient(cX-380, 0, cX+380, 0);
  sep.addColorStop(0, 'rgba(0,0,0,0)');
  sep.addColorStop(0.2, 'rgba(218,165,32,0.65)');
  sep.addColorStop(0.8, 'rgba(218,165,32,0.65)');
  sep.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.strokeStyle = sep; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(cX-380, cY-92); ctx.lineTo(cX+380, cY-92); ctx.stroke();
  ctx.restore();

  // ── ラベル ──
  ctx.save();
  ctx.font = '24px "DejaVu Sans", sans-serif';
  ctx.fillStyle = '#9c3fb0';
  ctx.fillText(isEn ? 'Completion Rate' : 'Completion Rate', cX, cY - 55);
  ctx.restore();

  // ── 大きな % 数字 ──
  ctx.save();
  ctx.font = 'bold 112px "DejaVu Sans", sans-serif';
  const pGrad = ctx.createLinearGradient(cX-120, cY-80, cX+120, cY+40);
  pGrad.addColorStop(0, '#d060a0');
  pGrad.addColorStop(0.5, '#9c27b0');
  pGrad.addColorStop(1, '#6030b0');
  ctx.fillStyle = pGrad;
  ctx.shadowBlur = 24; ctx.shadowColor = 'rgba(180,60,200,0.35)';
  ctx.fillText(pct + '%', cX, cY + 60);
  ctx.restore();

  // ── 達成数 ──
  ctx.save();
  ctx.font = 'bold 24px "DejaVu Sans", sans-serif';
  ctx.fillStyle = '#9040b8';
  ctx.fillText('★  ' + done + ' / ' + total + (isEn ? ' items' : ' items') + '  ★', cX, cY + 108);
  ctx.restore();

  // ── キラキラ星 ──
  const sparkle = (sx, sy, ss) => {
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.shadowBlur = ss*2; ctx.shadowColor = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (Math.PI/4)*i - Math.PI/2;
      const rad = i%2===0 ? ss : ss*0.13;
      if (i===0) ctx.moveTo(Math.cos(a)*rad, Math.sin(a)*rad);
      else ctx.lineTo(Math.cos(a)*rad, Math.sin(a)*rad);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  [[95,75,22],[1105,95,18],[65,390,16],[1125,420,20],[605,28,14],[585,585,16],[300,45,11],[900,30,13]].forEach(([sx,sy,ss]) => sparkle(sx,sy,ss));

  const buffer = canvas.toBuffer('image/png');
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
