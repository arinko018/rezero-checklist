export default function handler(req, res) {
  const { pct = '0', done = '0', total = '0', link = '', lang = 'ja' } = req.query;

  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const ogImageUrl = `${baseUrl}/api/og?pct=${encodeURIComponent(pct)}&done=${encodeURIComponent(done)}&total=${encodeURIComponent(total)}&lang=${lang}`;
  const checklistUrl = link || 'https://MatsuraAndie.github.io/rezero/';

  const isEn = lang === 'en';
  const title = isEn
    ? 'Re:Zero Starting Life in Another World — Checklist'
    : 'Re:ゼロから始める異世界生活 既読・視聴チェックリスト';
  const description = isEn
    ? `My Re:Zero completion rate is ${pct}% (${done}/${total} items)`
    : `私のリゼロ既読・視聴率は ${pct}% です（${done}/${total} 項目）`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>

  <!-- OGP / Twitter Card -->
  <meta property="og:type"        content="website">
  <meta property="og:title"       content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image"       content="${ogImageUrl}">
  <meta property="og:url"         content="${checklistUrl}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">

  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image"       content="${ogImageUrl}">

  <!-- チェックリストへ即リダイレクト -->
  <meta http-equiv="refresh" content="0; url=${checklistUrl}">

  <style>
    body { margin:0; background:#f3e5f5; font-family:sans-serif;
           display:flex; align-items:center; justify-content:center; min-height:100vh; }
    a { color:#9c27b0; font-size:18px; }
  </style>
</head>
<body>
  <a href="${checklistUrl}">→ チェックリストへ移動中...</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(html);
}
