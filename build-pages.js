// MoneySaver Copilot — static SEO page generator
// Run: node build-pages.js  → creates schemes/<id>.html for every scheme in data.js

const fs = require('fs');
const path = require('path');

eval(fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8')
  .replace('const VERIFIED', 'global.VERIFIED')
  .replace('const SCHEMES', 'global.SCHEMES')
  .replace('const PIN_CIRCLE', 'global.PIN_CIRCLE'));

const outDir = path.join(__dirname, 'schemes');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const stripTags = s => s.replace(/<[^>]+>/g,'');

for (const m of SCHEMES) {
  const enTitle = `${m.name} — Eligibility, benefits & how to apply (${VERIFIED})`;
  const enDesc = `${m.name}: ${m.worth}. ${stripTags(m.why).slice(0,150)}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${esc(enTitle)}</title>
<meta name="description" content="${esc(enDesc)}"/>
<link rel="canonical" href="https://karna-theconqueror.github.io/money-saver-copilot/schemes/${m.id}.html"/>
<meta property="og:title" content="${esc(enTitle)}"/>
<meta property="og:description" content="${esc(enDesc)}"/>
<meta property="og:type" content="article"/>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"GovernmentService","name":${JSON.stringify(m.name)},
"name@hi":${JSON.stringify(m.hi ? m.hi.name : m.name)},
"provider":{"@type":"Organization","name":${JSON.stringify(m.agency)}}}
</script>
<style>
 body{font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px 20px 60px;color:#14261E;line-height:1.6;background:#FBFAF7}
 h1{font-size:1.6rem;letter-spacing:-.02em;margin-bottom:4px}
 .agency{color:#5C6B63;font-size:.9rem}
 .pill{display:inline-block;background:#E8F5EF;color:#0A5C40;font-weight:700;font-size:.85rem;padding:6px 12px;border-radius:99px;margin:12px 0}
 .hi{background:#fff;border:1px solid #E6E2D8;border-radius:12px;padding:16px;margin:16px 0}
 ol{padding-left:20px} li{margin:6px 0}
 a{color:#0E7A55;font-weight:600}
 .cta{display:inline-block;background:#0E7A55;color:#fff;padding:13px 24px;border-radius:12px;text-decoration:none;margin-top:18px}
 .dis{font-size:.75rem;color:#5C6B63;margin-top:28px}
</style>
</head>
<body>
<p><a href="../index.html">← MoneySaver Copilot</a></p>
<h1>${esc(m.name)}</h1>
<div class="agency">${esc(m.agency)}</div>
<span class="pill">${esc(m.worth)}</span>
<p><b>Who is it for:</b> ${esc(m.who)}</p>
<p>${esc(m.why)}</p>
${m.hi ? `<div class="hi" lang="hi"><b>हिन्दी में:</b> ${esc(m.hi.name)} — ${esc(m.hi.why)}</div>` : ''}
<h2>How to apply (step by step)</h2>
<ol>${m.steps.map(s=>`<li>${esc(s)}</li>`).join('\n')}</ol>
<p><a href="${m.url}" target="_blank" rel="noopener">Official portal →</a></p>
<a class="cta" href="../index.html#s=">Check your full eligibility in 60 seconds →</a>
<p class="dis">Estimates only — verify on the official portal. Scheme data last verified ${VERIFIED}. Independent tool, not affiliated with any government.</p>
</body>
</html>`;
  fs.writeFileSync(path.join(outDir, m.id + '.html'), html, 'utf8');
  console.log('generated schemes/' + m.id + '.html');
}

// ---- sitemap.xml ----
const BASE = 'https://karna-theconqueror.github.io/money-saver-copilot/';
const today = new Date().toISOString().slice(0, 10);
const urls = [
  { loc: BASE, priority: '1.0', freq: 'weekly' },
  ...SCHEMES.map(m => ({ loc: BASE + 'schemes/' + m.id + '.html', priority: '0.8', freq: 'monthly' }))
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log('generated sitemap.xml (' + urls.length + ' urls)');
console.log('done — ' + SCHEMES.length + ' pages');
