// "₱20 na Bigas" shot plan + acting. Times = cleaned voice clock.
import * as THREE from "three";
import { H, SETS, citizen, JUAN } from "./sets.js";
import { Card } from "./kit.js";

export const OUTRO_T = 77.92;
export const DURATION = OUTRO_T + 6.5;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
const ease = (t, a, b) => ss((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const back = (x) => { x = clamp(x); const s = 2.2; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const popIn = (t, a, d = 0.3) => (t < a ? 0.001 : Math.max(0.001, back((t - a) / d)));
const blink = (t, seed) => { const per = 1.5 + (seed % 7) * 0.13; return ((t + seed * 0.37) % per) < 0.12 ? 1 : 0; };

export const LOOKS = {
  day: { top: "#3e7fd2", hor: "#b8d0ec", fog: [40, 320], sun: [0.55, 0.75, 0.45], sunCol: "#fff1dc", sunI: 2.6, hemiSky: "#bcd6ff", hemiGround: "#b39b74", hemiI: 1.35, sat: 1.1, expo: 1.0 },
  dream: { top: "#8fb8ff", hor: "#ffe0ef", fog: [30, 220], sun: [0.4, 0.8, 0.5], sunCol: "#fff3e0", sunI: 2.5, hemiSky: "#ffe3f3", hemiGround: "#d9b38a", hemiI: 1.6, sat: 1.18, expo: 1.06 },
  dusk: { top: "#3b3f8f", hor: "#f6a46e", fog: [30, 260], sun: [-0.2, 0.18, -0.95], sunCol: "#ffb37a", sunI: 2.3, hemiSky: "#9a8ad8", hemiGround: "#7a5a5a", hemiI: 1.15, sat: 1.14, expo: 0.97 },
  interior: { top: "#3a2a22", hor: "#6a4a3a", fog: [60, 400], sun: [0.25, 0.8, 0.55], sunCol: "#fff0d6", sunI: 2.2, hemiSky: "#ffe9c8", hemiGround: "#7a4a3a", hemiI: 1.5, sat: 1.08, expo: 1.02 },
};

export const SHOTS = [
  { id: "tag", set: "market", look: "day", t0: 0.0, focus: 6, blur: 6, cam: [[0, [2.2, 2.3, 13.0], [1.1, 1.4, 6.4], 44], [2.26, [2.0, 2.2, 12.0], [1.1, 1.4, 6.4], 42]] },
  { id: "rally", set: "rally", look: "day", t0: 2.26, focus: 14, blur: 0, cam: [[2.26, [0, 3.0, 9.5], [0, 3.6, -8], 52], [4.5, [0, 2.8, 8.0], [0, 3.6, -8], 50]] },
  { id: "whatif", set: "rally", look: "day", t0: 4.5, focus: 2.3, blur: 12, camFn: (t) => { const p = H.juan.root.position; const u = ease(t, 4.5, 6.4); return [[p.x + 0.35, 1.55, p.z - 2.6 + u * 0.5], [p.x + 0.05, 1.45, p.z], 38 - u * 4]; } },
  { id: "dreamA", act: "dream", set: "market", look: "dream", t0: 6.48, focus: 6, blur: 5, cam: [[6.48, [0, 1.7, 3.0], [0, 1.4, -8], 48], [8.2, [0.2, 1.75, 5.0], [0, 1.4, -6], 48]] },
  { id: "dreamB", act: "dream", set: "market", look: "dream", t0: 8.2, focus: 5, blur: 6, cam: [[8.2, [4.0, 0.9, -1.0], [-1, 1.3, -5], 44], [9.88, [4.0, 1.0, 0.2], [-1, 1.3, -4], 44]] },
  { id: "dreamC", act: "dream", set: "market", look: "dream", t0: 9.88, focus: 4, blur: 7, cam: [[9.88, [0.6, 1.2, 4.2], [0.4, 1.4, -3], 40], [11.58, [0.6, 1.25, 5.2], [0.4, 1.4, -2], 40]] },
  { id: "mayA", act: "may2025", set: "market", look: "day", t0: 11.58, focus: 3.2, blur: 9, cam: [[11.58, [2.4, 2.7, -11.4], [2.8, 2.6, -14.7], 40], [13.86, [2.5, 2.7, -12.0], [2.8, 2.6, -14.7], 38]] },
  { id: "mayB", act: "may2025", set: "market", look: "day", t0: 13.86, focus: 12, blur: 2, cam: [[13.86, [0.4, 2.7, -1.6], [0, 3.0, -15.5], 54], [16.28, [0.3, 2.6, -3.8], [0, 3.0, -15.5], 52]] },
  { id: "blocked", set: "market", look: "day", t0: 16.28, focus: 4.5, blur: 7, cam: [[16.28, [2.8, 1.65, -6.8], [-2.4, 1.4, -11.4], 44], [18.62, [2.6, 1.65, -7.4], [-2.4, 1.4, -11.4], 42]] },
  { id: "kadiwa", set: "market", look: "day", t0: 18.62, focus: 6, blur: 3, cam: [[18.62, [0, 4.4, -7.0], [0, 5.5, -15.5], 46], [20.78, [0, 5.0, -10.2], [0, 5.6, -15.5], 44]] },
  { id: "queueA", act: "queue", set: "market", look: "day", t0: 20.78, focus: 3.2, blur: 8, cam: [[20.78, [3.4, 1.6, -10.4], [1.2, 1.2, -12.6], 44], [23.44, [3.3, 1.6, -10.8], [1.2, 1.2, -12.4], 42]] },
  { id: "queueB", act: "queue", set: "market", look: "day", t0: 23.44, focus: 3.4, blur: 8, cam: [[23.44, [-1.5, 1.5, -7.8], [1.2, 1.0, -10.2], 44], [25.6, [-1.3, 1.5, -7.4], [1.2, 1.0, -9.8], 44]] },
  { id: "queueC", act: "queue", set: "market", look: "day", t0: 25.6, focus: 4, blur: 7, cam: [[25.6, [4.2, 1.7, -3.6], [1.2, 1.2, -6.8], 44], [28.04, [4.4, 1.75, -3.2], [1.2, 1.2, -6.4], 44]] },
  { id: "palA", act: "palengke", set: "market", look: "day", t0: 28.04, focus: 10, blur: 3, cam: [[28.04, [1.5, 3.2, 20], [-2, 1.4, 9], 48], [31.08, [0.5, 2.6, 16.5], [-2.6, 1.5, 9.4], 46]] },
  { id: "palB", act: "palengke", set: "market", look: "day", t0: 31.08, focus: 4, blur: 8, cam: [[31.08, [-0.8, 1.78, 13.2], [-3.4, 1.6, 9.4], 44], [33.76, [-1.0, 1.75, 12.6], [-3.4, 1.55, 9.4], 42]] },
  { id: "threeA", act: "three", set: "field", look: "day", t0: 33.76, focus: 16, blur: 3, cam: [[33.76, [0, 3.0, 27.5], [0, 2.3, 9], 46], [36.18, [0, 3.0, 25.5], [0, 2.3, 9], 45]] },
  { id: "threeB", act: "three", set: "field", look: "day", t0: 36.18, focus: 5.5, blur: 6, cam: [[36.18, [-4.5, 1.3, 14], [-1.2, 2.4, 9], 42], [39.32, [4.5, 1.3, 14], [1.2, 2.4, 9], 42]] },
  { id: "unaA", act: "una", set: "home", look: "interior", t0: 39.32, focus: 4.6, blur: 5, cam: [[39.32, [0.4, 2.0, 5.6], [0.5, 1.4, -0.6], 48], [42.54, [0.5, 1.95, 5.0], [0.5, 1.4, -0.5], 46]] },
  { id: "unaB", act: "una", set: "home", look: "interior", t0: 42.54, focus: 2.8, blur: 8, cam: [[42.54, [1.0, 1.75, 2.6], [0.8, 1.45, -0.2], 42], [45.86, [1.0, 1.85, 3.0], [0.8, 1.6, -0.2], 42]] },
  { id: "unaC", act: "una", set: "home", look: "interior", t0: 45.86, focus: 4.2, blur: 5, cam: [[45.86, [-2.6, 2.2, 4.2], [0.6, 1.5, -0.4], 48], [48.84, [-2.2, 2.1, 3.8], [0.6, 1.6, -0.4], 46]] },
  { id: "farmA", act: "farmer_sad", set: "field", look: "day", t0: 48.84, focus: 14, blur: 3, cam: [[48.84, [-3, 4.5, 16], [2.5, 1, 3], 46], [51.9, [-1, 3.2, 12], [2.5, 1.2, 3.5], 46]] },
  { id: "farmB", act: "farmer_sad", set: "field", look: "day", t0: 51.9, focus: 5.2, blur: 7, cam: [[51.9, [3.4, 1.8, 9.8], [3.2, 1.3, 3.8], 46], [54.6, [3.4, 1.75, 9.0], [3.2, 1.3, 3.8], 44]] },
  { id: "farmC", act: "farmer_sad", set: "field", look: "day", t0: 54.6, focus: 2.6, blur: 11, cam: [[54.6, [2.8, 1.6, 6.6], [2.5, 1.45, 4], 38], [56.38, [2.8, 1.6, 6.3], [2.5, 1.45, 4], 36]] },
  { id: "govA", act: "gov_buy", set: "field", look: "day", t0: 56.38, focus: 9, blur: 3, cam: [[56.38, [9.5, 1.6, 8], [6.5, 1.8, -4], 46], [58.54, [9.2, 1.7, 7], [6.0, 1.8, 0], 46]] },
  { id: "govB", act: "gov_buy", set: "field", look: "day", t0: 58.54, focus: 5, blur: 6, cam: [[58.54, [2.6, 1.75, 9.4], [2.6, 1.4, 3.8], 44], [60.76, [2.6, 1.7, 8.6], [2.6, 1.4, 3.8], 42]] },
  { id: "govC", act: "gov_buy", set: "field", look: "day", t0: 60.76, focus: 3.0, blur: 10, cam: [[60.76, [1.0, 1.5, 7.4], [1.6, 1.4, 4.4], 40], [62.02, [1.2, 1.5, 7.0], [1.6, 1.4, 4.4], 38]] },
  { id: "aniA", act: "ani", set: "field", look: "day", t0: 62.02, focus: 30, blur: 0, cam: [[62.02, [0, 3.0, 17], [0, 1.0, 0], 50], [65.96, [2, 4.0, 19], [0, 0.8, -4], 52]] },
  { id: "aniB", act: "kita", set: "field", look: "day", t0: 65.96, focus: 2.8, blur: 10, cam: [[65.96, [2.2, 1.6, 7.0], [1.6, 1.4, 4.4], 40], [68.46, [2.1, 1.6, 6.6], [1.6, 1.4, 4.4], 38]] },
  { id: "aniC", act: "ani", set: "field", look: "day", t0: 68.46, focus: 12, blur: 2, cam: [[68.46, [0, 3.5, 14], [0, 1.0, -2], 50], [70.48, [0, 4.5, 15], [0, 1.0, -4], 50]] },
  { id: "aniD", act: "ani", set: "field", look: "day", t0: 70.48, focus: 30, blur: 0, cam: [[70.48, [0, 6.0, 18], [0, 0.5, -6], 54], [72.26, [0, 15.0, 27], [0, 0, -20], 56]] },
  { id: "dqA", act: "dream_q", set: "field", look: "dusk", t0: 72.26, focus: 4.5, blur: 6, cam: [[72.26, [0.4, 1.9, 16.4], [0, 1.5, 2], 46], [74.84, [0.3, 1.85, 15.4], [0, 1.5, 2], 44]] },
  { id: "dqB", act: "dream_q", front: true, set: "field", look: "dusk", t0: 74.84, focus: 3.8, blur: 7, cam: [[74.84, [-0.1, 2.3, 7.2], [-0.2, 1.4, 11.3], 48], [77.92, [-0.1, 2.25, 7.7], [-0.2, 1.4, 11.3], 46]] },
];
for (let i = 0; i < SHOTS.length; i++) SHOTS[i].t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : OUTRO_T;
export const KICKS = [8.2, 9.88, 13.86, 42.54, 45.86, 51.9, 54.6, 58.54, 60.76, 65.96, 68.46, 74.84, 0.05, 2.98, 14.82, 16.68, 22.2, 23.44, 24.56, 25.6, 26.62, 31.22, 34.76, 42.84, 46.26, 52.78, 59.5, 70.48];
export const FLASH = [[2.26, 0.2], [6.42, 0.6], [11.58, 0.25], [39.32, 0.2], [72.26, 0.2]];
export function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return s; }

const tA = new THREE.Vector3(), tB = new THREE.Vector3();
export function cameraAt(shot, t, cam) {
  const off = SETS[shot.set].position;
  let pos, look, fov;
  if (shot.camFn) { const [p, l, f] = shot.camFn(t); pos = new THREE.Vector3(...p); look = new THREE.Vector3(...l); fov = f; }
  else {
    const k = shot.cam; let a = k[0], b = k[k.length - 1];
    for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { a = k[i]; b = k[i + 1]; }
    const u = a === b ? 0 : ease(t, a[0], b[0]);
    pos = tA.set(...a[1]).lerp(tB.set(...b[1]), u).clone(); look = new THREE.Vector3(...a[2]).lerp(new THREE.Vector3(...b[2]), u); fov = a[3] + (b[3] - a[3]) * u;
  }
  let shake = 0;
  for (const kt of KICKS) { const df = (t - kt) * 30; if (df >= 0 && df < 8) shake += (df % 2 < 1 ? 1 : -1) * (1 - df / 8) * 0.011; }
  cam.position.copy(pos).add(off); cam.fov = fov; cam.up.set(0, 1, 0); cam.lookAt(look.add(off)); cam.rotateZ(shake); cam.position.y += shake * 3; cam.updateProjectionMatrix();
}

const cards = [];
export function allCards() {
  if (cards.length) return cards;
  cards.push(H.speaker, ...H.crowd, H.guard, H.mJuan, H.vendor, ...H.queue, ...H.dreamers, ...H.family, H.farmer, ...H.helpers, ...H.farmFam, H.buyer, ...EXTRA);
  return cards;
}
const EXTRA = [];
let thought, xmark, bang;
export function setupExtras(scene) {
  thought = new Card({ t: 0 }, 0.9, "question"); SETS.rally.add(thought.root); EXTRA.push(thought);
  xmark = new Card({ t: 0 }, 1.1, "bang"); SETS.market.add(xmark.root); EXTRA.push(xmark);
  bang = new Card({ t: 0 }, 1.0, "bang"); SETS.field.add(bang.root); EXTRA.push(bang);
  for (const c of EXTRA) { if (c.shadow) c.shadow.visible = false; c.root.visible = false; }
}

let eligKey = -1;
function paintElig(n) {
  if (n === eligKey) return; eligKey = n;
  const c = H.eligTex.userData.c, W = 800, Hh = 1000;
  c.fillStyle = "#fffdf5"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#2c8a4a"; c.fillRect(0, 0, W, 170);
  c.font = "400 78px 'Luckiest Guy'"; c.textAlign = "center"; c.fillStyle = "#fff"; c.fillText("₱20 BIGAS", W / 2, 80); c.font = "800 44px Baloo"; c.fillText("PARA LANG SA:", W / 2, 145);
  const items = ["SENIOR CITIZEN", "PWD", "SOLO PARENT", "4Ps", "MINIMUM WAGE"];
  items.forEach((s, i) => { if (i >= n) return; const y = 260 + i * 150; c.fillStyle = "#3aa76d"; c.beginPath(); c.arc(90, y - 14, 34, 0, 7); c.fill(); c.strokeStyle = "#fff"; c.lineWidth = 10; c.beginPath(); c.moveTo(72, y - 14); c.lineTo(86, y); c.lineTo(110, y - 34); c.stroke(); c.textAlign = "left"; c.font = "800 62px Baloo"; c.fillStyle = "#1d1d1d"; c.fillText(s, 150, y + 6); });
  c.strokeStyle = "#1d1d1d"; c.lineWidth = 16; c.strokeRect(0, 0, W, Hh);
  H.eligTex.needsUpdate = true;
}

export function animate(t, shot) {
  const id = shot.act || shot.id;
  for (const s of Object.values(SETS)) s.traverse((o) => { if (o.material && o.material.userData && o.material.userData.anim) o.material.map.offset.y = -t * 0.03; });
  // ---------------- rally
  if (shot.set === "rally") {
    const behind = id === "rally";
    H.crowd.forEach((c, i) => {
      const cheer = t > 2.9 + (i % 5) * 0.05;
      c.set({ back: behind, armL: cheer ? 2.5 + Math.sin(t * 8 + i) * 0.25 : 0.2, armR: cheer ? 2.7 + Math.cos(t * 8 + i) * 0.25 : 0.2, expr: cheer ? "happy" : "smile", blink: blink(t, i) });
      c.root.position.y = cheer ? Math.abs(Math.sin(t * 6 + i)) * 0.12 : 0;
    });
    const j = H.juan;
    if (id === "whatif") { j.set({ ...JUAN(), back: false, armL: 0.25, armR: t > 5.0 ? 1.4 : 0.25, expr: t > 5.0 ? "happy" : "neutral", look: -0.5, blink: blink(t, 2), sparkle: 0 }); j.root.position.y = 0; }
    else j.set({ ...JUAN(), back: behind });
    const pump = t > 2.98 ? Math.abs(Math.sin((t - 2.98) * 7)) : 0;
    H.speaker.set({ armR: 2.3 + pump * 0.5, armL: 0.3, talk: Math.floor(t * 9) % 2, expr: "grin", blink: blink(t, 1) });
    H.confetti.forEach((p, k) => { const t0 = 2.95 + (k % 14) * 0.05; const u = t - t0; p.visible = u > 0; p.position.set(-7 + (k * 37 % 140) / 10 + Math.sin(u * 2 + k) * 0.4, 8 - u * 2.6, -6 + (k * 53 % 140) / 10); p.rotation.set(u * 5 + k, u * 4, k); });
    thought.root.visible = id === "whatif" && t > 4.9;
    if (thought.root.visible) { const p = H.juan.root.position; thought.root.position.set(p.x - 0.55, 1.9, p.z); thought.set({ t: t - 4.9 }); }
  }
  // ---------------- market
  if (shot.set === "market") {
    const dream = id === "dream";
    H.queue.forEach((c) => (c.root.visible = id === "queue" || id === "kadiwa"));
    H.guard.root.visible = !dream && id !== "tag";
    H.dreamers.forEach((c, k) => {
      c.root.visible = dream;
      const x = -2.4 + (k % 5) * 1.2 + (k > 4 ? 0.6 : 0), z0 = -9 + (k > 4 ? 2.5 : 0) - (k % 3) * 1.4;
      c.root.position.set(x, 0, z0 + (t - 6.48) * 1.5);
      c.set({ walk: t * 8 + k, armL: 0.3 + Math.sin(t * 8 + k) * 0.25, armR: k % 3 === 0 ? 2.6 + Math.sin(t * 9) * 0.2 : 0.5, hold: "ricebag", expr: "happy", blink: 0 });
    });
    // queue pop-ins on their words
    const qT = [22.2, 23.44, 24.56, 25.6, 26.62];
    H.queue.forEach((c, i) => { const s = id === "queue" ? popIn(t, qT[i] - 0.05) : 1; c.root.scale.setScalar(s); c.set({ blink: blink(t, i + 3), lean: id === "queue" && t > qT[i] && t < qT[i] + 0.5 ? Math.sin((t - qT[i]) * 20) * 0.06 : 0, roll: t * 0.5 }); });
    paintElig(id === "queue" ? qT.filter((q) => t >= q).length : id === "may2025" || id === "blocked" || id === "kadiwa" ? 0 : 5);
    // May 2025 opening: calendar pop, ribbon cut, ₱20 sign bounce
    H.cal.scale.setScalar(id === "may2025" ? popIn(t, 11.6, 0.25) : 1);
    H.ribbon.visible = id === "may2025" ? t < 13.9 : false;
    H.p20.scale.setScalar(id === "may2025" ? popIn(t, 14.75, 0.35) : 1);
    // tag on the sack pile
    H.tag.scale.setScalar(id === "tag" ? popIn(t, 0.05, 0.35) : 1);
    H.tag.rotation.z = id === "tag" ? Math.sin(t * 3) * 0.06 : 0;
    // Juan: blocked by the guard, then at the palengke with his wallet
    const mj = H.mJuan; mj.root.visible = id === "blocked" || id === "palengke";
    if (id === "blocked") {
      const walkU = lin(t, 16.28, 16.75);
      mj.root.position.set(-1.6, 0, -8.6 - walkU * 1.6);
      mj.set({ ...JUAN(), walk: walkU < 1 ? t * 9 : 0, expr: t > 16.75 ? "shock" : "happy", armL: 0.2, armR: 0.2, hold: undefined, blink: 0 });
      const g = ease(t, 16.45, 16.7);
      H.guard.root.position.set(-3.6 + g * 1.0, 0, -12.2 + g * 0.8);
      H.guard.set({ armR: 0.2 + g * 1.5, armL: 0.2, expr: "angry", talk: t > 16.7 && t < 17.6 ? Math.floor(t * 8) % 2 : 0 });
      xmark.root.visible = t > 16.68 && t < 18.62; xmark.root.position.set(-2.1, 2.2, -10.6); xmark.set({ t: t - 16.68 });
    } else { H.guard.root.position.set(-3.6, 0, -12.2); H.guard.set({ armR: 0.2, armL: 0.2, expr: "neutral", talk: 0 }); xmark.root.visible = false; }
    if (id === "palengke") {
      mj.root.position.set(-2.2, 0, 10.6);
      const open = t > 32.4;
      mj.set({ ...JUAN(), walk: 0, expr: open ? "sad" : t > 31.3 ? "shock" : "neutral", hold: "wallet", armR: open ? 1.3 : 0.5, armL: 0.2, look: -1, blink: blink(t, 4), lean: open ? -0.04 : 0 });
      H.p46.scale.setScalar(popIn(t, 31.15, 0.35));
      H.vendor.set({ expr: "smile", talk: t > 30.2 && t < 31.6 ? Math.floor(t * 8) % 2 : 0, armR: t > 31.2 && t < 32.2 ? 1.6 : 0.2 });
    } else H.p46.scale.setScalar(1);
    H.pile.visible = id === "tag"; H.tag.visible = id === "tag";
  }
  // ---------------- home: piggy bank grows
  if (shot.set === "home") {
    const s1 = ease(t, 42.8, 43.3) * 0.6, s2 = ease(t, 46.2, 46.6) * 0.7;
    const wob = Math.sin((t - 46.26) * 18) * Math.exp(-(t - 46.26) * 4) * (t > 46.26 ? 0.12 : 0) + Math.sin((t - 42.84) * 18) * Math.exp(-(t - 42.84) * 4) * (t > 42.84 ? 0.08 : 0);
    H.pig.scale.setScalar(1 + s1 + s2 + wob);
    H.coins.forEach((cn, k) => { const t0 = 42.75 + k * 0.05 + (k > 8 ? 3.4 : 0); const u = t - t0; cn.visible = u > 0 && u < 0.5; cn.position.set(0.7 + Math.sin(k) * 0.05, 2.6 - u * 3.2, -0.2); cn.rotation.set(u * 9, 0, u * 6); });
    const cheer = t > 46.3;
    H.family.forEach((c, i) => { c.set({ expr: cheer ? "happy" : t > 42.9 ? "smile" : "smile", armL: cheer ? 2.6 + Math.sin(t * 9 + i) * 0.2 : 0.25, armR: cheer ? 2.6 + Math.cos(t * 9 + i) * 0.2 : i === 0 && t > 43 ? 1.4 : 0.25, blink: blink(t, i), look: i === 0 ? 0.6 : -0.6 }); c.root.position.y = cheer ? Math.abs(Math.sin(t * 7 + i)) * 0.15 : 0; });
  }
  // ---------------- field
  if (shot.set === "field") {
    H.idea.forEach((s, i) => { s.visible = id === "three"; s.scale.setScalar(id === "three" ? popIn(t, 34.76 + i * 0.3, 0.35) : 1); });
    // farmer: harvesting, sad at the price, happy when the government buys
    const f = H.farmer; f.root.visible = id === "farmer_sad" || id === "gov_buy" || id === "kita";
    const sad = id === "farmer_sad" && t > 53.2, dance = id === "gov_buy" && t > 60.6;
    if (id === "kita") { f.root.position.set(1.6, Math.abs(Math.sin(t * 6)) * 0.08, 4.4); f.set({ hold: "money", armR: 1.5 + Math.sin(t * 8) * 0.15, armL: 0.4, expr: "happy", lean: Math.sin(t * 4) * 0.04, blink: 0 }); }
    else f.root.position.set(id === "gov_buy" ? 1.6 : 2.5, dance ? Math.abs(Math.sin(t * 9)) * 0.25 : 0, id === "gov_buy" ? 4.4 : 4);
    if (id !== "kita") f.set({ hold: id === "farmer_sad" && t < 53.2 ? "sickle" : sad ? "coins" : id === "gov_buy" && t > 59.4 ? "money" : undefined,
      armR: id === "farmer_sad" && t < 53.2 ? 0.8 + Math.abs(Math.sin(t * 5)) * 1.2 : sad ? 1.0 : dance ? 2.6 + Math.sin(t * 9) * 0.3 : 1.0,
      armL: dance ? 2.6 + Math.cos(t * 9) * 0.3 : 0.25, expr: sad ? "sad" : dance ? "happy" : id === "gov_buy" ? (t > 59.4 ? "smile" : "shock") : "neutral",
      lean: id === "farmer_sad" && t < 53.2 ? 0.15 * Math.abs(Math.sin(t * 5)) : dance ? Math.sin(t * 9) * 0.1 : sad ? 0.05 : 0, blink: blink(t, 5) });
    H.palaySign.visible = id === "farmer_sad"; H.palaySign.scale.setScalar(id === "farmer_sad" ? popIn(t, 52.7, 0.35) : 1);
    bang.root.visible = id === "farmer_sad" && t > 52.8 && t < 54.2; bang.root.position.set(2.9, 2.4, 4); bang.set({ t: t - 52.8 });
    // government truck arrives, buyer hands money, sacks go to the truck
    const tr = H.truck; tr.visible = id === "gov_buy";
    const arrive = ease(t, 56.4, 57.6);
    tr.position.set(6.5, 0, -14 + arrive * 14.5);
    const b = H.buyer; b.root.visible = id === "gov_buy" && t > 57.9;
    b.root.position.set(4.4 - ease(t, 57.9, 58.8) * 1.0, 0, 3.6); b.set({ hold: t < 59.4 ? "money" : undefined, armL: 0.2, armR: t < 59.4 ? 1.0 + ease(t, 58.8, 59.4) * 0.5 : 0.25, expr: "smile", walk: t < 58.8 ? t * 9 : 0, blink: blink(t, 7), look: -1 });
    H.fieldSacks.forEach((s, k) => { s.visible = id === "gov_buy" || id === "farmer_sad"; const u = id === "gov_buy" ? ease(t, 59.7 + k * 0.18, 60.3 + k * 0.18) : 0; s.position.set(0.4 + (k % 3) * 0.7 + u * (6.5 - 0.4 - (k % 3) * 0.7), (k > 2 ? 0.62 : 0) + Math.sin(u * Math.PI) * 1.6, 5.4 + (k > 2 ? 0 : 0) - u * 6); });
    // more farmers + crops grow
    H.helpers.forEach((c, k) => {
      const t0 = 68.4 + k * 0.08; c.root.visible = id === "ani" && t > t0;
      c.root.position.set(-10 + (k % 5) * 5 + (k > 4 ? 2.5 : 0), 0, 3 - (k > 4 ? 7 : 0) - (k % 2) * 2);
      c.root.scale.setScalar(popIn(t, t0)); c.set({ armL: 0.6 + Math.abs(Math.sin(t * 5 + k)) * 0.8, armR: 0.9 + Math.abs(Math.sin(t * 5 + k + 1)) * 0.8, lean: 0.25 + Math.sin(t * 5 + k) * 0.08, expr: "happy", blink: 0 });
    });
    const grow = id === "ani" ? 1 + ease(t, 69.8, 71.6) * 0.9 : id === "dream_q" ? 1.9 : 1;
    const gold = id === "ani" ? ease(t, 70.2, 71.8) : id === "dream_q" ? 1 : 0;
    if (H._grow !== grow) {
      H._grow = grow; const m4 = new THREE.Matrix4(); const sc = new THREE.Vector3(); const pp = new THREE.Vector3();
      H.plantInfo.forEach((p, k) => { const g = grow; sc.set(1 + (g - 1) * 0.4, p.h * g, 1 + (g - 1) * 0.4); pp.set(p.x, 0, p.z); m4.compose(pp, p.q, sc); H.plants.setMatrixAt(k, m4); });
      H.plants.instanceMatrix.needsUpdate = true;
    }
    H.plants.material.color.setRGB(1 + gold * 0.6, 1 + gold * 0.25, 1 - gold * 0.6);
    // farmer family at dusk
    H.farmFam.forEach((c, i) => { c.root.visible = id === "dream_q"; const turn = t > 76.7 && i === 0; c.set({ back: shot.front ? false : !turn, expr: shot.front ? (t > 76.7 ? "happy" : "smile") : turn ? "smile" : "neutral", armL: 0.2, armR: i === 0 && t > 73.4 && t < 76.7 ? 1.1 : 0.2, look: 0, blink: blink(t, i) }); });
  }
}
