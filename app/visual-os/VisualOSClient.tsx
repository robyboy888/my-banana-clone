"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BadgeDollarSign,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Gem,
  Layers3,
  Library,
  Mountain,
  Network,
  Orbit,
  Palette,
  SlidersHorizontal,
  TreePine,
  Wand2,
  Waves,
  Workflow,
} from "lucide-react";

type ModelId = "iceberg" | "mountain" | "tree" | "ocean" | "city" | "cosmos";
type StyleId = "apple" | "luxury" | "oriental" | "tech";
type TabId = "system" | "models" | "prompt" | "templates";
type TargetModelId = "gpt-image" | "midjourney" | "stable-diffusion" | "leonardo";

type VisualModel = {
  id: ModelId;
  name: string;
  category: string;
  visualObject: string;
  structureType: string;
  bestFor: string[];
  layerMapping: {
    top: string;
    middle: string;
    bottom: string;
  };
  visualFeatures: string[];
  lightingStyle: string;
  colorStrategy: string;
  promptModifier: string;
  icon: ReactNode;
  accent: string;
  glow: string;
};

type StylePreset = {
  id: StyleId;
  name: string;
  tone: string;
  lighting: string;
  color: string;
  atmosphere: string;
  usage: string;
};

type TemplateCard = {
  name: string;
  scenario: string;
  input: string;
  logic: string;
  prompt: string;
  model: ModelId;
};

type TargetModel = {
  id: TargetModelId;
  name: string;
  platform: string;
  copyMode: string;
  notes: string[];
};

const visualModels: VisualModel[] = [
  {
    id: "iceberg",
    name: "冰山模型",
    category: "hidden structure",
    visualObject: "iceberg",
    structureType: "上下分层",
    bestFor: ["心理学", "品牌", "用户决策", "内容传播"],
    layerMapping: {
      top: "显性现象",
      middle: "过渡认知",
      bottom: "隐性驱动",
    },
    visualFeatures: ["水面分割", "巨大底部体积", "透明深海层次", "90% 隐性结构"],
    lightingStyle: "top bright, bottom dark, underwater depth",
    colorStrategy: "white ice, deep blue ocean, subtle cyan glow",
    promptModifier: "underwater 90% massive hidden structure, clean annotations",
    icon: <Waves className="h-5 w-5" />,
    accent: "border-cyan-300/35 bg-cyan-300/10 text-cyan-100",
    glow: "from-cyan-300/30 via-blue-500/10 to-transparent",
  },
  {
    id: "mountain",
    name: "山体模型",
    category: "growth hierarchy",
    visualObject: "mountain",
    structureType: "向上递进",
    bestFor: ["成长路径", "用户旅程", "人生路径", "目标管理"],
    layerMapping: {
      top: "目标顶峰",
      middle: "攀登过程",
      bottom: "基础起点",
    },
    visualFeatures: ["清晰坡面", "上升路径", "顶峰光源", "底部厚重"],
    lightingStyle: "golden summit light, cool mountain shadows",
    colorStrategy: "slate gray, muted blue, warm gold highlight",
    promptModifier: "grand mountain hierarchy, upward path, summit glow",
    icon: <Mountain className="h-5 w-5" />,
    accent: "border-amber-300/35 bg-amber-300/10 text-amber-100",
    glow: "from-amber-300/25 via-stone-400/10 to-transparent",
  },
  {
    id: "tree",
    name: "树模型",
    category: "root-driven",
    visualObject: "tree",
    structureType: "上下镜像",
    bestFor: ["女性 IP", "情绪表达", "有机品牌", "组织文化"],
    layerMapping: {
      top: "外在表现",
      middle: "结构连接",
      bottom: "根系驱动",
    },
    visualFeatures: ["树冠柔和", "根系发光", "上下对照", "自然生长感"],
    lightingStyle: "soft diffused light, roots glowing gently",
    colorStrategy: "ivory, soft pink, moss green, deep brown",
    promptModifier: "delicate tree with luminous roots, poetic organic metaphor",
    icon: <TreePine className="h-5 w-5" />,
    accent: "border-emerald-300/35 bg-emerald-300/10 text-emerald-100",
    glow: "from-emerald-300/25 via-rose-200/10 to-transparent",
  },
  {
    id: "ocean",
    name: "深海模型",
    category: "depth and unknown",
    visualObject: "ocean depth",
    structureType: "纵深渐变",
    bestFor: ["潜意识", "情绪", "风险", "未知系统"],
    layerMapping: {
      top: "表层认知",
      middle: "模糊区域",
      bottom: "未知深渊",
    },
    visualFeatures: ["垂直深度", "雾化分层", "微弱光束", "未知黑域"],
    lightingStyle: "thin surface light fading into abyss",
    colorStrategy: "blue gradient to black, low saturation",
    promptModifier: "deep ocean vertical gradient, unknown abyss, minimal labels",
    icon: <Waves className="h-5 w-5" />,
    accent: "border-blue-300/35 bg-blue-300/10 text-blue-100",
    glow: "from-blue-300/25 via-indigo-500/10 to-transparent",
  },
  {
    id: "city",
    name: "城市系统模型",
    category: "complex systems",
    visualObject: "city system",
    structureType: "表面 + 底层系统",
    bestFor: ["商业系统", "平台产品", "AI 架构", "运营模型"],
    layerMapping: {
      top: "表层界面",
      middle: "运行结构",
      bottom: "底层系统",
    },
    visualFeatures: ["城市截面", "地下网络", "发光线路", "系统节点"],
    lightingStyle: "cinematic city light with glowing underground network",
    colorStrategy: "black, graphite, electric blue, white UI highlights",
    promptModifier: "futuristic city cutaway, glowing infrastructure network",
    icon: <Building2 className="h-5 w-5" />,
    accent: "border-sky-300/35 bg-sky-300/10 text-sky-100",
    glow: "from-sky-300/25 via-cyan-500/10 to-transparent",
  },
  {
    id: "cosmos",
    name: "宇宙模型",
    category: "cognitive dimensions",
    visualObject: "cosmos",
    structureType: "无限层级",
    bestFor: ["哲学", "认知升级", "高维表达", "愿景叙事"],
    layerMapping: {
      top: "已知世界",
      middle: "可探索边界",
      bottom: "未知维度",
    },
    visualFeatures: ["星云层次", "轨道结构", "尺度对比", "高维深空"],
    lightingStyle: "cosmic rim light, star field depth",
    colorStrategy: "black, silver, violet, sparse gold",
    promptModifier: "cosmic layered dimensions, infinite depth, elegant star field",
    icon: <Orbit className="h-5 w-5" />,
    accent: "border-violet-300/35 bg-violet-300/10 text-violet-100",
    glow: "from-violet-300/25 via-fuchsia-500/10 to-transparent",
  },
];

const stylePresets: StylePreset[] = [
  {
    id: "apple",
    name: "Apple 极简",
    tone: "清冷、留白、克制",
    lighting: "soft studio light, clean white highlights, subtle shadow",
    color: "white, silver, deep blue, low saturation",
    atmosphere: "ultra clean, premium, minimal infographic, no clutter",
    usage: "知识海报、课程封面、品牌解释页",
  },
  {
    id: "luxury",
    name: "奢侈品风",
    tone: "高级、稀缺、广告大片",
    lighting: "dramatic luxury campaign lighting, glossy highlights",
    color: "black, champagne gold, ivory, deep shadow",
    atmosphere: "editorial luxury poster, refined material texture",
    usage: "品牌大片、高客单服务、审美溢价产品",
  },
  {
    id: "oriental",
    name: "东方美学",
    tone: "诗性、留白、自然",
    lighting: "soft mist light, calm dawn atmosphere, gentle diffusion",
    color: "ink black, warm ivory, jade green, muted rose",
    atmosphere: "quiet eastern aesthetic, poetic composition, breathing space",
    usage: "情绪表达、女性 IP、文化类内容",
  },
  {
    id: "tech",
    name: "科技未来",
    tone: "系统、精密、未来感",
    lighting: "cinematic neon rim light, luminous data lines",
    color: "graphite black, electric blue, cyan, clean white",
    atmosphere: "futuristic system diagram, high precision, commercial UI",
    usage: "AI 产品、平台架构、商业系统说明",
  },
];

const targetModels: TargetModel[] = [
  {
    id: "gpt-image",
    name: "GPT Image",
    platform: "OpenAI / API / ChatGPT 图像生成",
    copyMode: "Prompt + JSON 参数",
    notes: ["适合文字清晰、信息图、海报结构", "尺寸和质量作为参数组复制", "保留自然语言 Prompt 的完整结构"],
  },
  {
    id: "midjourney",
    name: "Midjourney",
    platform: "Discord / Web prompt bar",
    copyMode: "Prompt + 参数尾巴",
    notes: ["参数放在提示词最后", "用 --ar 固定竖版比例", "用 --no 做负面约束"],
  },
  {
    id: "stable-diffusion",
    name: "SDXL / Flux",
    platform: "Stable Diffusion WebUI / ComfyUI",
    copyMode: "Prompt + Negative + txt2img 参数",
    notes: ["适合需要 seed 复现和批量调参", "Flux 使用低 CFG", "SDXL 可提高 steps 和 CFG"],
  },
  {
    id: "leonardo",
    name: "Leonardo / Ideogram",
    platform: "Leonardo AI / Ideogram class models",
    copyMode: "Prompt + Advanced Settings",
    notes: ["适合商业海报和带字图", "Negative prompt 要具体", "保持固定 seed 方便 A/B 对比"],
  },
];

const categoryRules = [
  { label: "心理学 / 人性", model: "iceberg" as ModelId },
  { label: "品牌 / 商业", model: "city" as ModelId },
  { label: "成长 / 路径", model: "mountain" as ModelId },
  { label: "情绪 / 女性", model: "tree" as ModelId },
  { label: "风险 / 未知", model: "ocean" as ModelId },
  { label: "哲学 / 高维", model: "cosmos" as ModelId },
];

const systemModules = [
  {
    name: "Theory Engine",
    label: "把一句理论变成结构数据",
    detail: "识别主题、类别、核心总结和隐含层级。",
  },
  {
    name: "Structure Engine",
    label: "统一为 top / middle / bottom",
    detail: "默认强化 bottom 90% 的深层驱动，让画面有解释力。",
  },
  {
    name: "Metaphor Engine",
    label: "抽象概念映射到视觉物",
    detail: "从冰山、山体、树、深海、城市、宇宙中选择最合适模型。",
  },
  {
    name: "Style Engine",
    label: "把同一理论换成商业风格",
    detail: "Apple、奢侈品、东方美学、科技未来四套基础风格。",
  },
  {
    name: "Prompt Engine",
    label: "输出可直接生成的海报 Prompt",
    detail: "固定 9:16、标题、副标题、层级、标注、光色和底部总结。",
  },
];

const templates: TemplateCard[] = [
  {
    name: "冰山认知海报",
    scenario: "心理学、品牌、人性洞察、知识 IP",
    input: "主题 + 三层结构 + 核心本质句",
    logic: "显性现象只占 10%, 深层动因占 90%。",
    prompt:
      "Apple minimal iceberg poster, top layer is visible behavior, middle layer is transition cognition, bottom layer is hidden motivation, add subtle 90% underwater indicator.",
    model: "iceberg",
  },
  {
    name: "柔性树模型",
    scenario: "女性 IP、情绪内容、美学品牌、关系议题",
    input: "外在表现 + 气质流动 + 情绪根系",
    logic: "外在美不是根本吸引力, 根系才是持续生长的来源。",
    prompt:
      "Poetic soft poster, delicate tree above ground, luminous roots below, dreamy feminine soft light, ivory and muted rose palette.",
    model: "tree",
  },
  {
    name: "城市系统剖面",
    scenario: "AI 产品、商业平台、运营模型、组织系统",
    input: "用户界面 + 运行流程 + 底层基础设施",
    logic: "用户看到的是界面, 真正的壁垒在地下系统。",
    prompt:
      "Futuristic city cutaway poster, surface interface layer, operating structure layer, underground glowing infrastructure network, high precision labels.",
    model: "city",
  },
  {
    name: "山体成长路径",
    scenario: "成长方法、职业路线、课程训练营、目标管理",
    input: "起点 + 攀登过程 + 顶峰目标",
    logic: "把成长从抽象口号变成可攀登的路径。",
    prompt:
      "Grand mountain hierarchy poster, foundation at base, climbing route in middle, glowing summit target, minimal milestones and premium editorial composition.",
    model: "mountain",
  },
  {
    name: "深海风险洞察",
    scenario: "风险判断、潜意识、情绪深层、未知问题",
    input: "表层信号 + 模糊区 + 未知深渊",
    logic: "越往下越不可见, 也越决定结果。",
    prompt:
      "Deep ocean conceptual poster, vertical gradient from surface light to black abyss, sparse annotations, unknown depth and subtle pressure atmosphere.",
    model: "ocean",
  },
  {
    name: "宇宙高维认知",
    scenario: "哲学表达、愿景叙事、认知升级、高端封面",
    input: "已知 + 可探索边界 + 未知维度",
    logic: "用尺度感表达认知边界, 让抽象观点变得高级。",
    prompt:
      "Cosmic layered dimensions poster, known orbit, exploration boundary, unknown deep space, elegant star field, clean premium typography.",
    model: "cosmos",
  },
];

const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
  { id: "system", label: "操作系统", icon: <Workflow className="h-4 w-4" /> },
  { id: "models", label: "隐喻模型库", icon: <Library className="h-4 w-4" /> },
  { id: "prompt", label: "Prompt 引擎", icon: <Wand2 className="h-4 w-4" /> },
  { id: "templates", label: "可售卖模板", icon: <BadgeDollarSign className="h-4 w-4" /> },
];

function getModel(id: ModelId) {
  return visualModels.find((model) => model.id === id) ?? visualModels[0];
}

function getStyle(id: StyleId) {
  return stylePresets.find((style) => style.id === id) ?? stylePresets[0];
}

function getTargetModel(id: TargetModelId) {
  return targetModels.find((model) => model.id === id) ?? targetModels[0];
}

function getSeed(theoryTitle: string, modelId: ModelId, styleId: StyleId) {
  const source = `${theoryTitle}-${modelId}-${styleId}`;
  return Array.from(source).reduce((sum, char) => sum + char.charCodeAt(0), 2174) % 900000000;
}

function buildTheoryStructure(theory: string, model: VisualModel) {
  const normalized = theory.trim();

  if (/弗洛伊德|意识|潜意识/.test(normalized)) {
    return {
      title: "弗洛伊德意识理论",
      subtitle: "Consciousness / Preconsciousness / Unconsciousness",
      top: "意识 Consciousness",
      middle: "前意识 Preconsciousness",
      bottom: "潜意识 Unconsciousness",
      summary: "人类行为由潜意识驱动",
      category: "心理学",
    };
  }

  if (/品牌|商业|增长|平台/.test(normalized)) {
    return {
      title: normalized || "品牌增长系统",
      subtitle: "Surface Interface / Operating System / Hidden Infrastructure",
      top: "表层感知 Surface Perception",
      middle: "运行机制 Operating Structure",
      bottom: "底层壁垒 Hidden Infrastructure",
      summary: `${normalized || "品牌"}的本质是看不见的系统能力`,
      category: "商业",
    };
  }

  if (/成长|路径|职业|人生|目标/.test(normalized)) {
    return {
      title: normalized || "成长路径模型",
      subtitle: "Goal / Process / Foundation",
      top: "目标顶峰 Goal",
      middle: "攀登过程 Process",
      bottom: "基础起点 Foundation",
      summary: `${normalized || "成长"}不是跳跃, 而是持续攀登`,
      category: "成长",
    };
  }

  return {
    title: normalized || "深层认知模型",
    subtitle: `${model.layerMapping.top} / ${model.layerMapping.middle} / ${model.layerMapping.bottom}`,
    top: model.layerMapping.top,
    middle: model.layerMapping.middle,
    bottom: model.layerMapping.bottom,
    summary: `${normalized || "主题"}的本质藏在深层结构里`,
    category: model.bestFor[0],
  };
}

function buildPrompt(theory: ReturnType<typeof buildTheoryStructure>, model: VisualModel, style: StylePreset) {
  return `9:16 vertical high-end conceptual poster
Title: ${theory.title} · ${model.name}
Subtitle: ${theory.subtitle}

Main visual: A large ${model.visualObject} centered in the scene

Structure:
Top layer: ${theory.top}
Middle layer: ${theory.middle}
Bottom layer: ${theory.bottom}

Bottom layer occupies 90% of the total volume
Add "90%" indicator subtly

Annotations: thin lines, minimal labels, infographic style
Lighting: ${style.lighting}; ${model.lightingStyle}
Color: ${style.color}; ${model.colorStrategy}
Atmosphere: ${style.atmosphere}
Prompt modifier: ${model.promptModifier}

Bottom statement: 这就是${theory.summary}
Ultra clean, high detail, no clutter`;
}

function buildNegativePrompt(model: VisualModel) {
  const shared = [
    "low resolution",
    "jpeg artifacts",
    "watermark",
    "signature",
    "messy typography",
    "misspelled labels",
    "cluttered composition",
    "random extra text",
    "cropped poster",
    "low contrast annotations",
  ];

  const modelSpecific: Record<ModelId, string[]> = {
    iceberg: ["flat iceberg", "tiny underwater part", "unclear waterline", "cartoon ice"],
    mountain: ["flat landscape", "unclear path", "weak summit", "busy background"],
    tree: ["dead tree", "tangled roots", "harsh neon", "chaotic branches"],
    ocean: ["shallow water", "bright bottom", "unclear depth", "busy marine life"],
    city: ["random skyscrapers", "no underground system", "messy circuitry", "cyberpunk clutter"],
    cosmos: ["random planets", "crowded stars", "cheap sci-fi poster", "low depth"],
  };

  return [...shared, ...modelSpecific[model.id]].join(", ");
}

function buildParameterGroup(
  targetId: TargetModelId,
  theory: ReturnType<typeof buildTheoryStructure>,
  model: VisualModel,
  style: StylePreset,
) {
  const seed = getSeed(theory.title, model.id, style.id);
  const negativePrompt = buildNegativePrompt(model);

  if (targetId === "midjourney") {
    return [
      "--ar 2:3",
      "--v 7",
      "--style raw",
      "--s 180",
      "--c 8",
      "--q 1",
      `--seed ${seed}`,
      `--no ${negativePrompt}`,
    ].join(" ");
  }

  if (targetId === "stable-diffusion") {
    return `model: SDXL or FLUX.1
size: 1024x1536
sampler: euler
scheduler: normal
steps: ${model.id === "city" || model.id === "cosmos" ? 32 : 28}
cfg_scale: ${model.id === "city" || model.id === "cosmos" ? 5.5 : 4.5}
seed: ${seed}
batch_size: 4
negative_prompt: ${negativePrompt}`;
  }

  if (targetId === "leonardo") {
    return `model: Ideogram 3.0 or Leonardo Kino XL
aspect_ratio: 2:3
resolution: 1024x1536
style: ${style.name}
contrast: medium-high
alchemy: on
prompt_magic: on
seed: ${seed}
negative_prompt: ${negativePrompt}`;
  }

  return JSON.stringify(
    {
      model: "gpt-image-2",
      size: "1024x1536",
      outputQuality: "high",
      background: "opaque",
      format: "png",
      seed,
      intent: "vertical high-end conceptual poster",
      avoid: negativePrompt,
    },
    null,
    2,
  );
}

function buildModelReadyPrompt(prompt: string, parameterGroup: string, targetId: TargetModelId) {
  if (targetId === "midjourney") {
    return `${prompt.replaceAll("\n", " ")} ${parameterGroup}`;
  }

  if (targetId === "gpt-image") {
    return `PROMPT
${prompt}

PARAMETERS
${parameterGroup}`;
  }

  return `POSITIVE PROMPT
${prompt}

PARAMETER GROUP
${parameterGroup}`;
}

export default function VisualOSClient() {
  const [activeTab, setActiveTab] = useState<TabId>("system");
  const [theoryInput, setTheoryInput] = useState("弗洛伊德意识理论");
  const [selectedModelId, setSelectedModelId] = useState<ModelId>("iceberg");
  const [selectedStyleId, setSelectedStyleId] = useState<StyleId>("apple");
  const [selectedTargetId, setSelectedTargetId] = useState<TargetModelId>("gpt-image");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedModel = useMemo(() => getModel(selectedModelId), [selectedModelId]);
  const selectedStyle = useMemo(() => getStyle(selectedStyleId), [selectedStyleId]);
  const selectedTarget = useMemo(() => getTargetModel(selectedTargetId), [selectedTargetId]);
  const theory = useMemo(() => buildTheoryStructure(theoryInput, selectedModel), [theoryInput, selectedModel]);
  const prompt = useMemo(() => buildPrompt(theory, selectedModel, selectedStyle), [theory, selectedModel, selectedStyle]);
  const parameterGroup = useMemo(
    () => buildParameterGroup(selectedTargetId, theory, selectedModel, selectedStyle),
    [selectedTargetId, theory, selectedModel, selectedStyle],
  );
  const modelReadyPrompt = useMemo(
    () => buildModelReadyPrompt(prompt, parameterGroup, selectedTargetId),
    [prompt, parameterGroup, selectedTargetId],
  );
  const selectedTemplate = templates.find((template) => template.model === selectedModelId) ?? templates[0];

  async function copyText(key: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1400);
  }

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20rem] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-18rem] right-[-8rem] h-[36rem] w-[36rem] rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition hover:border-white/25 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            返回主入口
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            Visual Metaphor Engine V1.0
          </div>
        </header>

        <section className="grid gap-8 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
              <BrainCircuit className="h-4 w-4 text-cyan-200" />
              Theory to premium poster prompt
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-normal text-white sm:text-6xl lg:text-7xl">
              视觉内容生成操作系统
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
              输入一个理论或主题，系统自动拆成结构层级，匹配视觉隐喻模型，再套入商业风格，输出可直接用于 AI 出图的高端海报 Prompt。
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Theory", short: "Theory" },
                { label: "Structure", short: "Struct" },
                { label: "Metaphor", short: "Meta" },
                { label: "Style", short: "Style" },
                { label: "Prompt", short: "Prompt" },
              ].map((item, index) => (
                <div key={item.label} className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-2 sm:p-3">
                  <div className="mb-5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-black sm:mb-8 sm:h-8 sm:w-8">
                    {index + 1}
                  </div>
                  <div className="truncate text-[8px] font-bold uppercase tracking-normal text-white/62 sm:text-[10px] sm:tracking-[0.14em]">
                    <span className="sm:hidden">{item.short}</span>
                    <span className="hidden sm:inline">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/82">
              核心壁垒不是提示词，而是自动结构能力、隐喻映射能力和风格控制能力。
            </div>
          </div>
        </section>

        <section className="grid flex-1 gap-5 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "border-white/30 bg-white text-black"
                      : "border-white/10 bg-black/20 text-white/66 hover:border-white/25 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <label className="block text-xs font-bold uppercase tracking-[0.18em] text-white/45">理论 / 主题输入</label>
              <textarea
                value={theoryInput}
                onChange={(event) => setTheoryInput(event.target.value)}
                className="min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/45"
                placeholder="例如: 弗洛伊德意识理论、品牌增长系统、女性吸引力、AI 平台壁垒"
              />

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45">自动模型选择</div>
                <div className="flex flex-wrap gap-2">
                  {categoryRules.map((rule) => (
                    <button
                      key={rule.label}
                      onClick={() => setSelectedModelId(rule.model)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        selectedModelId === rule.model
                          ? "border-cyan-200 bg-cyan-200 text-black"
                          : "border-white/10 bg-white/[0.04] text-white/58 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      {rule.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/45">风格引擎</div>
                <div className="grid gap-2">
                  {stylePresets.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selectedStyleId === style.id
                          ? "border-amber-200 bg-amber-200 text-black"
                          : "border-white/10 bg-white/[0.04] text-white/66 hover:border-white/25 hover:text-white"
                      }`}
                    >
                      <div className="text-sm font-bold">{style.name}</div>
                      <div className={`mt-1 text-xs ${selectedStyleId === style.id ? "text-black/60" : "text-white/42"}`}>{style.tone}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-4 backdrop-blur sm:p-5">
            {activeTab === "system" && (
              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div className="grid gap-3">
                  {systemModules.map((module, index) => (
                    <div key={module.name} className="rounded-3xl border border-white/10 bg-black/22 p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-black text-black">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/72">{module.name}</div>
                          <h2 className="mt-1 text-xl font-black tracking-normal text-white">{module.label}</h2>
                          <p className="mt-2 text-sm leading-6 text-white/56">{module.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/26 p-5">
                  <div className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
                    <Network className="h-4 w-4 text-cyan-200" />
                    当前自动解析
                  </div>
                  <div className="space-y-3">
                    {[
                      ["理论", theory.title],
                      ["类别", theory.category],
                      ["模型", selectedModel.name],
                      ["风格", selectedStyle.name],
                      ["核心总结", theory.summary],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">{label}</div>
                        <div className="mt-1 text-sm font-semibold leading-6 text-white/82">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "models" && (
              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div className="grid gap-3 md:grid-cols-2">
                  {visualModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      className={`group rounded-3xl border p-5 text-left transition ${
                        selectedModelId === model.id
                          ? `${model.accent} shadow-xl shadow-black/25`
                          : "border-white/10 bg-black/22 text-white/70 hover:border-white/25 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                          {model.icon}
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/58">
                          {model.structureType}
                        </span>
                      </div>
                      <h2 className="mt-5 text-xl font-black tracking-normal text-white">{model.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/52">{model.category}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {model.bestFor.slice(0, 3).map((item) => (
                          <span key={item} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/58">
                            {item}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/28 p-5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedModel.glow}`} />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
                      <Layers3 className="h-4 w-4 text-cyan-200" />
                      {selectedModel.name} JSON Schema
                    </div>
                    <div className="space-y-3 text-sm">
                      <SchemaRow label="visual_object" value={selectedModel.visualObject} />
                      <SchemaRow label="structure_type" value={selectedModel.structureType} />
                      <SchemaRow label="top" value={selectedModel.layerMapping.top} />
                      <SchemaRow label="middle" value={selectedModel.layerMapping.middle} />
                      <SchemaRow label="bottom" value={selectedModel.layerMapping.bottom} />
                      <SchemaRow label="lighting_style" value={selectedModel.lightingStyle} />
                      <SchemaRow label="color_strategy" value={selectedModel.colorStrategy} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "prompt" && (
              <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
                <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
                  <div className="mb-5 flex items-center gap-2 text-sm font-bold text-white">
                    <Palette className="h-4 w-4 text-amber-200" />
                    结构预览
                  </div>
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#05070a] p-5">
                    <div className={`absolute inset-0 bg-gradient-to-b ${selectedModel.glow}`} />
                    <div className="relative space-y-3">
                      <LayerBlock label="Top 10%" value={theory.top} tone="bg-white text-black" />
                      <LayerBlock label="Middle" value={theory.middle} tone="bg-cyan-200/18 text-cyan-50" />
                      <LayerBlock label="Bottom 90%" value={theory.bottom} tone="min-h-36 bg-blue-500/14 text-blue-50" />
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/60">
                    当前模板建议: <span className="font-bold text-white">{selectedTemplate.name}</span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                      <SlidersHorizontal className="h-4 w-4 text-cyan-200" />
                      目标模型
                    </div>
                    <div className="grid gap-2">
                      {targetModels.map((target) => (
                        <button
                          key={target.id}
                          onClick={() => setSelectedTargetId(target.id)}
                          className={`rounded-2xl border p-3 text-left transition ${
                            selectedTargetId === target.id
                              ? "border-cyan-200 bg-cyan-200 text-black"
                              : "border-white/10 bg-black/25 text-white/66 hover:border-white/25 hover:text-white"
                          }`}
                        >
                          <div className="text-sm font-black">{target.name}</div>
                          <div className={`mt-1 text-xs ${selectedTargetId === target.id ? "text-black/62" : "text-white/42"}`}>
                            {target.copyMode}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="min-w-0 space-y-4">
                  <div className="rounded-3xl border border-cyan-300/18 bg-cyan-300/10 p-5">
                    <div className="mb-3 flex items-center gap-2 text-sm font-bold text-cyan-50">
                      <ClipboardCheck className="h-4 w-4" />
                      复制工作流
                    </div>
                    <div className="grid gap-3 text-sm leading-6 text-cyan-50/74 md:grid-cols-3">
                      <div className="rounded-2xl border border-cyan-200/15 bg-black/20 p-4">
                        <div className="font-black text-white">1. 复制提示词模板</div>
                        <div className="mt-1">粘到主 Prompt 输入框。</div>
                      </div>
                      <div className="rounded-2xl border border-cyan-200/15 bg-black/20 p-4">
                        <div className="font-black text-white">2. 复制参数组</div>
                        <div className="mt-1">粘到高级设置或参数尾部。</div>
                      </div>
                      <div className="rounded-2xl border border-cyan-200/15 bg-black/20 p-4">
                        <div className="font-black text-white">3. 直接生成</div>
                        <div className="mt-1">当前目标: {selectedTarget.name}。</div>
                      </div>
                    </div>
                    <div className="mt-4 text-xs leading-5 text-cyan-50/55">
                      {selectedTarget.platform}: {selectedTarget.notes.join(" / ")}
                    </div>
                  </div>

                  <CopyOutputPanel
                    label="Prompt Template"
                    title="提示词模板"
                    description="复制后粘到模型的主提示词输入框。"
                    value={prompt}
                    copied={copiedKey === "prompt"}
                    onCopy={() => copyText("prompt", prompt)}
                  />

                  <CopyOutputPanel
                    label="Parameter Group"
                    title="参数组"
                    description={`按 ${selectedTarget.name} 的输入方式生成。`}
                    value={parameterGroup}
                    copied={copiedKey === "params"}
                    onCopy={() => copyText("params", parameterGroup)}
                  />

                  <CopyOutputPanel
                    label="Ready-to-Paste Pack"
                    title="整合版一键粘贴包"
                    description="适合先保存到素材库，或发给别人复用。"
                    value={modelReadyPrompt}
                    copied={copiedKey === "ready"}
                    onCopy={() => copyText("ready", modelReadyPrompt)}
                  />

                  <div className="rounded-3xl border border-white/10 bg-black/24 p-5">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">Reference Rules</div>
                    <div className="mt-4 grid gap-3 text-sm leading-6 text-white/58 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        Midjourney: 参数放在提示词末尾，用 `--ar`、`--s`、`--c`、`--q`、`--seed` 和 `--no` 控制比例、风格、变化、质量和负面约束。
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        GPT Image: 把海报结构写进提示词，把尺寸、质量、背景、格式作为参数组管理。
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        SDXL / Flux: 参数组保留 seed、size、sampler、steps、CFG 和 negative prompt，方便复现和批量调参。
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                        Leonardo / Ideogram: negative prompt 使用具体缺陷词，避免和正向提示词冲突。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-4">
                  {stylePresets.map((style) => (
                    <div key={style.id} className="rounded-3xl border border-white/10 bg-black/22 p-5">
                      <Gem className="h-5 w-5 text-amber-200" />
                      <h2 className="mt-4 text-lg font-black tracking-normal text-white">{style.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/50">{style.usage}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {templates.map((template) => {
                    const model = getModel(template.model);
                    return (
                      <div key={template.name} className="rounded-3xl border border-white/10 bg-black/24 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/38">{model.name}</div>
                            <h2 className="mt-1 text-xl font-black tracking-normal text-white">{template.name}</h2>
                          </div>
                          <BadgeDollarSign className="h-5 w-5 text-emerald-200" />
                        </div>
                        <div className="mt-4 grid gap-3 text-sm leading-6 text-white/58">
                          <TemplateRow label="适用场景" value={template.scenario} />
                          <TemplateRow label="输入要求" value={template.input} />
                          <TemplateRow label="自动逻辑" value={template.logic} />
                        </div>
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-white/64">
                          {template.prompt}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function SchemaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/36">{label}</div>
      <div className="mt-1 leading-6 text-white/72">{value}</div>
    </div>
  );
}

function LayerBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 p-4 ${tone}`}>
      <div className="text-[10px] font-black uppercase tracking-[0.18em] opacity-65">{label}</div>
      <div className="mt-2 text-sm font-bold leading-6">{value}</div>
    </div>
  );
}

function CopyOutputPanel({
  label,
  title,
  description,
  value,
  copied,
  onCopy,
}: {
  label: string;
  title: string;
  description: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-black/28 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-white/42">{label}</div>
          <h2 className="mt-1 text-2xl font-black tracking-normal text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-white/50">{description}</p>
        </div>
        <button
          onClick={onCopy}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-cyan-100"
        >
          <Copy className="h-4 w-4" />
          {copied ? "已复制" : "复制"}
        </button>
      </div>
      <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-[#05070a] p-5 text-sm leading-7 text-white/76">
        {value}
      </pre>
    </div>
  );
}

function TemplateRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="font-bold text-white/86">{label}: </span>
      <span>{value}</span>
    </div>
  );
}
