const path = require('path');
const fs   = require('fs');
const { Resvg } = require('@resvg/resvg-js');

// @fontsource/noto-sans-jp のWOFFファイルをnode_modulesから読む
// fontkit(satoriが使用)はWOFF形式をサポートしている
function loadFont() {
  const candidates = [
    // japanese サブセット（日本語文字のみ・軽量）
    path.join(process.cwd(), 'node_modules', '@fontsource', 'noto-sans-jp', 'files', 'noto-sans-jp-japanese-400-normal.woff'),
    // all（全文字収録・確実だが重い）
    path.join(process.cwd(), 'node_modules', '@fontsource', 'noto-sans-jp', 'files', 'noto-sans-jp-all-400-normal.woff'),
    // __dirnameからの相対パス（フォールバック）
    path.join(__dirname, '..', '..', 'node_modules', '@fontsource', 'noto-sans-jp', 'files', 'noto-sans-jp-japanese-400-normal.woff'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const size = fs.statSync(p).size;
      console.log('Font found:', p, size + ' bytes');
      return fs.readFileSync(p);
    }
  }
  console.error('Font NOT found. Searched:', candidates);
  return null;
}

exports.handler = async (event) => {
  const q     = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';
  const lang  = q.lang  || 'ja';
  const isEn  = lang === 'en';

  // ESMパッケージはdynamic importで読む
  const { default: satori } = await import('satori');

  const fontData = loadFont();
  if (!fontData) {
    return { statusCode: 500, body: 'Font not found. Check @fontsource/noto-sans-jp is installed.' };
  }

  // 言語切り替えテキスト
  const title   = isEn ? 'Re:ZERO - Starting Life in Another World' : 'Re:ゼロから始める異世界生活';
  const sub     = isEn ? 'Read / Watch Checklist'                   : '既読・視聴チェックリスト';
  const label   = isEn ? 'Completion Rate'                          : 'コンプリート率';
  const itemsTxt = isEn ? `${done} / ${total} items`               : `${done} / ${total} 項目達成`;
  const siteUrl = 'rezero-checklist.netlify.app';

  // satori用のReactライクな要素ツリー
  const element = {
    type: 'div',
    props: {
      style: {
        width: '1200px', height: '630px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)',
        fontFamily: '"Noto Sans JP"',
        position: 'relative',
      },
      children: [
        // ボケ装飾
        { type:'div', props:{ style:{ position:'absolute', top:-60, left:-40, width:280, height:280, borderRadius:'50%', background:'rgba(255,182,193,0.5)' }, children:'' } },
        { type:'div', props:{ style:{ position:'absolute', bottom:-50, right:-30, width:260, height:260, borderRadius:'50%', background:'rgba(206,147,216,0.45)' }, children:'' } },
        { type:'div', props:{ style:{ position:'absolute', top:40, right:60, width:200, height:200, borderRadius:'50%', background:'rgba(255,204,224,0.5)' }, children:'' } },
        // 白カード
        {
          type: 'div',
          props: {
            style: {
              display:'flex', flexDirection:'column', alignItems:'center',
              background:'rgba(255,255,255,0.86)',
              border:'2px solid rgba(200,160,240,0.6)',
              borderRadius:'28px',
              padding:'24px 56px 28px',
              width:'1100px',
              gap:'4px',
            },
            children: [
              // タイトル
              { type:'div', props:{ style:{ fontSize:36, fontWeight:700, color:'#9c27b0', textAlign:'center' }, children: title } },
              { type:'div', props:{ style:{ fontSize:22, color:'#b039c8' }, children: sub } },
              // 区切り線
              { type:'div', props:{ style:{ width:'100%', height:2, background:'rgba(218,165,32,0.65)', margin:'6px 0' }, children:'' } },
              // ラベル
              { type:'div', props:{ style:{ fontSize:24, color:'#9c3fb0' }, children: label } },
              // 大きな%
              { type:'div', props:{ style:{ fontSize:150, fontWeight:700, color:'#9c27b0', lineHeight:1.05 }, children: pct + '%' } },
              // 達成数
              { type:'div', props:{ style:{ fontSize:26, color:'#8040b8' }, children: '★ ' + itemsTxt + ' ★' } },
              // 区切り線
              { type:'div', props:{ style:{ width:'100%', height:1.5, background:'rgba(218,165,32,0.5)', margin:'4px 0' }, children:'' } },
              // 進捗バー背景
              { type:'div', props:{
                style:{ width:'100%', height:24, background:'rgba(220,190,240,0.5)', borderRadius:12, overflow:'hidden', display:'flex', alignItems:'stretch' },
                children: {
                  type:'div',
                  props:{ style:{ width: pct + '%', background:'linear-gradient(90deg,#d060a0,#7030b0)', borderRadius:12 }, children:'' }
                }
              }},
              // URL
              { type:'div', props:{ style:{ fontSize:18, color:'rgba(120,60,180,0.65)', marginTop:4 }, children: siteUrl } },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(element, {
    width: 1200,
    height: 630,
    fonts: [{
      name: 'Noto Sans JP',
      data: fontData,
      weight: 400,
      style: 'normal',
    }],
  });

  // satoriのSVGはテキストがパス化済み → resvgでPNG変換（フォント不要）
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const png   = resvg.render().asPng();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=600' },
    body: Buffer.from(png).toString('base64'),
    isBase64Encoded: true,
  };
};
