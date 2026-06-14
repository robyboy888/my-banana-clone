"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Gauge, Info, Orbit, Pause, Play, RotateCcw, Search, Sparkles } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Planet = {
  id: string;
  name: string;
  english: string;
  order: number;
  radius: number;
  displayRadius: number;
  distance: number;
  displayDistance: number;
  color: string;
  accent: string;
  orbitDays: number;
  rotationHours: number;
  moons: number;
  type: string;
  temperature: string;
  fact: string;
  focus: string;
};

const PLANETS: Planet[] = [
  { id: "mercury", name: "水星", english: "Mercury", order: 1, radius: 0.383, displayRadius: 0.56, distance: 9, displayDistance: 5.4, color: "#b7aaa0", accent: "#d5c4ad", orbitDays: 88, rotationHours: 1407.6, moons: 0, type: "岩石行星", temperature: "-173°C 至 427°C", fact: "水星最靠近太阳，但几乎没有大气层保温，昼夜温差极其剧烈。", focus: "观察它贴近太阳的短轨道，理解为什么水星一年只有 88 个地球日。" },
  { id: "venus", name: "金星", english: "Venus", order: 2, radius: 0.949, displayRadius: 0.82, distance: 13, displayDistance: 7.3, color: "#e7b85c", accent: "#f4df9d", orbitDays: 225, rotationHours: -5832.5, moons: 0, type: "岩石行星", temperature: "约 464°C", fact: "金星被厚厚的二氧化碳大气和硫酸云覆盖，强烈温室效应让它比水星还热。", focus: "留意它的逆向自转：在金星上，太阳会从西边升起。" },
  { id: "earth", name: "地球", english: "Earth", order: 3, radius: 1, displayRadius: 0.88, distance: 17, displayDistance: 9.4, color: "#2d8cff", accent: "#61d394", orbitDays: 365.25, rotationHours: 23.9, moons: 1, type: "岩石行星", temperature: "平均约 15°C", fact: "地球拥有稳定液态水、含氧大气和磁场，是目前已知唯一存在生命的行星。", focus: "对比地球与邻近行星，可看出宜居环境依赖距离、大气与磁场共同作用。" },
  { id: "mars", name: "火星", english: "Mars", order: 4, radius: 0.532, displayRadius: 0.66, distance: 22, displayDistance: 12.1, color: "#d1633f", accent: "#ff9a61", orbitDays: 687, rotationHours: 24.6, moons: 2, type: "岩石行星", temperature: "平均约 -63°C", fact: "火星表面富含氧化铁，因此呈现红色；它有太阳系最高的火山奥林帕斯山。", focus: "查看火星与地球相似的自转周期，理解为什么它是深空探测重点。" },
  { id: "jupiter", name: "木星", english: "Jupiter", order: 5, radius: 11.21, displayRadius: 1.9, distance: 35, displayDistance: 17.8, color: "#c98c59", accent: "#f5d6a1", orbitDays: 4333, rotationHours: 9.9, moons: 95, type: "气态巨行星", temperature: "云顶约 -110°C", fact: "木星质量超过其他行星总和的两倍，大红斑是一场持续数百年的巨型风暴。", focus: "它转得很快，扁率明显；强引力也深刻影响小行星和彗星轨道。" },
  { id: "saturn", name: "土星", english: "Saturn", order: 6, radius: 9.45, displayRadius: 1.62, distance: 46, displayDistance: 22.7, color: "#d8be7d", accent: "#fff2bd", orbitDays: 10759, rotationHours: 10.7, moons: 146, type: "气态巨行星", temperature: "云顶约 -140°C", fact: "土星环由大量冰粒和岩屑组成，厚度远小于宽度，是太阳系最醒目的环系统。", focus: "从侧面观察环面，可理解为什么土星环在不同年份看起来会变宽或变窄。" },
  { id: "uranus", name: "天王星", english: "Uranus", order: 7, radius: 4.01, displayRadius: 1.18, distance: 58, displayDistance: 27.5, color: "#71d4df", accent: "#b6f4f7", orbitDays: 30687, rotationHours: -17.2, moons: 27, type: "冰巨行星", temperature: "云顶约 -195°C", fact: "天王星自转轴几乎横躺在轨道面上，季节变化极端。", focus: "倾斜的自转轴是它最关键的特征，也是理解冰巨行星演化的重要线索。" },
  { id: "neptune", name: "海王星", english: "Neptune", order: 8, radius: 3.88, displayRadius: 1.15, distance: 70, displayDistance: 32, color: "#315ee8", accent: "#7fa0ff", orbitDays: 60190, rotationHours: 16.1, moons: 14, type: "冰巨行星", temperature: "云顶约 -200°C", fact: "海王星是最远的行星，拥有太阳系中最猛烈的风，风速可超过超音速。", focus: "它的公转周期约 165 年，人类发现它后至今只完成过一次完整绕日公转。" },
];

const formatter = new Intl.NumberFormat("zh-CN");

function planetTexture(planet: Planet) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, planet.accent);
  gradient.addColorStop(0.45, planet.color);
  gradient.addColorStop(1, "#15161d");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 170; i += 1) {
    const x = Math.abs((Math.sin(planet.order * 997 + i * 12.9898) * 43758.5453) % 1) * canvas.width;
    const y = Math.abs((Math.sin(planet.order * 997 + i * 78.233) * 24634.6345) % 1) * canvas.height;
    ctx.globalAlpha = 0.08 + (i % 6) * 0.025;
    ctx.fillStyle = i % 3 === 0 ? planet.accent : "#ffffff";
    ctx.beginPath();
    ctx.ellipse(x, y, 20 + ((i * 17) % 96), 3 + ((i * 11) % 18), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (planet.id === "earth") {
    ctx.globalAlpha = 0.65;
    ctx.fillStyle = "#2ccf7a";
    [[88, 88, 56, 22], [236, 116, 68, 30], [342, 82, 42, 18], [405, 150, 58, 22]].forEach(([x, y, w, h]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, w, h, -0.35, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  if (planet.id === "jupiter" || planet.id === "saturn") {
    ctx.globalAlpha = 0.22;
    for (let y = 18; y < canvas.height; y += 18) {
      ctx.fillStyle = y % 36 === 0 ? "#fff0c2" : "#5b3323";
      ctx.fillRect(0, y, canvas.width, 8);
    }
  }
  ctx.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function starTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();
  ctx.fillStyle = "#02030a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 1800; i += 1) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.75;
    ctx.fillStyle = Math.random() > 0.88 ? "#f8d9a2" : "#ffffff";
    ctx.beginPath();
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() > 0.985 ? 2.2 : Math.random() * 1.15, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function orbitLabel(days: number) {
  return days < 1000 ? `${formatter.format(days)} 天` : `${(days / 365.25).toFixed(1)} 年`;
}

function rotationLabel(hours: number) {
  const abs = Math.abs(hours);
  return `${hours < 0 ? "逆向 " : ""}${abs > 100 ? `${(abs / 24).toFixed(1)} 天` : `${abs.toFixed(1)} 小时`}`;
}

function SolarCanvas({ selectedId, onSelect, paused, speed, wide }: { selectedId: string; onSelect: (id: string) => void; paused: boolean; speed: number; wide: boolean }) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef(selectedId);
  const optsRef = useRef({ paused, speed, wide });
  const onSelectRef = useRef(onSelect);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { optsRef.current = { paused, speed, wide }; }, [paused, speed, wide]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#02030a");
    scene.fog = new THREE.FogExp2("#02030a", 0.009);
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 1200);
    camera.position.set(0, 34, 54);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 12;
    controls.maxDistance = 95;
    controls.maxPolarAngle = Math.PI * 0.72;
    scene.add(new THREE.AmbientLight("#8aa0c7", 0.28));
    scene.add(new THREE.PointLight("#fff1c4", 3200, 250, 1.35));
    const stars = new THREE.Mesh(new THREE.SphereGeometry(420, 48, 48), new THREE.MeshBasicMaterial({ map: starTexture(), side: THREE.BackSide }));
    const sun = new THREE.Mesh(new THREE.SphereGeometry(3.2, 64, 64), new THREE.MeshBasicMaterial({ color: "#ffcc4f" }));
    const sunHalo = new THREE.Mesh(new THREE.SphereGeometry(4.8, 64, 64), new THREE.MeshBasicMaterial({ color: "#ff8f2b", transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending }));
    scene.add(stars, sun, sunHalo);
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);
    const pickTargets: THREE.Mesh[] = [];
    const items = new Map<string, { planet: Planet; pivot: THREE.Group; mesh: THREE.Mesh; orbit: THREE.Mesh; outline: THREE.Mesh; ring?: THREE.Mesh }>();

    PLANETS.forEach((planet) => {
      const orbit = new THREE.Mesh(new THREE.RingGeometry(planet.displayDistance - 0.008, planet.displayDistance + 0.008, 192), new THREE.MeshBasicMaterial({ color: planet.accent, transparent: true, opacity: 0.24, side: THREE.DoubleSide }));
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
      const pivot = new THREE.Group();
      pivot.rotation.y = planet.order * 0.78;
      planetGroup.add(pivot);
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(planet.displayRadius, 64, 64), new THREE.MeshStandardMaterial({ map: planetTexture(planet), roughness: 0.84, metalness: 0.02 }));
      mesh.position.set(planet.displayDistance, 0, 0);
      mesh.userData = { planetId: planet.id };
      pivot.add(mesh);
      pickTargets.push(mesh);
      const outline = new THREE.Mesh(new THREE.SphereGeometry(planet.displayRadius * 1.08, 32, 32), new THREE.MeshBasicMaterial({ color: planet.accent, transparent: true, opacity: 0, side: THREE.BackSide }));
      outline.position.copy(mesh.position);
      pivot.add(outline);
      let ring: THREE.Mesh | undefined;
      if (planet.id === "saturn") {
        ring = new THREE.Mesh(new THREE.RingGeometry(planet.displayRadius * 1.38, planet.displayRadius * 2.35, 160), new THREE.MeshStandardMaterial({ color: "#f2dca3", side: THREE.DoubleSide, transparent: true, opacity: 0.72, roughness: 0.9 }));
        ring.rotation.x = Math.PI / 2.65;
        ring.position.copy(mesh.position);
        pivot.add(ring);
      }
      if (planet.id === "uranus") mesh.rotation.z = Math.PI * 0.48;
      items.set(planet.id, { planet, pivot, mesh, orbit, outline, ring });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const clock = new THREE.Clock();
    let frame = 0;
    let focused = selectedRef.current;

    function focus(force = false) {
      const current = selectedRef.current;
      if (!force && current === focused) return;
      focused = current;
      const item = items.get(current);
      if (!item) return;
      const pos = new THREE.Vector3();
      item.mesh.getWorldPosition(pos);
      const offset = new THREE.Vector3(0, Math.max(5, item.planet.displayRadius * 4), Math.max(9, item.planet.displayRadius * 7));
      controls.target.lerp(pos, force ? 1 : 0.18);
      camera.position.lerp(pos.clone().add(offset), force ? 1 : 0.12);
    }

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
      const id = raycaster.intersectObjects(pickTargets, false)[0]?.object.userData.planetId;
      if (typeof id === "string") onSelectRef.current(id);
    }

    function animate() {
      const delta = clock.getDelta();
      const opts = optsRef.current;
      const scale = opts.wide ? 1 : 0.66;
      sun.rotation.y += delta * 0.06;
      sunHalo.rotation.y -= delta * 0.03;
      stars.rotation.y += delta * 0.006;
      items.forEach((item, id) => {
        const selected = selectedRef.current === id;
        item.orbit.scale.setScalar(scale);
        (item.outline.material as THREE.MeshBasicMaterial).opacity = selected ? 0.38 : 0;
        item.outline.scale.setScalar(selected ? 1.22 + Math.sin(clock.elapsedTime * 4) * 0.025 : 1);
        item.mesh.position.x = item.planet.displayDistance * scale;
        item.outline.position.copy(item.mesh.position);
        item.ring?.position.copy(item.mesh.position);
        if (!opts.paused) {
          item.pivot.rotation.y += delta * (0.022 / Math.sqrt(item.planet.orbitDays / 88)) * opts.speed;
          item.mesh.rotation.y += delta * (item.planet.rotationHours < 0 ? -1 : 1) * (0.24 + opts.speed * 0.035);
        }
      });
      focus(false);
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    }

    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    focus(true);
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

  return <div ref={mountRef} className="solar-canvas" aria-label="太阳系八大行星 3D 模型" />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="solar-stat"><span>{label}</span><strong>{value}</strong></div>;
}

export default function SolarSystemClient() {
  const [selectedId, setSelectedId] = useState("earth");
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1.4);
  const [wide, setWide] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => PLANETS.find((planet) => planet.id === selectedId) ?? PLANETS[2], [selectedId]);
  const currentIndex = PLANETS.findIndex((planet) => planet.id === selectedId);
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text ? PLANETS.filter((planet) => [planet.name, planet.english, planet.type].some((value) => value.toLowerCase().includes(text))) : PLANETS;
  }, [query]);
  const selectByOffset = (offset: number) => setSelectedId(PLANETS[(currentIndex + offset + PLANETS.length) % PLANETS.length].id);

  return (
    <main className="solar-shell">
      <style>{solarCss}</style>
      <SolarCanvas selectedId={selectedId} onSelect={setSelectedId} paused={paused} speed={speed} wide={wide} />
      <header className="solar-topbar">
        <Link href="/" className="solar-back" aria-label="返回首页"><ArrowLeft aria-hidden="true" /></Link>
        <div className="solar-brand"><Sparkles aria-hidden="true" /><div><span>3D 科普</span><strong>太阳系八大行星</strong></div></div>
        <div className="solar-actions">
          <button type="button" onClick={() => setPaused((value) => !value)} title={paused ? "继续运转" : "暂停运转"}>{paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
          <button type="button" onClick={() => setSelectedId("earth")} title="回到地球"><RotateCcw aria-hidden="true" /></button>
        </div>
      </header>
      <section className="solar-info" aria-label="行星科普信息">
        <div className="solar-heading"><div><span>第 {selected.order} 颗行星 · {selected.type}</span><h1>{selected.name}</h1><p>{selected.english}</p></div><div className="solar-chip" style={{ background: selected.accent }}>{selected.order}/8</div></div>
        <p className="solar-lead">{selected.fact}</p>
        <div className="solar-stats">
          <Stat label="赤道半径" value={`${selected.radius} × 地球`} />
          <Stat label="日均距离" value={`${formatter.format(selected.distance)} × 近似比例`} />
          <Stat label="公转周期" value={orbitLabel(selected.orbitDays)} />
          <Stat label="自转周期" value={rotationLabel(selected.rotationHours)} />
          <Stat label="卫星数量" value={`${selected.moons} 颗`} />
          <Stat label="温度" value={selected.temperature} />
        </div>
        <div className="solar-focus"><Info aria-hidden="true" /><p>{selected.focus}</p></div>
        <div className="solar-nav"><button type="button" onClick={() => selectByOffset(-1)}><ChevronLeft aria-hidden="true" />上一颗</button><button type="button" onClick={() => selectByOffset(1)}>下一颗<ChevronRight aria-hidden="true" /></button></div>
      </section>
      <aside className="solar-list" aria-label="行星列表">
        <label className="solar-search"><Search aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索行星或类型" /></label>
        <div className="solar-buttons">
          {filtered.map((planet) => (
            <button key={planet.id} type="button" className={planet.id === selectedId ? "active" : ""} onClick={() => setSelectedId(planet.id)} style={{ ["--planet-color" as string]: planet.color, ["--planet-accent" as string]: planet.accent }}>
              <span /><span><strong>{planet.name}</strong><small>{planet.type}</small></span>
            </button>
          ))}
        </div>
      </aside>
      <section className="solar-controls" aria-label="模型控制">
        <div className="solar-speed"><span><Gauge aria-hidden="true" />速度</span><input min="0.2" max="4" step="0.1" type="range" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} /><strong>{speed.toFixed(1)}x</strong></div>
        <button type="button" className={wide ? "active" : ""} onClick={() => setWide((value) => !value)}><Orbit aria-hidden="true" />{wide ? "轨道比例" : "教学比例"}</button>
      </section>
    </main>
  );
}

const solarCss = `
.solar-shell{position:relative;min-height:100svh;width:100%;overflow:hidden;color:#f4f6fb;background:radial-gradient(circle at 20% 12%,rgba(255,188,82,.22),transparent 24rem),radial-gradient(circle at 82% 68%,rgba(62,123,255,.19),transparent 25rem),#02030a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Microsoft YaHei",sans-serif}.solar-shell *{box-sizing:border-box}.solar-canvas{position:absolute;inset:0}.solar-canvas canvas{display:block;width:100%;height:100%}.solar-topbar{position:absolute;z-index:5;top:20px;left:22px;right:22px;display:flex;align-items:center;gap:10px;justify-content:space-between;pointer-events:none}.solar-back,.solar-brand,.solar-actions,.solar-info,.solar-list,.solar-controls{border:1px solid rgba(255,255,255,.14);background:rgba(9,12,23,.72);box-shadow:0 18px 60px rgba(0,0,0,.34);backdrop-filter:blur(18px)}.solar-back{pointer-events:auto;display:grid;width:44px;height:44px;place-items:center;border-radius:8px;color:#f4f6fb;text-decoration:none}.solar-brand{display:flex;align-items:center;gap:12px;min-height:56px;padding:10px 14px;border-radius:8px}.solar-brand svg{width:24px;height:24px;color:#ffcf63}.solar-brand span,.solar-heading span,.solar-stat span,.solar-buttons small,.solar-speed span{color:#aeb8d2;font-size:12px;line-height:1.2}.solar-brand strong{display:block;margin-top:2px;font-size:17px}.solar-actions{pointer-events:auto;display:flex;gap:8px;padding:8px;border-radius:8px}.solar-actions button,.solar-controls button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;border:0;border-radius:8px;color:#f4f6fb;background:rgba(255,255,255,.08);cursor:pointer}.solar-actions button{width:40px}.solar-actions button:hover,.solar-controls button:hover,.solar-nav button:hover,.solar-buttons button:hover,.solar-back:hover{background:rgba(255,255,255,.15)}.solar-shell svg{width:18px;height:18px}.solar-info{position:absolute;z-index:4;left:22px;bottom:104px;width:min(440px,calc(100vw - 44px));padding:22px;border-radius:8px}.solar-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.solar-heading h1{margin:7px 0 0;font-size:clamp(42px,7vw,78px);line-height:.9;letter-spacing:0;color:#fff}.solar-heading p{margin:8px 0 0;color:#d9dfef;font-size:17px}.solar-chip{display:grid;width:58px;height:58px;place-items:center;border-radius:50%;color:#11131d;font-weight:800;box-shadow:0 0 28px rgba(120,180,255,.3)}.solar-lead{margin:18px 0;color:#eef2ff;line-height:1.72;font-size:15px}.solar-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.solar-stat{min-height:74px;padding:12px;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:rgba(255,255,255,.06)}.solar-stat strong{display:block;margin-top:7px;color:#fff;font-size:16px;line-height:1.25}.solar-focus{display:flex;gap:10px;align-items:flex-start;margin-top:14px;padding:13px;border-left:3px solid #7fa0ff;border-radius:8px;background:rgba(127,160,255,.12)}.solar-focus svg{flex:0 0 auto;color:#9fb8ff;margin-top:2px}.solar-focus p{margin:0;color:#dbe4ff;line-height:1.6;font-size:14px}.solar-nav{display:flex;gap:10px;margin-top:16px}.solar-nav button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;flex:1;color:#f5f7ff;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.08);cursor:pointer}.solar-list{position:absolute;z-index:4;top:98px;right:22px;width:min(282px,calc(100vw - 44px));padding:12px;border-radius:8px}.solar-search{display:flex;align-items:center;min-height:42px;gap:9px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.08);color:#aeb8d2}.solar-search input{width:100%;color:#f7f9ff;border:0;outline:0;background:transparent}.solar-search input::placeholder{color:#8894ae}.solar-buttons{display:grid;gap:7px;margin-top:10px;max-height:min(55vh,520px);overflow:auto;scrollbar-width:thin}.solar-buttons button{display:grid;grid-template-columns:16px 1fr;gap:10px;align-items:center;width:100%;min-height:54px;padding:9px 10px;text-align:left;color:#f4f6fb;border:1px solid transparent;border-radius:8px;background:rgba(255,255,255,.06);cursor:pointer}.solar-buttons button.active{border-color:var(--planet-accent);background:color-mix(in srgb,var(--planet-color),rgba(255,255,255,.08) 76%)}.solar-buttons button>span:first-child{display:block;width:14px;height:14px;border-radius:50%;background:var(--planet-color);box-shadow:0 0 18px var(--planet-accent)}.solar-buttons strong{display:block;font-size:15px}.solar-buttons small{display:block;margin-top:4px}.solar-controls{position:absolute;z-index:5;left:50%;bottom:22px;display:flex;align-items:center;gap:12px;width:min(640px,calc(100vw - 44px));min-height:62px;padding:10px 12px;border-radius:8px;transform:translateX(-50%)}.solar-speed{display:grid;grid-template-columns:auto minmax(120px,1fr) 44px;align-items:center;gap:10px;flex:1 1 auto;min-width:220px}.solar-speed span{display:inline-flex;align-items:center;gap:6px;color:#dbe4ff}.solar-speed input{accent-color:#ffcf63;width:100%}.solar-speed strong{font-size:14px;text-align:right}.solar-controls button{padding:0 14px}.solar-controls button.active{color:#11131d;background:#ffcf63}@media (max-width:900px){.solar-topbar{top:12px;left:12px;right:12px}.solar-brand{min-height:48px;padding:8px 10px}.solar-brand strong{font-size:14px}.solar-brand span{font-size:11px}.solar-actions{gap:4px;padding:6px}.solar-actions button,.solar-back{width:36px;height:36px}.solar-list{top:auto;right:12px;left:12px;bottom:92px;width:auto;padding:10px}.solar-search{display:none}.solar-buttons{display:flex;gap:8px;margin:0;overflow-x:auto;max-height:none;padding-bottom:2px}.solar-buttons::-webkit-scrollbar{display:none}.solar-buttons button{grid-template-columns:12px max-content;width:auto;min-width:96px;min-height:46px;padding:8px 10px}.solar-buttons small{display:none}.solar-buttons button>span:first-child{width:11px;height:11px}.solar-info{left:12px;right:12px;bottom:162px;width:auto;padding:16px}.solar-heading h1{font-size:clamp(38px,14vw,58px)}.solar-heading p{font-size:15px}.solar-chip{width:48px;height:48px}.solar-lead{margin:12px 0;font-size:14px;line-height:1.58}.solar-stats{grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.solar-stat{min-height:62px;padding:9px}.solar-stat span{font-size:11px}.solar-stat strong{font-size:13px;margin-top:5px}.solar-focus{display:none}.solar-nav{margin-top:11px}.solar-controls{bottom:12px;flex-wrap:wrap;width:calc(100vw - 24px);min-height:70px;gap:8px}.solar-speed{grid-template-columns:auto minmax(95px,1fr) 38px;min-width:100%}.solar-controls button{flex:1}}@media (max-width:560px){.solar-info{bottom:154px}.solar-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.solar-stat:nth-child(n+5){display:none}}
`;
