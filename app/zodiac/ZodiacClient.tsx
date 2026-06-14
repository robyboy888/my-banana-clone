"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Heart,
  MoonStar,
  Search,
  Sparkles,
  Star,
  SunMedium,
  WalletCards,
} from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Zodiac = {
  id: string;
  name: string;
  english: string;
  symbol: string;
  range: string;
  monthStart: number;
  dayStart: number;
  monthEnd: number;
  dayEnd: number;
  element: string;
  modality: string;
  ruler: string;
  color: string;
  accent: string;
  luckyColor: string;
  luckyNumber: string;
  luckyTime: string;
  traits: string[];
  personality: string;
  love: string;
  career: string;
  money: string;
  advice: string;
  match: string;
};

const ZODIACS: Zodiac[] = [
  { id: "aries", name: "白羊座", english: "Aries", symbol: "♈", range: "3/21 - 4/19", monthStart: 3, dayStart: 21, monthEnd: 4, dayEnd: 19, element: "火象", modality: "开创", ruler: "火星", color: "#ff5a4f", accent: "#ffd06b", luckyColor: "珊瑚红", luckyNumber: "1、9", luckyTime: "09:00 - 11:00", traits: ["主动", "坦率", "行动派"], personality: "白羊座重视速度和现场感，遇到目标会先动起来，再边做边修正。", love: "适合直接表达好感，避免把急切变成压力。", career: "适合启动新项目、争取资源、做需要决断的工作。", money: "冲动消费指数偏高，先列清单再下单更稳。", advice: "今天的好运来自先开局，但要留一个复盘时间。", match: "狮子座、射手座" },
  { id: "taurus", name: "金牛座", english: "Taurus", symbol: "♉", range: "4/20 - 5/20", monthStart: 4, dayStart: 20, monthEnd: 5, dayEnd: 20, element: "土象", modality: "固定", ruler: "金星", color: "#56c786", accent: "#f2c96d", luckyColor: "橄榄绿", luckyNumber: "2、6", luckyTime: "14:00 - 16:00", traits: ["稳定", "审美", "耐心"], personality: "金牛座相信可持续的价值，做决定慢，但一旦确认就很有韧性。", love: "稳定陪伴比夸张承诺更加分。", career: "适合梳理预算、优化流程、打磨长期作品。", money: "适合做保守规划，少碰高波动选择。", advice: "把节奏放慢，幸运会藏在细节和手感里。", match: "处女座、摩羯座" },
  { id: "gemini", name: "双子座", english: "Gemini", symbol: "♊", range: "5/21 - 6/21", monthStart: 5, dayStart: 21, monthEnd: 6, dayEnd: 21, element: "风象", modality: "变动", ruler: "水星", color: "#55b7ff", accent: "#ffe66d", luckyColor: "浅黄色", luckyNumber: "3、5", luckyTime: "10:30 - 12:30", traits: ["好奇", "表达", "灵活"], personality: "双子座善于连接信息与人，越是开放的交流场景越能发挥。", love: "轻松聊天会比严肃试探更自然。", career: "适合写作、汇报、谈判、学习新工具。", money: "容易被新鲜感打动，订阅和小额支出要留意。", advice: "把灵感记录下来，别让好点子只停在聊天里。", match: "天秤座、水瓶座" },
  { id: "cancer", name: "巨蟹座", english: "Cancer", symbol: "♋", range: "6/22 - 7/22", monthStart: 6, dayStart: 22, monthEnd: 7, dayEnd: 22, element: "水象", modality: "开创", ruler: "月亮", color: "#8dd7ff", accent: "#f7f0d8", luckyColor: "月光白", luckyNumber: "2、7", luckyTime: "20:00 - 22:00", traits: ["敏感", "照顾", "记忆力"], personality: "巨蟹座擅长感知情绪和建立安全感，重视熟悉关系中的信任。", love: "适合营造舒服的相处环境，也要说出自己的需求。", career: "适合客户维护、内容整理、团队支持。", money: "家庭和生活品质相关支出增加，提前设上限。", advice: "照顾别人之前，也给自己留一点安静空间。", match: "天蝎座、双鱼座" },
  { id: "leo", name: "狮子座", english: "Leo", symbol: "♌", range: "7/23 - 8/22", monthStart: 7, dayStart: 23, monthEnd: 8, dayEnd: 22, element: "火象", modality: "固定", ruler: "太阳", color: "#ff9f3d", accent: "#fff06a", luckyColor: "金色", luckyNumber: "1、8", luckyTime: "12:00 - 14:00", traits: ["自信", "创造", "领导"], personality: "狮子座需要舞台感，也愿意为重要的人和作品投入热情。", love: "真诚赞美会打开局面，别把面子放在沟通前面。", career: "适合展示成果、提案、争取曝光。", money: "为形象和体验买单前，先区分投资和炫耀。", advice: "让作品替你发光，比单纯争取关注更有力量。", match: "白羊座、射手座" },
  { id: "virgo", name: "处女座", english: "Virgo", symbol: "♍", range: "8/23 - 9/22", monthStart: 8, dayStart: 23, monthEnd: 9, dayEnd: 22, element: "土象", modality: "变动", ruler: "水星", color: "#7fce9a", accent: "#d9f2b6", luckyColor: "鼠尾草绿", luckyNumber: "5、14", luckyTime: "08:00 - 10:00", traits: ["细致", "分析", "服务"], personality: "处女座擅长发现系统里的瑕疵，并把混乱整理成可执行步骤。", love: "少一点纠错，多一点肯定，关系会更柔和。", career: "适合做检查、排期、数据分析和文档完善。", money: "适合复盘账单，清理低效支出。", advice: "完美不是目标，稳定迭代才是你的幸运钥匙。", match: "金牛座、摩羯座" },
  { id: "libra", name: "天秤座", english: "Libra", symbol: "♎", range: "9/23 - 10/23", monthStart: 9, dayStart: 23, monthEnd: 10, dayEnd: 23, element: "风象", modality: "开创", ruler: "金星", color: "#e38cff", accent: "#9fe7ff", luckyColor: "淡粉色", luckyNumber: "6、15", luckyTime: "16:00 - 18:00", traits: ["平衡", "社交", "审美"], personality: "天秤座重视关系中的分寸与美感，善于协调不同立场。", love: "适合安排有氛围的见面，也要避免过度迁就。", career: "适合合作谈判、视觉审查、公共表达。", money: "颜值消费上升，买之前给自己一个冷静期。", advice: "真正的平衡不是讨好所有人，而是说清边界。", match: "双子座、水瓶座" },
  { id: "scorpio", name: "天蝎座", english: "Scorpio", symbol: "♏", range: "10/24 - 11/22", monthStart: 10, dayStart: 24, monthEnd: 11, dayEnd: 22, element: "水象", modality: "固定", ruler: "冥王星", color: "#8b5cf6", accent: "#ff7a90", luckyColor: "酒红色", luckyNumber: "8、11", luckyTime: "21:00 - 23:00", traits: ["洞察", "专注", "深情"], personality: "天蝎座不满足于表面答案，越复杂的问题越能激发研究欲。", love: "适合深度沟通，但不要用试探替代信任。", career: "适合调查、策略、风控、研究型任务。", money: "适合处理长期资产和债务问题，不宜情绪化操作。", advice: "把敏锐用在判断事实，而不是反复推演最坏情况。", match: "巨蟹座、双鱼座" },
  { id: "sagittarius", name: "射手座", english: "Sagittarius", symbol: "♐", range: "11/23 - 12/21", monthStart: 11, dayStart: 23, monthEnd: 12, dayEnd: 21, element: "火象", modality: "变动", ruler: "木星", color: "#f97316", accent: "#fef08a", luckyColor: "紫罗兰", luckyNumber: "3、12", luckyTime: "13:00 - 15:00", traits: ["自由", "探索", "乐观"], personality: "射手座需要远方感，新的知识、路线和观点都会带来能量。", love: "一起探索新地点或新话题，比重复日常更有火花。", career: "适合学习、出差、跨界合作、发布观点。", money: "旅行和课程支出增加，注意预算边界。", advice: "自由不是逃离责任，而是主动选择方向。", match: "白羊座、狮子座" },
  { id: "capricorn", name: "摩羯座", english: "Capricorn", symbol: "♑", range: "12/22 - 1/19", monthStart: 12, dayStart: 22, monthEnd: 1, dayEnd: 19, element: "土象", modality: "开创", ruler: "土星", color: "#64748b", accent: "#cbd5e1", luckyColor: "深灰蓝", luckyNumber: "4、10", luckyTime: "07:00 - 09:00", traits: ["自律", "目标", "耐力"], personality: "摩羯座习惯用长期结果衡量选择，越有结构的目标越能坚持。", love: "用实际行动表达在意，会比口头保证更有效。", career: "适合制定路线图、处理责任重的任务、推进管理事项。", money: "适合储蓄、规划和稳健投资，避免过度压缩生活。", advice: "今天适合搭框架，但也要允许自己休息。", match: "金牛座、处女座" },
  { id: "aquarius", name: "水瓶座", english: "Aquarius", symbol: "♒", range: "1/20 - 2/18", monthStart: 1, dayStart: 20, monthEnd: 2, dayEnd: 18, element: "风象", modality: "固定", ruler: "天王星", color: "#22d3ee", accent: "#a78bfa", luckyColor: "电光蓝", luckyNumber: "7、22", luckyTime: "15:00 - 17:00", traits: ["独立", "创新", "理性"], personality: "水瓶座喜欢跳出既定规则，用系统视角观察人与社会。", love: "给彼此空间会让关系更轻松，别害怕表达独特想法。", career: "适合技术尝试、社群协作、产品创意和流程革新。", money: "容易为科技和兴趣投入，先验证使用频率。", advice: "把不合群的想法做成原型，它可能就是突破口。", match: "双子座、天秤座" },
  { id: "pisces", name: "双鱼座", english: "Pisces", symbol: "♓", range: "2/19 - 3/20", monthStart: 2, dayStart: 19, monthEnd: 3, dayEnd: 20, element: "水象", modality: "变动", ruler: "海王星", color: "#60a5fa", accent: "#f0abfc", luckyColor: "海雾蓝", luckyNumber: "7、12", luckyTime: "19:00 - 21:00", traits: ["共情", "想象", "柔软"], personality: "双鱼座对氛围和情绪很敏感，想象力常常比语言先到达。", love: "浪漫表达会加分，但重要承诺要落到具体行动。", career: "适合创意、影像、音乐、疗愈和需要同理心的工作。", money: "为情绪买单的概率上升，适合设置每日预算。", advice: "保护你的感受力，也给梦想安排一个现实步骤。", match: "巨蟹座、天蝎座" },
];

function textureFromSign(sign: Zodiac) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const gradient = ctx.createRadialGradient(128, 110, 10, 128, 128, 122);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.18, sign.accent);
  gradient.addColorStop(0.72, sign.color);
  gradient.addColorStop(1, "#0b1020");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  ctx.globalAlpha = 0.34;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const x = 35 + ((i * 37) % 185);
    const y = 35 + ((i * 61) % 185);
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "108px Georgia, serif";
  ctx.fillText(sign.symbol, 128, 122);
  ctx.font = "bold 22px sans-serif";
  ctx.fillText(sign.name, 128, 205);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function starMapTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = "#02030a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1500; i += 1) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.75;
    ctx.fillStyle = Math.random() > 0.9 ? "#ffe9a6" : "#ffffff";
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() > 0.985 ? 2 : Math.random() * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function isInRange(month: number, day: number, sign: Zodiac) {
  const value = month * 100 + day;
  const start = sign.monthStart * 100 + sign.dayStart;
  const end = sign.monthEnd * 100 + sign.dayEnd;
  return start <= end ? value >= start && value <= end : value >= start || value <= end;
}

function ZodiacCanvas({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#03040c");
    scene.fog = new THREE.FogExp2("#03040c", 0.012);

    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 900);
    camera.position.set(0, 19, 34);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 18;
    controls.maxDistance = 56;
    controls.maxPolarAngle = Math.PI * 0.78;

    scene.add(new THREE.AmbientLight("#aab7ff", 0.38));
    const keyLight = new THREE.PointLight("#fff1c4", 900, 140);
    keyLight.position.set(0, 10, 6);
    scene.add(keyLight);

    const stars = new THREE.Mesh(
      new THREE.SphereGeometry(320, 48, 48),
      new THREE.MeshBasicMaterial({ map: starMapTexture(), side: THREE.BackSide }),
    );
    scene.add(stars);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(13.6, 0.035, 10, 220),
      new THREE.MeshBasicMaterial({ color: "#9fb8ff", transparent: true, opacity: 0.44 }),
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.6, 2),
      new THREE.MeshStandardMaterial({ color: "#f5d076", emissive: "#4b2f8f", emissiveIntensity: 0.18, roughness: 0.48, metalness: 0.18 }),
    );
    scene.add(core);

    const pickTargets: THREE.Mesh[] = [];
    const items = new Map<string, { sign: Zodiac; index: number; group: THREE.Group; mesh: THREE.Mesh; glow: THREE.Mesh }>();

    ZODIACS.forEach((sign, index) => {
      const angle = (index / ZODIACS.length) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * 13.6;
      const z = Math.sin(angle) * 13.6;
      const group = new THREE.Group();
      group.position.set(x, Math.sin(index * 1.7) * 0.42, z);
      group.lookAt(0, group.position.y, 0);
      scene.add(group);

      const mesh = new THREE.Mesh(
        new THREE.CircleGeometry(1.28, 64),
        new THREE.MeshBasicMaterial({ map: textureFromSign(sign), transparent: true }),
      );
      mesh.userData = { zodiacId: sign.id };
      group.add(mesh);
      pickTargets.push(mesh);

      const glow = new THREE.Mesh(
        new THREE.CircleGeometry(1.56, 64),
        new THREE.MeshBasicMaterial({ color: sign.accent, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending }),
      );
      glow.position.z = -0.03;
      group.add(glow);

      const lineMaterial = new THREE.LineBasicMaterial({ color: sign.accent, transparent: true, opacity: 0.28 });
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-0.8, 0.35, 0.02),
        new THREE.Vector3(0.35, 0.78, 0.02),
        new THREE.Vector3(0.9, -0.25, 0.02),
      ];
      const constellation = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
      constellation.position.set(0, 0, 0.08);
      group.add(constellation);
      items.set(sign.id, { sign, index, group, mesh, glow });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();
    let frame = 0;

    function resize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }

    function pointerDown(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const id = raycaster.intersectObjects(pickTargets, false)[0]?.object.userData.zodiacId;
      if (typeof id === "string") onSelectRef.current(id);
    }

    function animate() {
      const elapsed = clock.elapsedTime;
      stars.rotation.y += 0.0008;
      core.rotation.x += 0.004;
      core.rotation.y += 0.007;
      items.forEach((item, id) => {
        const selected = selectedRef.current === id;
        item.group.position.y += Math.sin(elapsed * 1.6 + item.index) * 0.0008;
        item.mesh.scale.setScalar(selected ? 1.22 + Math.sin(elapsed * 4) * 0.035 : 1);
        (item.glow.material as THREE.MeshBasicMaterial).opacity = selected ? 0.42 : 0.07;
        item.glow.scale.setScalar(selected ? 1.38 : 1);
      });
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
        materials.forEach((material) => {
          const mapped = material as THREE.Material & { map?: THREE.Texture };
          mapped.map?.dispose();
          material.dispose();
        });
      });
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="zodiac-canvas" aria-label="12星座 3D 星盘" />;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="zodiac-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function ZodiacClient() {
  const [selectedId, setSelectedId] = useState("leo");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("7");
  const [day, setDay] = useState("23");

  const selected = useMemo(() => ZODIACS.find((sign) => sign.id === selectedId) ?? ZODIACS[4], [selectedId]);
  const currentIndex = ZODIACS.findIndex((sign) => sign.id === selectedId);
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return ZODIACS;
    return ZODIACS.filter((sign) => [sign.name, sign.english, sign.element, sign.ruler].some((value) => value.toLowerCase().includes(text)));
  }, [query]);
  const birthSign = useMemo(() => ZODIACS.find((sign) => isInRange(Number(month), Number(day), sign)), [month, day]);

  function selectByOffset(offset: number) {
    setSelectedId(ZODIACS[(currentIndex + offset + ZODIACS.length) % ZODIACS.length].id);
  }

  function applyBirthSign() {
    if (birthSign) setSelectedId(birthSign.id);
  }

  return (
    <main className="zodiac-shell">
      <style>{zodiacCss}</style>
      <ZodiacCanvas selectedId={selectedId} onSelect={setSelectedId} />

      <header className="zodiac-topbar">
        <Link href="/" className="zodiac-back" aria-label="返回首页"><ArrowLeft aria-hidden="true" /></Link>
        <div className="zodiac-brand"><MoonStar aria-hidden="true" /><div><span>3D 科普</span><strong>12 星座星盘</strong></div></div>
        <div className="zodiac-badge"><Sparkles aria-hidden="true" />娱乐参考</div>
      </header>

      <section className="zodiac-panel" aria-label="星座资料">
        <div className="zodiac-heading">
          <div>
            <span>{selected.range} · {selected.element} · {selected.modality}</span>
            <h1>{selected.name}</h1>
            <p>{selected.english} {selected.symbol}</p>
          </div>
          <div className="zodiac-symbol" style={{ background: selected.accent }}>{selected.symbol}</div>
        </div>

        <p className="zodiac-lead">{selected.personality}</p>
        <div className="zodiac-tags">{selected.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>

        <div className="zodiac-stats">
          <MiniStat label="出生日期" value={selected.range} />
          <MiniStat label="守护星" value={selected.ruler} />
          <MiniStat label="幸运颜色" value={selected.luckyColor} />
          <MiniStat label="幸运数字" value={selected.luckyNumber} />
          <MiniStat label="幸运时段" value={selected.luckyTime} />
          <MiniStat label="适配星座" value={selected.match} />
        </div>

        <div className="zodiac-fortune">
          <div><Heart aria-hidden="true" /><p><strong>感情</strong>{selected.love}</p></div>
          <div><SunMedium aria-hidden="true" /><p><strong>事业</strong>{selected.career}</p></div>
          <div><WalletCards aria-hidden="true" /><p><strong>财运</strong>{selected.money}</p></div>
        </div>

        <div className="zodiac-advice"><Star aria-hidden="true" /><p>{selected.advice}</p></div>
        <div className="zodiac-nav">
          <button type="button" onClick={() => selectByOffset(-1)}><ChevronLeft aria-hidden="true" />上一座</button>
          <button type="button" onClick={() => selectByOffset(1)}>下一座<ChevronRight aria-hidden="true" /></button>
        </div>
      </section>

      <aside className="zodiac-list" aria-label="星座列表">
        <label className="zodiac-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索星座、元素或守护星" /></label>
        <div className="zodiac-buttons">
          {filtered.map((sign) => (
            <button key={sign.id} type="button" className={sign.id === selectedId ? "active" : ""} onClick={() => setSelectedId(sign.id)} style={{ ["--sign-color" as string]: sign.color, ["--sign-accent" as string]: sign.accent }}>
              <span>{sign.symbol}</span>
              <span><strong>{sign.name}</strong><small>{sign.range}</small></span>
            </button>
          ))}
        </div>
      </aside>

      <section className="zodiac-calculator" aria-label="生日星座查询">
        <div className="zodiac-calc-title"><CalendarDays aria-hidden="true" /><span>生日查询</span></div>
        <select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="出生月份">
          {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 月</option>)}
        </select>
        <select value={day} onChange={(event) => setDay(event.target.value)} aria-label="出生日期">
          {Array.from({ length: 31 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} 日</option>)}
        </select>
        <button type="button" onClick={applyBirthSign}>{birthSign ? birthSign.name : "查询"}</button>
      </section>
    </main>
  );
}

const zodiacCss = `
.zodiac-shell{position:relative;min-height:100svh;width:100%;overflow:hidden;color:#f7f3ff;background:radial-gradient(circle at 18% 18%,rgba(255,208,107,.18),transparent 23rem),radial-gradient(circle at 82% 72%,rgba(96,165,250,.2),transparent 25rem),#03040c;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}.zodiac-shell *{box-sizing:border-box}.zodiac-canvas{position:absolute;inset:0}.zodiac-canvas canvas{display:block;width:100%;height:100%}.zodiac-topbar{position:absolute;z-index:5;top:20px;left:22px;right:22px;display:flex;align-items:center;gap:10px;justify-content:space-between;pointer-events:none}.zodiac-back,.zodiac-brand,.zodiac-badge,.zodiac-panel,.zodiac-list,.zodiac-calculator{border:1px solid rgba(255,255,255,.14);background:rgba(8,10,24,.72);box-shadow:0 18px 60px rgba(0,0,0,.34);backdrop-filter:blur(18px)}.zodiac-back{pointer-events:auto;display:grid;width:44px;height:44px;place-items:center;border-radius:8px;color:#f7f3ff;text-decoration:none}.zodiac-brand{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 14px;border-radius:8px}.zodiac-brand svg{width:24px;height:24px;color:#ffd06b}.zodiac-brand span,.zodiac-heading span,.zodiac-stat span,.zodiac-buttons small,.zodiac-calc-title span{color:#b9b6d6;font-size:12px;line-height:1.2}.zodiac-brand strong{display:block;margin-top:2px;font-size:17px}.zodiac-badge{pointer-events:auto;display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border-radius:8px;color:#f7f3ff;font-size:13px}.zodiac-shell svg{width:18px;height:18px}.zodiac-panel{position:absolute;z-index:4;left:22px;top:134px;width:min(468px,calc(100vw - 44px));max-height:calc(100svh - 238px);overflow:auto;padding:22px;border-radius:8px;scrollbar-width:thin}.zodiac-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.zodiac-heading h1{margin:7px 0 0;font-size:clamp(42px,7vw,72px);line-height:.9;letter-spacing:0;color:#fff}.zodiac-heading p{margin:8px 0 0;color:#ddd7ff;font-size:17px}.zodiac-symbol{display:grid;width:58px;height:58px;place-items:center;border-radius:50%;color:#11131d;font-size:30px;font-weight:900;box-shadow:0 0 28px rgba(255,255,255,.2)}.zodiac-lead{margin:18px 0 12px;color:#f3efff;line-height:1.72;font-size:15px}.zodiac-tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.zodiac-tags span{padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.08);color:#f8f4ff;font-size:12px}.zodiac-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.zodiac-stat{min-height:68px;padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.06)}.zodiac-stat strong{display:block;margin-top:7px;color:#fff;font-size:15px;line-height:1.25}.zodiac-fortune{display:grid;gap:8px;margin-top:14px}.zodiac-fortune div,.zodiac-advice{display:flex;gap:10px;align-items:flex-start;padding:11px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08)}.zodiac-fortune svg,.zodiac-advice svg{flex:0 0 auto;color:#ffd06b;margin-top:2px}.zodiac-fortune p,.zodiac-advice p{margin:0;color:#ded9f4;line-height:1.52;font-size:13px}.zodiac-fortune strong{display:block;color:#fff;margin-bottom:2px}.zodiac-advice{margin-top:10px;border-left:3px solid #ffd06b;background:rgba(255,208,107,.12)}.zodiac-nav{display:flex;gap:10px;margin-top:14px}.zodiac-nav button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;flex:1;color:#f7f3ff;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.08);cursor:pointer}.zodiac-nav button:hover,.zodiac-buttons button:hover,.zodiac-back:hover,.zodiac-calculator button:hover{background:rgba(255,255,255,.15)}.zodiac-list{position:absolute;z-index:4;top:98px;right:22px;width:min(292px,calc(100vw - 44px));padding:12px;border-radius:8px}.zodiac-search{display:flex;align-items:center;min-height:42px;gap:9px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.08);color:#b9b6d6}.zodiac-search input{width:100%;color:#f7f3ff;border:0;outline:0;background:transparent}.zodiac-search input::placeholder{color:#8985a8}.zodiac-buttons{display:grid;gap:7px;margin-top:10px;max-height:min(55vh,520px);overflow:auto;scrollbar-width:thin}.zodiac-buttons button{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;width:100%;min-height:54px;padding:9px 10px;text-align:left;color:#f7f3ff;border:1px solid transparent;border-radius:8px;background:rgba(255,255,255,.06);cursor:pointer}.zodiac-buttons button.active{border-color:var(--sign-accent);background:color-mix(in srgb,var(--sign-color),rgba(255,255,255,.08) 76%)}.zodiac-buttons button>span:first-child{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:var(--sign-color);box-shadow:0 0 18px var(--sign-accent);font-size:18px}.zodiac-buttons strong{display:block;font-size:15px}.zodiac-buttons small{display:block;margin-top:4px}.zodiac-calculator{position:absolute;z-index:5;left:50%;bottom:22px;display:flex;align-items:center;gap:10px;width:min(680px,calc(100vw - 44px));min-height:62px;padding:10px 12px;border-radius:8px;transform:translateX(-50%)}.zodiac-calc-title{display:inline-flex;align-items:center;gap:8px;white-space:nowrap}.zodiac-calculator select,.zodiac-calculator button{height:40px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.08);color:#f7f3ff;padding:0 12px}.zodiac-calculator option{color:#111827}.zodiac-calculator button{min-width:112px;background:#ffd06b;color:#11131d;font-weight:900;cursor:pointer}@media (max-width:900px){.zodiac-topbar{top:12px;left:12px;right:12px}.zodiac-brand{min-height:48px;padding:8px 10px}.zodiac-brand strong{font-size:14px}.zodiac-brand span{font-size:11px}.zodiac-badge{display:none}.zodiac-back{width:36px;height:36px}.zodiac-list{top:auto;right:12px;left:12px;bottom:92px;width:auto;padding:10px}.zodiac-search{display:none}.zodiac-buttons{display:flex;gap:8px;margin:0;overflow-x:auto;max-height:none;padding-bottom:2px}.zodiac-buttons::-webkit-scrollbar{display:none}.zodiac-buttons button{grid-template-columns:28px max-content;width:auto;min-width:104px;min-height:46px;padding:8px 10px}.zodiac-buttons small{display:none}.zodiac-buttons button>span:first-child{width:24px;height:24px;font-size:15px}.zodiac-panel{top:auto;max-height:none;overflow:visible;left:12px;right:12px;bottom:160px;width:auto;padding:16px}.zodiac-heading h1{font-size:clamp(38px,14vw,58px)}.zodiac-heading p{font-size:15px}.zodiac-symbol{width:48px;height:48px;font-size:26px}.zodiac-lead{margin:12px 0;font-size:14px;line-height:1.58}.zodiac-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.zodiac-stat{min-height:62px;padding:9px}.zodiac-stat span{font-size:11px}.zodiac-stat strong{font-size:13px;margin-top:5px}.zodiac-fortune,.zodiac-advice{display:none}.zodiac-nav{margin-top:11px}.zodiac-calculator{bottom:12px;flex-wrap:wrap;width:calc(100vw - 24px);min-height:70px;gap:8px}.zodiac-calc-title{min-width:100%}.zodiac-calculator select{flex:1}.zodiac-calculator button{flex:1}}@media (max-width:560px){.zodiac-panel{bottom:154px}.zodiac-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.zodiac-stat:nth-child(n+5){display:none}.zodiac-tags span:nth-child(n+3){display:none}}
`;
