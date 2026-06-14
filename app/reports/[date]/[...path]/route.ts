import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import { reportDates } from "../../report-data";

export const runtime = "nodejs";

const reportsRoot = resolve(process.cwd(), "data", "reports");
const SITE_URL = "https://my-banana-clone.vercel.app";

const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toPageUrl(date: string, path: string[]) {
  const encodedPath = path.map((part) => encodeURIComponent(part)).join("/");
  return `${SITE_URL}/reports/${date}/${encodedPath}`;
}

function enhanceReportHtml(html: string, date: string, path: string[]) {
  const pageUrl = toPageUrl(date, path);
  const title =
    html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ||
    `AI 行业热点自媒体选题库（${date}）`;
  const bodyText = stripHtml(html);
  const description = bodyText
    ? `${bodyText.slice(0, 150).trim()}${bodyText.length > 150 ? "..." : ""}`
    : `AI 行业热点自媒体选题报告，归档日期 ${date}。`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline: title,
    description,
    url: pageUrl,
    inLanguage: "zh-CN",
    datePublished: date,
    dateModified: date,
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Banana Clone",
    },
  };

  const additions = [
    html.includes('name="description"')
      ? ""
      : `<meta name="description" content="${escapeHtml(description)}" />`,
    html.includes('rel="canonical"') ? "" : `<link rel="canonical" href="${pageUrl}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n    ");

  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, `    ${additions}\n</head>`);
  }

  return html;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ date: string; path: string[] }> }
) {
  const { date, path } = await context.params;
  const hasUnsafeSegment = path.some(
    (part) => part === ".." || part.includes("/") || part.includes("\\")
  );

  if (!reportDates.includes(date) || hasUnsafeSegment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = resolve(join(reportsRoot, date, ...path));
  const reportDir = resolve(join(reportsRoot, date));

  if (filePath !== reportDir && !filePath.startsWith(`${reportDir}${sep}`)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const file = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const body =
      ext === ".html"
        ? enhanceReportHtml(file.toString("utf8"), date, path)
        : new Uint8Array(file);

    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600",
        "Content-Type": contentTypes[ext] ?? "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
