exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const pct   = q.pct   || '0';
  const done  = q.done  || '0';
  const total = q.total || '0';
  const link  = q.link  || 'https://rezero-checklist.netlify.app/';
  const lang  = q.lang  || 'ja';

  const baseUrl = process.env.URL || 'https://rezero-checklist.netlify.app';
  const ogImageUrl = `${baseUrl}/api/og?pct=${encodeURIComponent(pct)}&done=${encodeURIComponent(done)}&total=${encodeURIComponent(total)}&lang=${lang}`;

  const isEn = lang === 'en';
  const title = isEn
    ? 'Re:Zero Starting Life in Another World — Checklist'
    : 'Re:ゼロから始める異世界生活 既読・視聴チェックリスト';
  const desc = isEn
    ? `My Re:Zero completion rate is ${pct}% (${done}/${total} items)`
    : `私のリゼロ既読・視聴率は ${pct}% です（${done}/${total} 項目）`;

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta property="og:type"         content="website">
  <meta property="og:title"        content="${title}">
  <meta property="og:description"  content="${desc}">
  <meta property="og:image"        content="${ogImageUrl}">
  <meta property="og:url"          content="${link}">
  <meta property="og:image:width"  content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image"       content="${ogImageUrl}">
  <meta http-equiv="refresh" content="0; url=${link}">
</head>
<body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f3e5f5;font-family:sans-serif;">
  <a href="${link}" style="color:#9c27b0;font-size:18px;">チェックリストへ移動中...</a>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
    body: html,
  };
};
