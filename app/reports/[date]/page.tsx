import { notFound } from "next/navigation";
import Link from "next/link";
import { reports } from "../report-data";

export function generateStaticParams() {
  return reports.map((report) => ({ date: report.date }));
}

export default async function ReportDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const report = reports.find((entry) => entry.date === date);

  if (!report) {
    notFound();
  }

  const reportHref = report.primaryHtmlHref || `/reports/${date}/index.html`;

  return (
    <main className="min-h-screen bg-white px-6 py-8 text-slate-950">
      <meta httpEquiv="refresh" content={`0; url=${reportHref}`} />
      <p className="text-sm">
        正在打开报告：
        <a className="text-blue-700 hover:underline" href={reportHref}>
          {reportHref}
        </a>
      </p>
      <p className="mt-3 text-sm">
        <Link className="text-blue-700 hover:underline" href="/reports/">
          返回归档
        </Link>
      </p>
    </main>
  );
}
