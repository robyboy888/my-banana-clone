import { reports } from "./report-data";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderLinks(report: (typeof reports)[number]) {
  const links = [
    `<a href="/reports/${report.date}/">打开二级页面</a>`,
    ...report.files.map(
      (file) => `<a href="${escapeHtml(file.href)}">${escapeHtml(file.label)}</a>`
    ),
  ];

  return links.join("");
}

export function GET() {
  const items = reports
    .map((report) => {
      const date = escapeHtml(report.date);
      const title = escapeHtml(report.title);

      return `
        <article class="item">
          <div>
            <div class="date">${date}</div>
            <p>${title}</p>
          </div>
          <div class="links">
            ${renderLinks(report)}
          </div>
        </article>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AI 行业热点报告归档 | Banana Clone</title>
    <meta name="description" content="按日期归档的 AI 行业热点自媒体选题报告。" />
    <link rel="canonical" href="https://my-banana-clone.vercel.app/reports/" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: #f8fafc;
        color: #0f172a;
        font: 14px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
      }
      a { color: #1d4ed8; text-decoration: none; font-weight: 700; }
      a:hover { text-decoration: underline; }
      main { max-width: 980px; margin: 0 auto; padding: 32px 20px 48px; }
      .hero { background: #1d4ed8; color: white; border-radius: 16px; padding: 22px; box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12); }
      h1 { margin: 0; font-size: 24px; line-height: 1.25; }
      .hero p { margin: 8px 0 0; color: #dbeafe; }
      .list { margin-top: 20px; overflow: hidden; border: 1px solid #e2e8f0; border-radius: 16px; background: white; }
      .list-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; background: #eff6ff; padding: 12px 16px; }
      .list-head h2 { margin: 0; color: #1e3a8a; font-size: 15px; }
      .badge { border: 1px solid #e2e8f0; border-radius: 999px; background: white; color: #64748b; padding: 2px 10px; font-size: 12px; font-weight: 800; }
      .items { padding: 0 16px; }
      .item { display: grid; grid-template-columns: 170px 1fr; gap: 14px; padding: 16px 0; border-bottom: 1px solid #f1f5f9; }
      .item:last-child { border-bottom: 0; }
      .date { font-size: 16px; font-weight: 900; }
      .item p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
      .links { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; }
      @media (max-width: 700px) { .item { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>AI 行业热点报告归档</h1>
        <p>每天生成一份自媒体选题库；此页按日期归档，并自动识别当天目录内的 HTML、MD、CSV 文件。</p>
      </section>
      <section class="list">
        <div class="list-head">
          <h2>报告列表</h2>
          <span class="badge">${reports.length}</span>
        </div>
        <div class="items">${items}</div>
      </section>
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=3600",
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
