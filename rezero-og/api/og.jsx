import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const pct   = searchParams.get('pct')   || '0';
  const done  = searchParams.get('done')  || '0';
  const total = searchParams.get('total') || '0';
  const lang  = searchParams.get('lang')  || 'ja';
  const isEn  = lang === 'en';

  // Noto Sans JP フォント（日本語対応）
  const fontRes = await fetch(
    'https://fonts.gstatic.com/s/notosansjp/v53/-F6jfjtqLzI2JPCgQBnw7HFyzSD-AsregP8VFBEj75s.woff2'
  );
  const fontData = await fontRes.arrayBuffer();

  const title1 = isEn ? 'Re:Zero Starting Life'      : 'Re:ゼロから始める異世界生活';
  const title2 = isEn ? 'in Another World — Checklist' : '既読・視聴チェックリスト';
  const label  = isEn ? 'Completion Rate'             : 'コンプリート率';
  const items  = isEn ? `${done} / ${total} items`   : `${done} / ${total} 項目達成`;

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 40%, #ede7f6 70%, #e8eaf6 100%)',
        fontFamily: '"Noto Sans JP", sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 背景の装飾円（ボケ） */}
      <div style={{ position:'absolute', top:-80, left:-60, width:320, height:320, borderRadius:'50%', background:'rgba(255,182,193,0.45)', filter:'blur(60px)', display:'flex' }} />
      <div style={{ position:'absolute', bottom:-60, right:-40, width:280, height:280, borderRadius:'50%', background:'rgba(206,147,216,0.4)', filter:'blur(50px)', display:'flex' }} />
      <div style={{ position:'absolute', top:80, right:60, width:200, height:200, borderRadius:'50%', background:'rgba(255,204,224,0.5)', filter:'blur(40px)', display:'flex' }} />

      {/* 白いカード */}
      <div style={{
        background: 'rgba(255,255,255,0.78)',
        border: '2px solid rgba(200,160,240,0.5)',
        borderRadius: '32px',
        padding: '48px 80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 48px rgba(160,80,220,0.15)',
      }}>
        {/* タイトル */}
        <div style={{ fontSize: '36px', fontWeight: 900, color: '#9c27b0', letterSpacing: '0.02em', lineHeight: 1.3, textAlign: 'center' }}>
          {title1}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#b039c8', marginBottom: '12px', textAlign: 'center' }}>
          {title2}
        </div>

        {/* 区切り線 */}
        <div style={{ width: '500px', height: '1.5px', background: 'linear-gradient(90deg, transparent, rgba(218,165,32,0.6), transparent)', marginBottom: '8px', display: 'flex' }} />

        {/* ラベル */}
        <div style={{ fontSize: '22px', color: '#9c3fb0', fontWeight: 600 }}>
          {label}
        </div>

        {/* パーセント */}
        <div style={{
          fontSize: '120px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #d060a0, #9c27b0, #6030b0)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          lineHeight: 1.1,
        }}>
          {pct}%
        </div>

        {/* 達成数 */}
        <div style={{ fontSize: '24px', color: '#8040b8', fontWeight: 600 }}>
          ★ {items} ★
        </div>
      </div>

      {/* キラキラ星 */}
      {[
        [80, 60, 26], [1110, 90, 20], [60, 420, 16],
        [1130, 400, 18], [620, 30, 14], [580, 600, 16],
      ].map(([x, y, s], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          width: s, height: s,
          background: 'white',
          clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
          opacity: 0.85,
          display: 'flex',
        }} />
      ))}
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Noto Sans JP', data: fontData, weight: 900 }],
    }
  );
}
