import * as THREE from "three";
import { ndCardMat } from "./engine.js";
import { drawChar, drawFx, CW, CH, FEET } from "./toon.js";

// ---------------------------------------------------------------- materials
const grad = new THREE.DataTexture(new Uint8Array([95, 95, 95, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
const matCache = new Map();
export function toon(color, opt = {}) {
  const key = color + JSON.stringify(opt);
  if (!opt.map && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: grad, ...opt });
  if (!opt.map) matCache.set(key, m);
  return m;
}
export function canvasTex(w, h, draw, repeat) {
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const c = cv.getContext("2d"); draw(c, w, h);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.userData = { c, cv };
  return t;
}
export const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

export function mesh(geo, mat, opt = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = opt.cast ?? true; m.receiveShadow = opt.receive ?? true;
  if (opt.smooth) m.userData.smooth = true;
  if (opt.pos) m.position.set(...opt.pos);
  if (opt.rot) m.rotation.set(...opt.rot);
  if (opt.scale) (typeof opt.scale === "number" ? m.scale.setScalar(opt.scale) : m.scale.set(...opt.scale));
  return m;
}
export const box = (w, h, d, color, opt = {}) => mesh(new THREE.BoxGeometry(w, h, d), opt.mat || toon(color, opt.m || {}), opt);
export const cyl = (rt, rb, h, color, opt = {}) => mesh(new THREE.CylinderGeometry(rt, rb, h, opt.seg || 16), opt.mat || toon(color), { smooth: true, ...opt });
export const sphere = (r, color, opt = {}) => mesh(new THREE.SphereGeometry(r, 20, 14), opt.mat || toon(color), { smooth: true, ...opt });

// ---------------------------------------------------------------- text helper for signs
export function fitText(c, text, x, y, maxW, size, font = "Baloo", weight = 800, fill = "#222", stroke = null, sw = 0) {
  let s = size; c.font = `${weight} ${s}px '${font}'`;
  while (c.measureText(text).width > maxW && s > 8) { s -= 2; c.font = `${weight} ${s}px '${font}'`; }
  c.textAlign = "center"; c.textBaseline = "middle";
  if (stroke) { c.lineJoin = "round"; c.lineWidth = sw; c.strokeStyle = stroke; c.strokeText(text, x, y); }
  c.fillStyle = fill; c.fillText(text, x, y);
}

// ---------------------------------------------------------------- character cards
export class Card {
  constructor(opts, height = 1.7, fx = null) {
    this.cv = document.createElement("canvas"); this.cv.width = CW; this.cv.height = CH;
    this.c = this.cv.getContext("2d");
    this.tex = new THREE.CanvasTexture(this.cv); this.tex.colorSpace = THREE.SRGBColorSpace; this.tex.anisotropy = 8;
    this.tex.generateMipmaps = true;
    const hgt = height * CH / (FEET - 222); // card height so that feet->crown ≈ height (crown at y≈222 on the card)
    const geo = new THREE.PlaneGeometry(hgt * CW / CH, hgt);
    geo.translate(0, hgt / 2 - hgt * (1 - FEET / CH), 0);
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: false, alphaToCoverage: true, alphaTest: 0.02, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.userData.nd = ndCardMat(this.tex);
    this.mesh.castShadow = false; this.mesh.receiveShadow = false;
    this.opts = { ...opts }; this.fx = fx; this.key = ""; this.face = true;
    this.root = new THREE.Group(); this.root.add(this.mesh);
    if (!fx && opts.shadow !== false) {
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(hgt * 0.42, hgt * 0.14), shadowMat());
      sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; sh.userData.noND = true; sh.renderOrder = -1;
      this.root.add(sh); this.shadow = sh;
    }
  }
  set(o) { Object.assign(this.opts, o); return this; }
  update(camera, t) {
    const o = this.opts;
    const key = this.fx ? this.fx + ":" + (o.t ?? 0).toFixed(3) : JSON.stringify(o, (k, v) => (k === "lean" || k === "squash" ? undefined : typeof v === "number" ? +v.toFixed(3) : typeof v === "function" ? "f" : v));
    if (key !== this.key) {
      this.key = key;
      if (this.fx) drawFx(this.c, this.fx, o.t ?? 0, o); else drawChar(this.c, o);
      this.tex.needsUpdate = true;
    }
    if (this.face) {
      const p = new THREE.Vector3(); this.root.getWorldPosition(p);
      const ang = Math.atan2(camera.position.x - p.x, camera.position.z - p.z);
      const parentRot = this.root.parent ? new THREE.Euler().setFromQuaternion(this.root.parent.getWorldQuaternion(new THREE.Quaternion())).y : 0;
      this.mesh.rotation.y = ang - this.root.rotation.y - parentRot;
    }
    this.mesh.rotation.order = "YXZ";
    this.mesh.rotation.z = o.lean || 0;
    const sq = o.squash || 0; this.mesh.scale.set(1 + sq * 0.6, 1 - sq, 1);
  }
}
let _shadowMat;
function shadowMat() {
  if (_shadowMat) return _shadowMat;
  const t = canvasTex(128, 64, (c) => { const g = c.createRadialGradient(64, 32, 0, 64, 32, 62); g.addColorStop(0, "rgba(25,15,40,0.55)"); g.addColorStop(0.6, "rgba(25,15,40,0.32)"); g.addColorStop(1, "rgba(25,15,40,0)"); c.setTransform(1, 0, 0, 0.5, 0, 16); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  _shadowMat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
  return _shadowMat;
}

// ---------------------------------------------------------------- sky
export function skyDome(top, horizon, bottom = horizon) {
  const m = new THREE.ShaderMaterial({
    uniforms: { cTop: { value: new THREE.Color(top) }, cHor: { value: new THREE.Color(horizon) }, cBot: { value: new THREE.Color(bottom) } },
    vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }`,
    fragmentShader: `varying vec3 vD; uniform vec3 cTop, cHor, cBot; void main(){ float y = vD.y; vec3 c = y>0.0 ? mix(cHor, cTop, pow(smoothstep(0.0, 0.75, y), 0.7)) : mix(cHor, cBot, smoothstep(0.0,-0.2,y)); gl_FragColor = vec4(c,1.0); }`,
    side: THREE.BackSide, depthWrite: false, fog: false,
  });
  const s = new THREE.Mesh(new THREE.SphereGeometry(800, 32, 16), m);
  s.userData.noND = true; s.renderOrder = -10; s.frustumCulled = false;
  return s;
}
export function cloud(seed, scale = 1) {
  const g = new THREE.Group(); const r = rnd(seed);
  const mat = toon("#ffffff", { emissive: new THREE.Color("#c9d8ef"), emissiveIntensity: 0.55 });
  const n = 5 + (r() * 3 | 0);
  for (let i = 0; i < n; i++) {
    const s = (1.2 + r() * 1.6) * scale;
    const m = mesh(new THREE.SphereGeometry(s, 14, 10), mat, { smooth: true, cast: false, receive: false });
    m.position.set((i - n / 2) * 1.6 * scale + r() * scale, r() * 0.8 * scale, r() * scale);
    m.scale.y = 0.7; g.add(m);
  }
  return g;
}

// ---------------------------------------------------------------- props
export function palm(seed = 1, h = 7) {
  const r = rnd(seed); const g = new THREE.Group();
  const lean = (r() - 0.5) * 0.35;
  const segs = 6; let x = 0, y = 0;
  for (let i = 0; i < segs; i++) {
    const sh = h / segs; const m = cyl(0.17 - i * 0.012, 0.2 - i * 0.012, sh, i % 2 ? "#8a6a45" : "#7b5c3b", { seg: 8 });
    m.position.set(x + Math.sin(lean) * sh / 2, y + sh / 2, 0); m.rotation.z = -lean * (1 + i * 0.15);
    g.add(m); x += Math.sin(lean * (1 + i * 0.15)) * sh; y += Math.cos(lean) * sh;
  }
  const top = new THREE.Group(); top.position.set(x, y, 0); g.add(top);
  const leafMat = toon("#3f9a3a");
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.42, 3.6, 4, 1), leafMat);
    leaf.castShadow = true; leaf.scale.set(1, 1, 0.18);
    leaf.geometry.translate(0, 1.8, 0);
    leaf.rotation.set(0, (i / 9) * Math.PI * 2 + r() * 0.3, 0);
    const pivot = new THREE.Group(); pivot.rotation.y = (i / 9) * Math.PI * 2; pivot.add(leaf);
    leaf.rotation.set(1.15 + r() * 0.35, 0, 0);
    top.add(pivot);
  }
  for (let i = 0; i < 3; i++) top.add(sphere(0.2, "#6b4a2a", { pos: [Math.cos(i * 2.1) * 0.25, -0.25, Math.sin(i * 2.1) * 0.25] }));
  return g;
}
export function bush(seed = 1, s = 1, col = "#4fa046") {
  const g = new THREE.Group(); const r = rnd(seed);
  for (let i = 0; i < 4; i++) g.add(sphere((0.5 + r() * 0.4) * s, col, { pos: [(r() - 0.5) * s, (0.35 + r() * 0.3) * s, (r() - 0.5) * s] }));
  return g;
}
export function tree(seed = 1, h = 5) {
  const g = new THREE.Group(); const r = rnd(seed);
  g.add(cyl(0.22, 0.3, h * 0.5, "#7b5a3a", { pos: [0, h * 0.25, 0], seg: 8 }));
  const col = ["#4b9a3f", "#3f8f3a", "#5aa84a"][r() * 3 | 0];
  for (let i = 0; i < 5; i++) g.add(sphere((1.0 + r() * 0.6) * h / 5, col, { pos: [(r() - 0.5) * h * 0.35, h * (0.6 + r() * 0.25), (r() - 0.5) * h * 0.35] }));
  return g;
}

// house with painted facade: walls (colour), windows, door, tin roof
export function house(seed, w = 6, h = 5, d = 6, col = "#f2d38a", roof = "#b5533c", opt = {}) {
  const r = rnd(seed); const g = new THREE.Group();
  const face = canvasTex(512, Math.round(512 * h / w), (c, W, H) => {
    c.fillStyle = col; c.fillRect(0, 0, W, H);
    // grime + plinth
    c.fillStyle = "rgba(0,0,0,0.08)"; c.fillRect(0, H - 40, W, 40);
    for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(90,60,40,${0.03 + r() * 0.04})`; c.fillRect(r() * W, r() * H, 20 + r() * 60, 10 + r() * 40); }
    const floors = h > 5.5 ? 2 : 1;
    for (let f = 0; f < floors; f++) {
      const y0 = H - (f + 1) * H / floors;
      const nW = Math.max(1, Math.round(w / 3));
      for (let i = 0; i < nW; i++) {
        const x = (i + 0.5) * W / nW;
        if (f === 0 && i === (nW > 1 ? 0 : 0) && !opt.store) { // door
          c.fillStyle = "#6b3f2a"; c.fillRect(x - 40, H - 190, 80, 190); c.strokeStyle = "#241726"; c.lineWidth = 6; c.strokeRect(x - 40, H - 190, 80, 190);
          continue;
        }
        c.fillStyle = "#cfe4f2"; c.fillRect(x - 46, y0 + H / floors * 0.25, 92, H / floors * 0.38);
        c.strokeStyle = "#241726"; c.lineWidth = 6; c.strokeRect(x - 46, y0 + H / floors * 0.25, 92, H / floors * 0.38);
        c.beginPath(); c.moveTo(x, y0 + H / floors * 0.25); c.lineTo(x, y0 + H / floors * 0.63); c.stroke();
        c.fillStyle = opt.trim || "#ffffff"; c.fillRect(x - 54, y0 + H / floors * 0.63, 108, 10);
      }
    }
    if (opt.store) { // sari-sari store front
      c.fillStyle = "#3a2a20"; c.fillRect(W * 0.1, H * 0.42, W * 0.8, H * 0.38);
      c.fillStyle = "#e9e1c9"; for (let x = W * 0.12; x < W * 0.88; x += 18) c.fillRect(x, H * 0.42, 6, H * 0.38);
      c.fillStyle = "#d33"; c.fillRect(W * 0.05, H * 0.25, W * 0.9, H * 0.14);
      fitText(c, opt.store, W / 2, H * 0.32, W * 0.85, 60, "Luckiest Guy", 400, "#fff", "#241726", 8);
    }
  });
  const side = toon(col);
  const mats = [side, side, toon(roof), toon(roof), toon(col, { map: face }), side];
  const b = mesh(new THREE.BoxGeometry(w, h, d), mats, { pos: [0, h / 2, 0] });
  g.add(b);
  // roof: gable prism of corrugated tin
  const roofTex = canvasTex(256, 256, (c, W, H) => { c.fillStyle = roof; c.fillRect(0, 0, W, H); for (let x = 0; x < W; x += 16) { c.fillStyle = "rgba(0,0,0,0.16)"; c.fillRect(x, 0, 6, H); c.fillStyle = "rgba(255,255,255,0.1)"; c.fillRect(x + 8, 0, 4, H); } for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(120,60,20,0.25)"; c.fillRect(r() * W, r() * H, 30, 50); } }, [2, 1]);
  const rh = Math.min(2.2, w * 0.3);
  const shape = new THREE.Shape(); shape.moveTo(-w / 2 - 0.35, 0); shape.lineTo(w / 2 + 0.35, 0); shape.lineTo(0, rh); shape.closePath();
  const rg = new THREE.ExtrudeGeometry(shape, { depth: d + 0.6, bevelEnabled: false });
  rg.translate(0, 0, -(d + 0.6) / 2);
  const rm = mesh(rg, [toon(roof), toon("#ffffff", { map: roofTex })], { pos: [0, h, 0] });
  g.add(rm);
  if (opt.awning) { const a = box(w * 0.9, 0.08, 1.4, opt.awning, { pos: [0, h * 0.62, d / 2 + 0.7], rot: [0.25, 0, 0] }); g.add(a); }
  return g;
}

export function jeepney(seed = 1, body = "#d8382f") {
  const g = new THREE.Group(); const r = rnd(seed);
  const side = canvasTex(512, 160, (c, W, H) => {
    c.fillStyle = body; c.fillRect(0, 0, W, H);
    c.fillStyle = "#f4c430"; c.fillRect(0, 90, W, 14); c.fillStyle = "#2b7bd8"; c.fillRect(0, 108, W, 10);
    for (let i = 0; i < 6; i++) { c.fillStyle = "#1b2433"; c.fillRect(60 + i * 72, 18, 56, 58); }
    fitText(c, "MAHAL KITA", W / 2, 140, W * 0.7, 30, "Luckiest Guy", 400, "#fff", "#241726", 5);
  });
  g.add(box(2.1, 1.5, 5.2, body, { pos: [0, 1.35, 0], mat: [toon(body, { map: side }), toon(body, { map: side }), toon("#c9ccd2"), toon(body), toon(body), toon(body)] }));
  g.add(box(2.0, 0.9, 1.6, "#c9ccd2", { pos: [0, 0.95, 3.3] }));
  g.add(box(1.9, 0.12, 0.2, "#d9dde4", { pos: [0, 0.75, 4.12] }));
  for (const [x, z] of [[-1, -1.7], [1, -1.7], [-1, 2.9], [1, 2.9]]) g.add(cyl(0.45, 0.45, 0.35, "#222228", { pos: [x * 1.02, 0.45, z], rot: [0, 0, Math.PI / 2] }));
  g.add(box(2.2, 0.1, 5.4, "#c9ccd2", { pos: [0, 2.15, 0] }));
  const horse = sphere(0.18, "#e8e8f0", { pos: [0, 1.6, 4.1] }); g.add(horse);
  return g;
}

export function pole(h = 8) {
  const g = new THREE.Group();
  g.add(cyl(0.13, 0.17, h, "#8a8f98", { pos: [0, h / 2, 0], seg: 8 }));
  g.add(box(1.8, 0.12, 0.12, "#6b5a45", { pos: [0, h - 0.6, 0] }));
  g.add(cyl(0.25, 0.25, 0.7, "#7d838c", { pos: [0.4, h - 1.3, 0.2], seg: 10 }));
  return g;
}
export function wire(a, b, sag = 0.8, r = 0.03, col = "#1b1b22") {
  const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; const p = new THREE.Vector3().lerpVectors(a, b, t); p.y -= Math.sin(t * Math.PI) * sag; pts.push(p); }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, r, 4, false), toon(col));
  m.userData.noND = true; m.castShadow = false;
  return m;
}

// flat sign board on two posts
export function signboard(w, h, draw, opt = {}) {
  const g = new THREE.Group();
  const tex = canvasTex(Math.round(160 * w), Math.round(160 * h), draw);
  const face = new THREE.MeshBasicMaterial({ map: tex });
  const board = mesh(new THREE.BoxGeometry(w, h, 0.12), [toon("#ddd"), toon("#ddd"), toon("#ddd"), toon("#ddd"), face, toon("#cfcfcf")], { pos: [0, (opt.post ?? 1.4) + h / 2, 0] });
  g.add(board);
  if ((opt.post ?? 1.4) > 0) for (const s of [-1, 1]) g.add(cyl(0.07, 0.07, (opt.post ?? 1.4) + h, "#6d7480", { pos: [s * w * 0.4, ((opt.post ?? 1.4) + h) / 2, -0.1], seg: 6 }));
  g.userData.tex = tex; g.userData.board = board;
  return g;
}
