import type { Metadata } from "next";
import { reports } from "./report-data";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "AI 行业热点报告归档 | Banana Clone",
  description: "按日期归档的 AI 行业热点自媒体选题报告。",
  alternates: {
    canonical: "https://my-banana-clone.vercel.app/reports",
  },
};

function ReportLinks({ report }: { report: (typeof reports)[number] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <a className="font-bold text-blue-700 hover:underline" href={`/reports/${report.date}`}>
        打开二级页面
      </a>
      {report.files.map((file) => (
        <a key={file.href} className="font-bold text-blue-700 hover:underline" href={file.href}>
          {file.label}
        </a>
      ))}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <section className="mx-auto max-w-[980px] rounded-2xl bg-blue-700 p-6 text-white shadow-xl shadow-slate-200">
        <h1 className="m-0 text-2xl font-black leading-tight">AI 行业热点报告归档</h1>
        <p className="mt-2 text-sm leading-6 text-blue-100">
          每天生成一份自媒体选题库；此页按日期归档，并自动识别当天目录内的 HTML、MD、CSV 文件。
        </p>
      </section>

      <section className="mx-auto mt-5 max-w-[980px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-blue-50 px-4 py-3">
          <h2 className="m-0 text-sm font-black text-blue-950">报告列表</h2>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-0.5 text-xs font-extrabold text-slate-500">
            {reports.length}
          </span>
        </div>

        <div className="px-4">
          {reports.map((report) => (
            <article
              key={report.date}
              className="grid gap-3 border-b border-slate-100 py-4 last:border-b-0 md:grid-cols-[170px_1fr]"
            >
              <div>
                <div className="text-base font-black">{report.date}</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">{report.title}</p>
              </div>
              <ReportLinks report={report} />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
