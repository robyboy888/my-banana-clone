"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  FileText,
  Heading1,
  ImageIcon,
  LayoutTemplate,
  RefreshCw,
  Sparkles,
  Target,
  Wand2,
  Zap,
} from "lucide-react";

type Template = {
  id: string;
  name: string;
  category: string;
  market: string;
  price: string;
  conversion: string;
  prompt: string;
  layout: string;
  color: string;
  accent: string;
  ingredients: string[];
  channels: string[];
  score: number;
};

type EngineMode = "template" | "title" | "copy" | "launch";

const templates: Template[] = [
  {
    id: "cover",
    name: "爆款封面模板",
    category: "社媒首图",
    market: "小红书 / 即梦 / 可灵教程",
    price: "￥19 单件, ￥99 套装",
    conversion: "强标题 + 强主体 + 强对比",
    prompt:
      "主体清晰居中, 高对比背景, 明确光源, 商品级质感, 适合 9:16 封面, 保留顶部标题安全区",
    layout: "上标题区, 中主体区, 下利益点区",
    color: "from-rose-500 via-orange-400 to-yellow-300",
    accent: "bg-rose-500",
    ingredients: ["9:16", "大主体", "标题安全区", "三段式卖点"],
    channels: ["小红书", "抖音图文", "朋友圈海报"],
    score: 94,
  },
  {
    id: "product",
    name: "商品种草模板",
    category: "电商转化",
    market: "独立站 / 私域 / 店铺详情",
    price: "￥29 单件, ￥199 行业包",
    conversion: "场景利益 + 质感对比 + 购买理由",
    prompt:
      "真实产品摄影, 环境光, 使用场景明确, 前景有层次, 背景简洁, 输出可商用广告视觉",
    layout: "场景图, 局部特写, 对比证据, CTA",
    color: "from-cyan-400 via-blue-500 to-slate-900",
    accent: "bg-cyan-400",
    ingredients: ["产品主图", "场景图", "对比图", "信任标签"],
    channels: ["Shopify", "淘宝详情", "社群转化"],
    score: 91,
  },
  {
    id: "course",
    name: "知识付费模板",
    category: "课程海报",
    market: "AI 课程 / 训练营 / 资料包",
    price: "￥39 单件, ￥299 课程包",
    conversion: "身份承诺 + 结果截图 + 课程资产",
    prompt:
      "高级课程海报, 信息层级清晰, 教程截图质感, 专家感, 内容资产陈列, 适合付费转化页",
    layout: "承诺标题, 资产陈列, 讲师背书, 行动按钮",
    color: "from-emerald-300 via-teal-500 to-slate-950",
    accent: "bg-emerald-400",
    ingredients: ["课程封面", "模块清单", "收益结果", "交付物"],
    channels: ["知识星球", "微信群", "公众号"],
    score: 96,
  },
  {
    id: "trend",
    name: "热点跟拍模板",
    category: "内容增长",
    market: "热点图文 / AI 案例复刻",
    price: "￥9 单件, ￥59 周更包",
    conversion: "趋势关键词 + 一键复刻 + 快速发布",
    prompt:
      "热点趋势视觉, 强记忆点, 可替换主体, 视觉冲击力高, 输出统一系列封面",
    layout: "热点锚点, 复刻步骤, 效果预览, 模板入口",
    color: "from-fuchsia-500 via-violet-500 to-indigo-900",
    accent: "bg-fuchsia-500",
    ingredients: ["热点标签", "复刻步骤", "同款提示词", "发布标题"],
    channels: ["小红书", "即刻", "抖音"],
    score: 88,
  },
  {
    id: "brand",
    name: "品牌大片模板",
    category: "高客单设计",
    market: "品牌咨询 / 视觉服务 / 案例包装",
    price: "￥199 单件, ￥999 品牌包",
    conversion: "审美溢价 + 案例前后对比 + 品牌统一",
    prompt:
      "品牌广告大片, 高级商业摄影, 统一视觉系统, 明确材质和灯光, 适合提案与作品集",
    layout: "品牌主视觉, 材质特写, 应用场景, 提案封面",
    color: "from-zinc-200 via-neutral-500 to-black",
    accent: "bg-zinc-200",
    ingredients: ["主视觉", "品牌色板", "材质系统", "提案页"],
    channels: ["作品集", "客户提案", "官网案例"],
    score: 93,
  },
  {
    id: "avatar",
    name: "人物 IP 模板",
    category: "个人品牌",
    market: "IP 头像 / 讲师形象 / 社交资料",
    price: "￥49 单件, ￥399 IP 包",
    conversion: "可信人格 + 视觉统一 + 多场景复用",
    prompt:
      "专业人物肖像, 统一背景系统, 清晰脸部光线, 保留真实五官, 适合个人品牌矩阵",
    layout: "头像, 横幅, 内容封面, 直播间背景",
    color: "from-amber-300 via-lime-400 to-emerald-900",
    accent: "bg-lime-400",
    ingredients: ["头像", "横幅", "口播封面", "账号主页"],
    channels: ["小红书主页", "视频号", "LinkedIn"],
    score: 89,
  },
];

const titleAngles = [
  {
    id: "gap",
    label: "差距刺激",
    formula: "别人已经在用 {topic} 批量出图了, 你还在手写提示词",
  },
  {
    id: "asset",
    label: "资产承诺",
    formula: "把 {topic} 做成可复用资产, 一套模板反复卖",
  },
  {
    id: "proof",
    label: "结果证明",
    formula: "我用 {topic} 跑出 6 个可上架视觉模板, 直接复制结构",
  },
  {
    id: "shortcut",
    label: "捷径方案",
    formula: "{topic} 不缺工具, 缺的是这套爆款模板系统",
  },
];

const copyFormats = [
  "小红书种草",
  "抖音口播",
  "课程销售页",
  "模板商品页",
  "私域成交话术",
];

const launchChecklist = [
  "每个模板固定 1 个主场景, 3 个替换变量, 5 条标题钩子",
  "预览图统一 9:16, 1:1, 16:9 三种比例",
  "商品页展示成品图, 结构图, 提示词, 适用行业, 售后边界",
  "套装按行业命名, 不按工具命名, 方便用户理解购买结果",
  "每周更新热点模板, 旧模板沉淀为长期素材库",
  "把标题系统和文案引擎作为加价模块, 不免费赠送给单件模板",
];

const stats = [
  { label: "模板资产", value: "36", note: "首批可上架单元" },
  { label: "标题钩子", value: "144", note: "4 类爆款角度" },
  { label: "交付规格", value: "3", note: "封面 / 商品 / 课程" },
  { label: "变现层级", value: "4", note: "单件到订阅" },
];

function fillFormula(formula: string, topic: string) {
  return formula.replaceAll("{topic}", topic || "AI 视觉内容");
}

function buildCopy(format: string, topic: string, audience: string, template: Template) {
  const subject = topic || "AI 视觉内容";
  const target = audience || "想做内容变现的人";

  if (format === "抖音口播") {
    return `如果你正在做 ${subject}, 不要只收藏提示词。真正能卖钱的是模板系统: 先固定画面结构, 再替换行业变量, 最后用标题钩子测试点击率。这套「${template.name}」适合 ${target}, 可以直接拆成封面、提示词和成品预览三件套。`;
  }

  if (format === "课程销售页") {
    return `这不是一堆灵感图, 而是一套可以交付的 ${subject} 操作系统。你会拿到「${template.name}」的画面结构、提示词框架、标题公式和上架清单, 用它把零散审美变成可复用、可售卖、可持续更新的模板资产。`;
  }

  if (format === "模板商品页") {
    return `适合 ${target} 的 ${template.name}。内含 ${template.ingredients.join("、")}。你可以直接替换行业、产品、人物或场景, 快速生成一组风格统一的视觉内容, 适合投放到 ${template.channels.join("、")}。`;
  }

  if (format === "私域成交话术") {
    return `你现在缺的不是更多工具, 而是一套稳定产出的 ${subject} 模板。我建议先从「${template.name}」开始, 因为它能同时解决选题、画面和转化文案, 做完就能上架成一个可卖的视觉资产包。`;
  }

  return `我把 ${subject} 拆成了一套能反复复用的模板系统。以「${template.name}」为例, 先锁定 ${template.layout}, 再套入标题钩子和成交文案, 就能把一张灵感图升级成可上架的视觉资产。适合 ${target}。`;
}

function VisualPreview({ template }: { template: Template }) {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-2xl shadow-black/40">
      <div className={`absolute inset-0 bg-gradient-to-br ${template.color}`} />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.22),transparent_32%,rgba(0,0,0,0.42)_72%)]" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
        <span>{template.category}</span>
        <span>V1.0</span>
      </div>
      <div className="absolute left-5 top-16 w-24 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black text-black">
        {template.market.split("/")[0].trim()}
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/55 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${template.accent}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/60">
            Monetizable
          </span>
        </div>
        <h3 className="text-3xl font-black leading-[0.95] tracking-tight text-white">
          {template.name}
        </h3>
        <p className="mt-4 text-xs font-semibold leading-relaxed text-white/65">
          {template.conversion}
        </p>
      </div>
    </div>
  );
}

function CopyPanel({
  title,
  value,
  onCopy,
  icon,
}: {
  title: string;
  value: string;
  onCopy: () => void;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          {icon}
          {title}
        </div>
        <button
          onClick={onCopy}
          className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-white px-4 text-[11px] font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#3fc1c0] hover:text-white active:translate-y-px"
        >
          <Copy size={14} />
          复制
        </button>
      </div>
      <p className="whitespace-pre-line text-sm leading-7 text-slate-300 [word-break:break-word]">
        {value}
      </p>
    </div>
  );
}

export default function VisualOSClient() {
  const [mode, setMode] = useState<EngineMode>("template");
  const [selectedId, setSelectedId] = useState("course");
  const [topic, setTopic] = useState("AI 视觉内容生成");
  const [audience, setAudience] = useState("内容创作者和 AI 副业玩家");
  const [platform, setPlatform] = useState("小红书");
  const [format, setFormat] = useState(copyFormats[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedTemplate = templates.find((item) => item.id === selectedId) ?? templates[0];

  const titles = useMemo(
    () => titleAngles.map((item) => ({ ...item, result: fillFormula(item.formula, topic) })),
    [topic],
  );

  const promptPack = useMemo(() => {
    return [
      `模板定位: ${selectedTemplate.name}`,
      `目标用户: ${audience}`,
      `发布平台: ${platform}`,
      `画面结构: ${selectedTemplate.layout}`,
      `生成提示词: ${selectedTemplate.prompt}`,
      `商业包装: ${selectedTemplate.price}, ${selectedTemplate.conversion}`,
    ].join("\n");
  }, [audience, platform, selectedTemplate]);

  const salesCopy = useMemo(
    () => buildCopy(format, topic, audience, selectedTemplate),
    [audience, format, selectedTemplate, topic],
  );

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch (error) {
      console.error("复制失败:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#080a0f] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#10131a]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm font-black tracking-tight text-white transition hover:text-[#3fc1c0]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-black">
              <ArrowLeft size={18} />
            </span>
            Banana Clone
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 sm:flex">
            <Sparkles size={14} className="text-[#3fc1c0]" />
            Visual OS V1.0
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(63,193,192,0.22),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-16">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="mb-5 inline-flex rounded-full border border-[#3fc1c0]/30 bg-[#3fc1c0]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#9ff4f2]">
                Monetizable Template System
              </p>
              <h1 className="max-w-5xl text-5xl font-black leading-[0.92] tracking-tight text-white sm:text-7xl lg:text-8xl">
                视觉内容生成操作系统
              </h1>
              <p className="mt-7 max-w-2xl text-base font-semibold leading-8 text-slate-300 sm:text-lg">
                把零散提示词升级成可售卖模板库, 再挂上爆款标题系统和文案引擎。目标不是多生成几张图, 而是建立可以上架、复用、迭代、加价的视觉资产流水线。
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="border-t border-white/12 pt-4">
                  <div className="text-3xl font-black text-white">{item.value}</div>
                  <div className="mt-1 text-xs font-black text-slate-400">{item.label}</div>
                  <div className="mt-2 text-[11px] font-semibold text-slate-500">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-[0.92fr_1.08fr]">
            <div className="space-y-4">
              {templates.slice(0, 4).map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedId(template.id)}
                  className={`w-full rounded-[24px] border p-4 text-left transition active:translate-y-px ${
                    selectedId === template.id
                      ? "border-[#3fc1c0] bg-[#3fc1c0]/12"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-white">{template.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">{template.category}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black">
                      {template.score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <VisualPreview template={selectedTemplate} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1600px] gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[320px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-4">
            {[
              { id: "template", label: "爆款模板库", icon: <LayoutTemplate size={18} /> },
              { id: "title", label: "爆款标题系统", icon: <Heading1 size={18} /> },
              { id: "copy", label: "文案引擎", icon: <FileText size={18} /> },
              { id: "launch", label: "上架变现清单", icon: <BadgeDollarSign size={18} /> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMode(item.id as EngineMode)}
                className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-sm font-black transition last:mb-0 active:translate-y-px ${
                  mode === item.id
                    ? "bg-white text-black"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[30px] border border-white/10 bg-[#10131a] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-black">
              <Target size={18} className="text-[#3fc1c0]" />
              生成参数
            </div>
            <label className="mb-4 block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                主题
              </span>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#3fc1c0]"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                用户
              </span>
              <input
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-[#3fc1c0]"
              />
            </label>
            <label className="mb-4 block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                平台
              </span>
              <select
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition focus:border-[#3fc1c0]"
              >
                {["小红书", "抖音", "公众号", "Shopify", "知识星球"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                文案格式
              </span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition focus:border-[#3fc1c0]"
              >
                {copyFormats.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
        </aside>

        <div className="min-w-0">
          {mode === "template" && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-black text-[#3fc1c0]">Template Library</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                    爆款视觉模板库
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedId(templates[(templates.findIndex((item) => item.id === selectedId) + 1) % templates.length].id)}
                  className="flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-5 text-sm font-black text-white transition hover:bg-white hover:text-black active:translate-y-px"
                >
                  <RefreshCw size={16} />
                  换一个模板
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedId(template.id)}
                    className={`rounded-[30px] border p-5 text-left transition hover:-translate-y-1 ${
                      selectedId === template.id
                        ? "border-[#3fc1c0] bg-[#3fc1c0]/10"
                        : "border-white/10 bg-white/[0.04]"
                    }`}
                  >
                    <div className={`mb-5 h-28 rounded-[24px] bg-gradient-to-br ${template.color}`} />
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-white">{template.name}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-black">
                        {template.score}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-6 text-slate-400">
                      {template.conversion}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {template.ingredients.map((item) => (
                        <span key={item} className="rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-bold text-slate-300">
                          {item}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === "title" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-black text-[#3fc1c0]">Viral Title System</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                  爆款标题系统
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {titles.map((item) => (
                  <CopyPanel
                    key={item.id}
                    title={item.label}
                    value={item.result}
                    icon={<Zap size={18} className="text-[#3fc1c0]" />}
                    onCopy={() => handleCopy(`title-${item.id}`, item.result)}
                  />
                ))}
              </div>
              {copiedKey?.startsWith("title") && (
                <p className="text-sm font-bold text-[#3fc1c0]">标题已复制。</p>
              )}
            </div>
          )}

          {mode === "copy" && (
            <div className="grid gap-6 xl:grid-cols-[1fr_0.88fr]">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-black text-[#3fc1c0]">Copy Engine</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                    文案引擎
                  </h2>
                </div>
                <CopyPanel
                  title={`${format} 文案`}
                  value={salesCopy}
                  icon={<Wand2 size={18} className="text-[#3fc1c0]" />}
                  onCopy={() => handleCopy("sales-copy", salesCopy)}
                />
                <CopyPanel
                  title="提示词交付包"
                  value={promptPack}
                  icon={<ImageIcon size={18} className="text-[#3fc1c0]" />}
                  onCopy={() => handleCopy("prompt-pack", promptPack)}
                />
              </div>
              <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5">
                <VisualPreview template={selectedTemplate} />
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-black/25 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Price</p>
                    <p className="mt-2 text-sm font-black text-white">{selectedTemplate.price}</p>
                  </div>
                  <div className="rounded-2xl bg-black/25 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Market</p>
                    <p className="mt-2 text-sm font-black text-white">{selectedTemplate.market}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {mode === "launch" && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-black text-[#3fc1c0]">Launch Checklist</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                  上架变现清单
                </h2>
              </div>
              <div className="grid gap-4">
                {launchChecklist.map((item, index) => (
                  <div key={item} className="flex gap-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#3fc1c0] text-black">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-base font-bold leading-7 text-white">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[32px] border border-[#3fc1c0]/30 bg-[#3fc1c0]/10 p-6">
                <div className="mb-3 flex items-center gap-2 text-lg font-black text-white">
                  <Crown size={20} className="text-[#3fc1c0]" />
                  推荐升级方向
                </div>
                <p className="max-w-3xl text-sm font-semibold leading-7 text-slate-300">
                  V1.0 先卖模板资产包。V1.1 增加标题系统订阅。V1.2 增加文案引擎批量生成。V2.0 再接入用户素材上传、行业变量库和一键导出商品页。
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-4 text-xs font-black uppercase tracking-[0.18em] text-slate-600 sm:flex-row">
          <span>Banana Clone Visual OS</span>
          <span>Template Library + Title System + Copy Engine</span>
        </div>
      </footer>
    </main>
  );
}
