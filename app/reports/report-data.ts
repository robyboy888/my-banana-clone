import { existsSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";

const reportsRoot = join(process.cwd(), "data", "reports");

export type ReportFile = {
  label: string;
  href: string;
  path: string;
  type: "html" | "md" | "csv";
};

export type ReportEntry = {
  date: string;
  title: string;
  primaryHtmlHref: string | null;
  files: ReportFile[];
};

function getReportDates() {
  if (!existsSync(reportsRoot)) return [];

  return readdirSync(reportsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function getReportFilePaths(dir: string, prefix = ""): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolutePath = join(dir, entry.name);

      if (entry.isDirectory()) {
        return getReportFilePaths(absolutePath, relativePath);
      }

      return entry.isFile() ? [relativePath] : [];
    })
    .sort();
}

function toReportHref(date: string, path: string) {
  return `/reports/${date}/${path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

function getPrimaryHtmlPath(date: string, htmlPaths: string[]) {
  const expected = `ai-hotspots-${date}.html`;

  return (
    htmlPaths.find((path) => path === expected) ||
    htmlPaths.find((path) => !path.includes("/") && path !== "index.html") ||
    htmlPaths.find((path) => path !== "index.html") ||
    htmlPaths.find((path) => path === "index.html") ||
    null
  );
}

function labelFromPath(path: string) {
  return basename(path, extname(path)).replaceAll("-", " ");
}

function getFileLabel(
  date: string,
  path: string,
  type: ReportFile["type"],
  primaryHtmlPath: string | null
) {
  if (type === "html") {
    if (path === primaryHtmlPath) return "HTML";
    return labelFromPath(path);
  }

  if (path === `ai-hotspots-${date}.${type}`) return type.toUpperCase();

  return labelFromPath(path);
}

function buildReport(date: string): ReportEntry {
  const paths = getReportFilePaths(join(reportsRoot, date));
  const htmlPaths = paths.filter((path) => extname(path).toLowerCase() === ".html");
  const primaryHtmlPath = getPrimaryHtmlPath(date, htmlPaths);
  const primaryHtmlHref = primaryHtmlPath ? toReportHref(date, primaryHtmlPath) : null;

  const visiblePaths = [
    ...htmlPaths.filter((path) => path !== "index.html"),
    ...paths.filter((path) => extname(path).toLowerCase() === ".md"),
    ...paths.filter((path) => extname(path).toLowerCase() === ".csv"),
  ];

  const files = visiblePaths.map((path): ReportFile => {
    const extension = extname(path).toLowerCase();
    const type = extension === ".md" ? "md" : extension === ".csv" ? "csv" : "html";

    return {
      label: getFileLabel(date, path, type, primaryHtmlPath),
      href: toReportHref(date, path),
      path,
      type,
    };
  });

  return {
    date,
    title: `AI 行业热点自媒体选题库（${date}）`,
    primaryHtmlHref,
    files,
  };
}

export const reportDates = getReportDates();

export const reports: ReportEntry[] = reportDates.map(buildReport).reverse();

export const reportHtmlPaths = reports.flatMap((report) =>
  report.files
    .filter((file) => file.type === "html")
    .map((file) => ({
      date: report.date,
      href: file.href,
    }))
);
