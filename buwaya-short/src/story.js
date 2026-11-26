// Shot plan, camera, and per-set animation. All times in seconds on the cleaned voice track.
import * as THREE from "three";
import { H, SETS, citizen, CROC } from "./sets.js";
import { drawChar, INK } from "./toon.js";
import { fitText, rnd } from "./kit.js";
import { buildActs, animateActs, actCards } from "./acts.js";

export const DURATION = 74.0;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); }; // smootherstep
const ease = (t, a, b) => ss((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const bounce = (x) => { x = clamp(x); return 1 - Math.cos(x * 6.5) * Math.exp(-x * 5.5) ; };
const pop = (t, a, d = 0.25) => { const x = clamp((t - a) / d); return x <= 0 ? 0 : 1 + Math.sin(x * Math.PI) * 0.25 * (1 - x) + (x < 1 ? -(1 - x) * 0.0 : 0); };
const blink = (t, seed) => { const per = 1.4 + (seed % 7) * 0.13; const ph = (t + seed * 0.37) % per; return ph < 0.13 ? 1 : 0; };

// ---------------------------------------------------------------- looks (sky + light per set)
export const LOOKS = {
  day: { top: "#3e7fd2", hor: "#b8d0ec", fog: [40, 320], sun: [0.55, 0.75, 0.45], sunCol: "#fff1dc", sunI: 2.6, hemiSky: "#bcd6ff", hemiGround: "#b39b74", hemiI: 1.35, sat: 1.1, expo: 1.0 },
  warm: { top: "#4a86d4", hor: "#f0d8b0", fog: [40, 300], sun: [-0.5, 0.55, 0.6], sunCol: "#ffd9a8", sunI: 2.5, hemiSky: "#c8d8ff", hemiGround: "#b38a64", hemiI: 1.25, sat: 1.12, expo: 1.0 },
  dusk: { top: "#3b3f8f", hor: "#f2a27a", fog: [30, 260], sun: [-0.7, 0.25, -0.6], sunCol: "#ffb37a", sunI: 2.2, hemiSky: "#8a8ad8", hemiGround: "#6a4a6a", hemiI: 1.1, sat: 1.12, expo: 0.95 },
  interior: { top: "#3a2a22", hor: "#6a4a3a", fog: [60, 400], sun: [0.25, 0.8, 0.55], sunCol: "#fff0d6", sunI: 2.2, hemiSky: "#ffe9c8", hemiGround: "#7a4a3a", hemiI: 1.5, sat: 1.06, expo: 1.0 },
};

// ---------------------------------------------------------------- shots
// cam keys are in set-local coordinates: [time, pos[x,y,z], look[x,y,z], fov]
export const SHOTS = [
  { id: "hook_river", set: "river", look: "day", t0: 0.0, focus: 6, blur: 7, cam: [[0, [2.5, 9, 26], [2.5, 0.4, 4], 44], [1.2, [2.5, 1.1, 10.0], [2.5, 0.5, 4], 40], [2.68, [2.45, 0.95, 8.4], [2.5, 0.75, 4], 38]] },
  { id: "out_of_river", set: "river", look: "day", t0: 2.68, focus: 7, blur: 4, cam: [[2.68, [1.4, 1.7, 9.2], [2.5, 1.0, 4], 44], [3.45, [1.9, 1.9, 9.2], [3.4, 1.2, 4], 44], [3.95, [6.5, 3.4, 10.5], [12.8, 2.8, 3.6], 46], [4.96, [8.0, 3.5, 9.8], [14.7, 3.0, 1.8], 46]] },
  { id: "hall_wide", set: "hall", look: "interior", t0: 4.96, focus: 5, blur: 5, cam: [[4.96, [0, 1.55, 6.9], [0, 1.15, 0.5], 46], [6.86, [0, 1.6, 6.0], [0, 1.2, 0.5], 44]] },
  { id: "barong", set: "hall", look: "interior", t0: 6.86, focus: 3, blur: 10, cam: [[6.86, [0.3, 1.0, 7.0], [0, 0.9, 4], 38], [8.2, [0.3, 1.9, 7.0], [0, 1.65, 4], 38]] },
  { id: "grin", set: "hall", look: "interior", t0: 8.22, focus: 3.3, blur: 12, cam: [[8.22, [0.25, 1.55, 7.5], [0.2, 1.47, 4], 34], [9.58, [0.25, 1.55, 7.2], [0.2, 1.47, 4], 32]] },
  { id: "tarp", set: "town", look: "day", t0: 9.58, focus: 4, blur: 4, cam: [[9.58, [2.6, 1.3, -37.6], [0.4, 6.0, -62], 52], [10.86, [2.5, 1.35, -38.4], [0.4, 6.2, -62], 50]] },
  { id: "projects", set: "river", look: "day", t0: 10.86, focus: 50, blur: 0, cam: [[10.86, [0, 16, 40], [0, 2, 10], 55], [15.5, [-4, 26, 30], [0, 2, -30], 60], [19.9, [0, 48, 30], [0, 0, -90], 62]] },
  { id: "money_big", set: "money", look: "warm", t0: 19.9, focus: 14, blur: 0, cam: [[19.9, [0, 1.2, 9], [0, 0.8, 0], 48], [21.2, [0, 2.6, 11], [0, 2.4, -1], 50], [23.26, [0, 3.4, 13], [0, 2.0, -1], 50]] },
  { id: "money_split", set: "money", look: "warm", t0: 23.26, focus: 16, blur: 0, cam: [[23.26, [0, 5, 15], [0, 1.2, -0.8], 52], [27.9, [0, 6.2, 17.5], [0, 1.0, -0.8], 54]] },
  { id: "money_go", set: "money", look: "warm", t0: 27.98, focus: 12, blur: 4, cam: [[27.98, [-4, 3.5, 12], [-6, 1.2, 0], 50], [29.0, [14, 3.0, 12], [20, 1.4, 0], 50], [30.82, [15.5, 2.6, 10.5], [22, 1.5, 0.5], 46]] },
  { id: "sign", set: "pandi", look: "day", t0: 30.82, focus: 12, blur: 6, cam: [[30.82, [-1.4, 3.0, 8.8], [-4.5, 2.6, -4], 44], [36.6, [-1.8, 3.0, 7.8], [-4.5, 2.6, -4], 42]] },
  { id: "calendar", set: "pandi", look: "day", t0: 36.6, focus: 4, blur: 10, cam: [[36.6, [-1.8, 2.2, 1.7], [-2.6, 2.15, -2.4], 40], [38.62, [-1.9, 2.2, 1.3], [-2.6, 2.15, -2.4], 38]] },
  { id: "judges", set: "pandi", look: "day", t0: 38.62, focus: 6, blur: 7, cam: [[38.62, [1.2, 1.35, 9], [0.2, 1.3, 2], 42], [40.48, [1.1, 1.4, 8.0], [0.2, 1.3, 2], 40]] },
  { id: "grass", set: "pandi", look: "day", t0: 40.48, focus: 12, blur: 3, cam: [[40.48, [0.4, 2.0, 2.8], [0.5, 1.0, -10], 50], [42.1, [0.4, 2.3, 1.6], [0.5, 0.9, -10], 48]] },
  { id: "sheets", set: "pandi", look: "day", t0: 42.14, focus: 5.2, blur: 9, cam: [[42.14, [3.4, 3.3, -3.4], [3.2, 0.9, -8.0], 46], [44.1, [3.5, 3.2, -3.9], [3.2, 0.9, -8.0], 44]] },
  { id: "tag", set: "pandi", look: "day", t0: 44.14, focus: 3.4, blur: 11, cam: [[44.14, [-0.8, 2.45, -5.7], [-0.8, 1.95, -9.2], 40], [47.2, [-0.8, 2.4, -6.1], [-0.8, 1.95, -9.2], 38]] },
  { id: "judge_cu", set: "pandi", look: "day", t0: 47.22, focus: 1.6, blur: 14, cam: [[47.22, [0.0, 1.55, -1.4], [0.0, 1.5, -3.0], 36], [48.56, [0.0, 1.55, -1.55], [0.0, 1.5, -3.0], 34]] },
  { id: "flood", set: "pandi", look: "day", t0: 48.56, focus: 18, blur: 0, cam: [[48.56, [9, 5.5, 10], [-2, 0.5, -8], 54], [50.96, [10, 6.5, 12], [-2, 0.5, -6], 56]] },
  { id: "ghosts", set: "river", look: "dusk", t0: 50.96, focus: 40, blur: 0, cam: [[50.96, [0, 9, 32], [0, 5, -5], 55], [56.2, [0, 13, 38], [0, 7, -20], 58]] },
  { id: "eatery", set: "eatery", look: "interior", t0: 56.26, focus: 5, blur: 6, cam: [[56.26, [-1.5, 2.6, 6.5], [2.0, 2.6, -3.5], 50], [58.3, [0.5, 3.1, 3.2], [3.2, 3.5, -4.4], 46]] },
  { id: "tv", set: "eatery", look: "interior", t0: 58.4, focus: 3, blur: 9, cam: [[58.4, [3.2, 3.55, -1.2], [3.2, 3.55, -4.4], 42], [59.82, [3.2, 3.55, -1.6], [3.2, 3.55, -4.4], 40]] },
  { id: "shrug", set: "town", look: "day", t0: 59.82, focus: 3.2, blur: 10, cam: [[59.82, [0.4, 1.55, -46.5], [0, 1.4, -50], 40], [62.5, [0.35, 1.6, -47.1], [0, 1.45, -50], 38]] },
  { id: "swim", set: "town", look: "day", t0: 62.54, focus: 7, blur: 6, cam: [[62.54, [-1.5, 1.9, 14], [0, 1.2, 4], 46], [65.0, [-1.2, 2.0, 12.5], [0, 1.2, 4], 44]] },
  { id: "suv", set: "town", look: "day", t0: 65.02, focus: 7, blur: 4, cam: [[65.02, [-2.4, 1.7, 10.5], [1.8, 1.6, -3], 46], [67.2, [-2.7, 1.9, 11.0], [1.8, 1.8, 6.5], 48]] },
  { id: "ballot", set: "ballot", look: "interior", t0: 67.26, focus: 0.85, blur: 7, cam: [[67.26, [-0.4, 1.95, 0.95], [-0.4, 1.0, 0.35], 40], [70.2, [-0.4, 1.85, 0.32], [-0.4, 1.0, -0.12], 38], [71.06, [-0.4, 1.8, 0.27], [-0.4, 1.0, -0.1], 36]] },
  { id: "tail", set: "ballot", look: "interior", t0: 71.06, focus: 1.8, blur: 7, cam: [[71.06, [0.45, 1.6, 1.95], [1.5, 1.15, -0.1], 46], [74.0, [0.5, 1.55, 1.75], [1.5, 1.15, -0.1], 44]] },
];
for (let i = 0; i < SHOTS.length; i++) SHOTS[i].t1 = i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : DURATION;

export const KICKS = [8.52, 10.28, 20.04, 23.52, 29.1, 34.52, 40.48, 43.35, 47.3, 49.4, 58.48, 61.84, 66.38, 71.38];
export const FLASH = [[4.96, 0.35], [19.9, 0.25], [30.82, 0.2], [62.54, 0.2], [71.06, 0.3]];

export function shotAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; return s; }

const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3();
export function cameraAt(shot, t, cam) {
  const k = shot.cam; let a = k[0], b = k[k.length - 1];
  for (let i = 0; i < k.length - 1; i++) if (t >= k[i][0] && t <= k[i + 1][0]) { a = k[i]; b = k[i + 1]; }
  const u = a === b ? 0 : ease(t, a[0], b[0]);
  const off = SETS[shot.set].position;
  tmpA.set(...a[1]).lerp(tmpB.set(...b[1]), u);
  const look = new THREE.Vector3(...a[2]).lerp(new THREE.Vector3(...b[2]), u);
  cam.position.copy(tmpA).add(off);
  cam.fov = a[3] + (b[3] - a[3]) * u;
  // impact kick: flip-sign shake decaying over 7 frames
  let shake = 0;
  for (const kt of KICKS) { const df = (t - kt) * 30; if (df >= 0 && df < 8) shake += (df % 2 < 1 ? 1 : -1) * (1 - df / 8) * 0.012; }
  look.add(off);
  cam.up.set(0, 1, 0);
  cam.lookAt(look);
  cam.rotateZ(shake + (shot.roll || 0));
  cam.position.y += shake * 3;
  cam.updateProjectionMatrix();
}

// ---------------------------------------------------------------- canvases that change over time
let tarpDone = false;
function paintTarp() {
  if (tarpDone) return; tarpDone = true;
  const c = H.tarpTex.userData.c, W = 1000, Hh = 600;
  const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, "#1d4f9a"); g.addColorStop(1, "#3a7fd8"); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
  c.fillStyle = "#f4c430"; c.fillRect(0, Hh - 90, W, 90);
  const tmp = document.createElement("canvas"); tmp.width = 600; tmp.height = 1000;
  drawChar(tmp.getContext("2d"), CROC({ expr: "grin", armR: 2.6, shades: 0 }));
  c.drawImage(tmp, 0, 0, 600, 1000, 560, 30, 420, 700);
  fitText(c, "SALAMAT PO,", 300, 110, 520, 86, "Luckiest Guy", 400, "#ffffff", INK, 10);
  fitText(c, "KONSEHAL", 300, 220, 520, 96, "Luckiest Guy", 400, "#f4c430", INK, 10);
  fitText(c, "BUWAYA!", 300, 340, 520, 130, "Luckiest Guy", 400, "#ffffff", INK, 12);
  fitText(c, "SA INYONG MGA PROYEKTO", 500, Hh - 45, W * 0.9, 60, "Baloo", 800, "#1d1d1d");
  H.tarpTex.needsUpdate = true;
}
let signState = -1;
function paintSign(stamp) {
  const st = stamp > 0 ? Math.round(stamp * 20) : 0; if (st === signState) return; signState = st;
  const c = H.pandiSignTex.userData.c, W = 900, Hh = 640;
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, Hh);
  c.fillStyle = "#1d4f9a"; c.fillRect(0, 0, W, 130);
  fitText(c, "PROYEKTONG FLOOD WALL", W / 2, 68, W * 0.92, 74, "Luckiest Guy", 400, "#fff");
  fitText(c, "Brgy. Bunsuran, Pandi, Bulacan", W / 2, 180, W * 0.9, 50, "Baloo", 800, "#1d1d1d");
  fitText(c, "HALAGA: ₱92,800,000", W / 2, 260, W * 0.9, 66, "Baloo", 800, "#c0262d");
  fitText(c, "HABA: 128 METRO", W / 2, 335, W * 0.9, 52, "Baloo", 800, "#1d1d1d");
  c.fillStyle = "#ddd"; c.fillRect(80, 400, W - 160, 60); c.fillStyle = "#3aa76d"; c.fillRect(80, 400, (W - 160) * 0.95 * clamp(stamp * 1.0 + 0.0), 60);
  c.strokeStyle = INK; c.lineWidth = 6; c.strokeRect(80, 400, W - 160, 60);
  c.fillStyle = "#f4c430"; c.fillRect(0, Hh - 100, W, 100); fitText(c, "DPWH  •  2024", W / 2, Hh - 50, W * 0.8, 50, "Baloo", 800, INK);
  c.strokeStyle = INK; c.lineWidth = 16; c.strokeRect(0, 0, W, Hh);
  if (stamp > 0) {
    const s = 1 + (1 - clamp(stamp)) * 1.6;
    c.save(); c.translate(W / 2 + 80, 420); c.rotate(-0.22); c.scale(s, s); c.globalAlpha = clamp(stamp * 2.5);
    c.strokeStyle = "#d4202a"; c.lineWidth = 14; c.strokeRect(-260, -95, 520, 190);
    fitText(c, "95% COMPLETE", 0, 0, 480, 110, "Luckiest Guy", 400, "#d4202a");
    c.restore();
  }
  H.pandiSignTex.needsUpdate = true;
}
let calState = -1;
function paintCal(day) {
  if (day === calState) return; calState = day;
  const c = H.calTex.userData.c, W = 400, Hh = 480;
  c.fillStyle = "#fbfbf5"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#d4202a"; c.fillRect(0, 0, W, 110);
  fitText(c, "ARAW", W / 2, 58, W * 0.8, 74, "Luckiest Guy", 400, "#fff");
  fitText(c, String(day), W / 2, 290, W * 0.85, 250, "Luckiest Guy", 400, "#1d1d1d");
  if (day >= 21) { c.strokeStyle = "#d4202a"; c.lineWidth = 12; c.beginPath(); c.ellipse(W / 2, 290, 150, 120, 0, 0, 7); c.stroke(); }
  for (let x = 40; x < W; x += 60) { c.fillStyle = "#555"; c.beginPath(); c.arc(x, 14, 8, 0, 7); c.fill(); }
  c.strokeStyle = INK; c.lineWidth = 10; c.strokeRect(0, 0, W, Hh);
  H.calTex.needsUpdate = true;
}
let tvKey = "";
const tvCanvas = document.createElement("canvas"); tvCanvas.width = 600; tvCanvas.height = 1000;
function paintTV(t) {
  const angry = t > 58.4;
  const talk = Math.floor(t * 9) % 2;
  const key = `${angry}${talk}${Math.floor(t * 2) % 2}`;
  if (key === tvKey) return; tvKey = key;
  const c = H.tvTex.userData.c, W = 960, Hh = 540;
  const g = c.createLinearGradient(0, 0, 0, Hh); g.addColorStop(0, "#14305e"); g.addColorStop(1, "#2a5aa8"); c.fillStyle = g; c.fillRect(0, 0, W, Hh);
  // stage lights
  for (let i = 0; i < 6; i++) { c.fillStyle = "rgba(255,255,255,0.06)"; c.beginPath(); c.moveTo(80 + i * 160, 0); c.lineTo(20 + i * 160, Hh); c.lineTo(140 + i * 160, Hh); c.fill(); }
  // speaker (generic official, not a likeness)
  drawChar(tvCanvas.getContext("2d"), { kind: "person", skin: "#e2b088", shirt: "#f4eedc", barong: true, pants: "#222", hair: "#1b1a1a", expr: angry ? "angry" : "neutral", talk, armR: angry ? 2.5 + (talk ? 0.15 : -0.1) : 0.4, armL: 0.3 });
  c.drawImage(tvCanvas, 0, 120, 600, 650, W / 2 - 230, 40, 460, 498);
  // podium
  c.fillStyle = "#6b3f2a"; c.fillRect(W / 2 - 170, 330, 340, 210); c.strokeStyle = INK; c.lineWidth = 8; c.strokeRect(W / 2 - 170, 330, 340, 210);
  c.beginPath(); c.arc(W / 2, 420, 52, 0, 7); c.fillStyle = "#f4c430"; c.fill(); c.stroke();
  c.fillStyle = "#222"; c.fillRect(W / 2 - 4, 270, 8, 64); c.beginPath(); c.arc(W / 2, 266, 12, 0, 7); c.fill();
  if (angry) { c.strokeStyle = "#ff4d3d"; c.lineWidth = 10; for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(W / 2 + s * (200 + i * 10), 90 + i * 40); c.lineTo(W / 2 + s * (260 + i * 14), 70 + i * 40); c.stroke(); } }
  // LIVE badge + lower third
  c.fillStyle = "#d4202a"; c.fillRect(30, 26, 150, 60); fitText(c, "LIVE", 105, 58, 130, 50, "Luckiest Guy", 400, "#fff");
  if (Math.floor(t * 2) % 2) { c.fillStyle = "#fff"; c.beginPath(); c.arc(196, 56, 10, 0, 7); c.fill(); }
  c.fillStyle = "#f4c430"; c.fillRect(0, Hh - 70, W, 70); fitText(c, "SONA 2025  •  FLOOD CONTROL", W / 2, Hh - 34, W * 0.9, 44, "Baloo", 800, "#1d1d1d");
  H.tvTex.needsUpdate = true;
}

// ---------------------------------------------------------------- per-set animation (deterministic in t)
const cards = [];
export function allCards() {
  if (cards.length) return cards;
  cards.push(...H.hallCrocs, H.hallHero, H.suvDriver, ...H.ghosts, ...H.contractors, ...H.judges, ...H.diners);
  for (const extra of EXTRA) cards.push(extra);
  cards.push(...actCards());
  return cards;
}
const EXTRA = [];
let swimmers = [], townCroc, qmark;
export function setupExtras(scene, Card) {
  // swimmers in the flooded street
  const r = rnd(5);
  for (let k = 0; k < 6; k++) {
    const c = new Card(citizen(k + 4, { expr: k % 2 ? "sad" : "shock", armL: 2.4, armR: 2.6 }), 1.65);
    c.root.position.set(-3 + (k % 3) * 2.6 + r() * 0.6, 0.25, 6 - (k / 3 | 0) * 3.2 - r()); c.shadow.visible = false; c.root.visible = false;
    SETS.town.add(c.root); swimmers.push(c); EXTRA.push(c);
  }
  // croc in front of the city hall
  townCroc = new Card(CROC({ expr: "smug" }), 1.75); townCroc.root.position.set(0, 0.0, -50); SETS.town.add(townCroc.root); EXTRA.push(townCroc);
  // "?" over the coconuts
  buildActs();
  qmark = new Card({ t: 0 }, 6.5, "question"); qmark.root.position.set(0.6, 0.6, 6); qmark.shadow && (qmark.shadow.visible = false); SETS.river.add(qmark.root); EXTRA.push(qmark);
}

export function animate(t, shot) {
  const set = shot.set;
  animateActs(t, shot);
  // flag + water everywhere
  if (H.flag) { const p = H.flag.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(x * 2.2 - t * 6) * 0.12 * (x + 1.2)); } p.needsUpdate = true; }
  for (const w of [H.riverWater, H.pandiWater, H.townFlood]) { const tex = w.material.map; tex.offset.y = -t * 0.05; tex.offset.x = Math.sin(t * 0.7) * 0.02; }

  if (set === "river") {
    H.coconuts.position.y = 0.05 + Math.sin(t * 2.2) * 0.06; H.coconuts.visible = false;
    H.coconuts.rotation.z = Math.sin(t * 1.7) * 0.08;
    qmark.root.visible = false; qmark.set({ t: t - 4.2 });
    const dusk = shot.id === "ghosts";
    for (const s of H.projSigns) {
      const appear = 11.3 + s.userData.order * 7.4; // 11.3 .. 18.7 s
      let sc = t >= appear ? clamp(pop(t, appear, 0.28)) : 0;
      if (shot.id === "hook_river" || shot.id === "coconuts") sc = 0;
      if (dusk) sc = 1;
      s.scale.setScalar(Math.max(0.001, sc * 1.0));
    }
    for (const g of H.ghosts) {
      const a = 51.2 + g.k * 0.11;
      g.root.visible = dusk && t > a;
      const u = Math.max(0, t - a);
      g.root.position.set(g.base.x * (1 - 0.72 * ss(u / 1.3)) + Math.sin(u * 1.3 + g.k) * 0.8, g.base.y + Math.min(u * 2.2, 3 + (g.k % 4) * 1.2) + Math.sin(u * 2 + g.k) * 0.25, g.base.z);
      g.set({ kind: "ghost", t: u + g.k * 0.3 });
      g.root.scale.setScalar(clamp(u * 3) * 1.0);
    }
  }
  if (set === "hall") {
    H.hallHero.root.visible = shot.id !== "hall_wide";
    H.hallCrocs.forEach((c, i) => c.set({ blink: blink(t, i * 3), look: Math.sin(t * 0.8 + i) * 0.5 }));
    const h = H.hallHero;
    const sparkle = clamp((t - 8.52) / 0.8);
    const pres = ease(t, 7.0, 7.35) * (1 - ease(t, 8.0, 8.2));
    h.set({ expr: t > 8.3 ? "grin" : "smug", blink: blink(t, 4), sparkle: t > 8.52 && t < 9.4 ? sparkle : 0,
      armL: 0.2 + pres * 0.85, armR: 0.2 + pres * 0.85, collar: pres * (0.6 + 0.4 * Math.sin(t * 10)), wag: t * 3,
      squash: -pres * 0.06 + (t > 7.0 && t < 7.4 ? 0.06 * Math.sin((t - 7) / 0.4 * Math.PI) : 0),
      lean: t > 8.22 ? 0.07 * ease(t, 8.3, 8.7) + Math.sin(t * 3) * 0.02 : 0, jaw: t > 8.35 && t < 8.9 ? 0.15 : 0 });
  }
  if (set === "town") {
    paintTarp();
    const unroll = ease(t, 10.0, 10.55);
    H.tarp.scale.y = shot.id === "tarp" ? Math.max(0.001, unroll * (1 + 0.04 * Math.sin((t - 10.55) * 18) * Math.exp(-(t - 10.55) * 5) * (t > 10.55 ? 1 : 0))) : 1;
    const flooded = shot.id === "swim" || shot.id === "suv";
    H.townFlood.visible = flooded; H.jeep.visible = !flooded;
    for (const [i, s] of swimmers.entries()) {
      s.root.visible = flooded;
      const ph = t * 3 + i;
      s.root.position.y = 0.22 + Math.sin(ph) * 0.06;
      s.set({ armL: (t * 4.2 + i) % 6.283, armR: (t * 4.2 + i + 3.14) % 6.283, lean: Math.sin(t * 4.2 + i) * 0.08, blink: blink(t, i + 9), expr: i % 3 === 0 ? "shock" : i % 3 === 1 ? "sad" : "angry", look: shot.id === "suv" ? 1 : 0 });
    }
    // SUV drives up the street through the flood
    H.suv.visible = shot.id === "suv";
    const zz = -5 + (t - 65.02) * 5.0; H.suv.position.set(1.8, 0.0, zz); H.suv.rotation.y = 0;
    H.suvDriver.set({ expr: "grin", shades: 1, armR: 2.3 + Math.sin(t * 9) * 0.3, armL: 0.4, blink: 0, wag: 0 });
    // croc in front of the hall
    townCroc.root.visible = shot.id === "shrug" || shot.id === "tarp";
    if (shot.id === "tarp") {
      townCroc.root.position.set(1.1, 0, -42.3);
      const th = ease(t, 10.2, 10.45);
      townCroc.set({ expr: "grin", thumbR: th > 0.5, armR: 0.25 + th * 1.55, armL: 0.25, shades: 0, laugh: 0, jaw: 0, blink: blink(t, 2), wag: t * 3, sparkle: t > 10.45 && t < 10.86 ? (t - 10.45) / 0.41 : 0, lean: th * 0.06 });
    } else {
      townCroc.root.position.set(0, 0, -50);
      const laughing = t > 59.95 && t < 61.55;
      townCroc.set({ expr: laughing ? "happy" : t > 61.84 ? "grin" : "smug", laugh: laughing ? t : 0, thumbR: t > 62.0, armL: laughing ? 0.9 + Math.sin(t * 28) * 0.1 : 0.2, armR: laughing ? 0.9 + Math.cos(t * 28) * 0.1 : t > 62.0 ? 1.7 : 0.2,
        shades: clamp((t - 61.6) / 0.3), blink: blink(t, 2), wag: t * 4, sparkle: 0, lean: laughing ? Math.sin(t * 14) * 0.05 - 0.05 : 0, jaw: 0 });
    }
  }
  if (set === "money") {
    const home = H.piles.map((p) => p.userData.home);
    const split = ease(t, 23.35, 24.3);
    H.piles.forEach((p, i) => {
      const c = home[i].clone().multiplyScalar(split);
      let y = 0, s = 1;
      if (i === 0 && t > 23.52 && t < 27.98) { y = Math.abs(Math.sin((t - 23.52) * 5)) * 0.4 * Math.exp(-(t - 23.52) * 0.6); s = 1 + 0.08 * Math.sin((t - 23.52) * 10) * Math.exp(-(t - 23.52)); }
      if (i === 0) { const go = ease(t, 28.1, 29.1); c.lerp(V(19.5, 0, 4.5), go); y += Math.sin(go * Math.PI) * 1.2; }
      p.position.set(c.x, y, c.z); p.scale.setScalar(s * (split < 0.01 ? 1.35 : 1));
    });
    H.contractors.forEach((c, i) => {
      const cheer = t > 29.0;
      const j = cheer ? Math.abs(Math.sin((t - 29) * 7 + i)) * 0.25 : 0;
      c.root.position.y = j;
      c.set({ armL: cheer ? 2.6 + Math.sin(t * 9 + i) * 0.2 : 0.2, armR: cheer ? 2.6 + Math.cos(t * 9 + i) * 0.2 : 0.2, expr: cheer ? (i % 2 ? "happy" : "grin") : "grin", blink: blink(t, i) });
    });
  }
  if (set === "pandi") {
    paintSign(shot.id === "sign" ? clamp((t - 34.52) / 0.18) : 1);
    const day = shot.id === "calendar" ? Math.max(1, Math.min(21, 1 + Math.floor(lin(t, 36.85, 37.9) * 20))) : 21;
    paintCal(day);
    H.pages.forEach((p, k) => {
      const ft = 36.85 + k * 0.09; const u = t - ft;
      p.visible = shot.id === "calendar" && u > 0 && u < 0.9;
      const cp = H.cal.position;
      p.position.set(cp.x + 0.6 * u * 3, cp.y + 2.2 + u * 2.2 - u * u * 1.5, cp.z + 0.3 + u * 1.5);
      p.rotation.set(u * 5, u * 3 + k, u * 2);
    });
    // judges walk toward camera during "judges", then stand looking at the grass
    const walkU = lin(t, 38.62, 40.48);
    H.judges.forEach((j, i) => {
      const x = -0.9 + i * 0.95;
      if (shot.id === "judges") { j.root.position.set(x, 0, 1.0 - walkU * 2.2 - i * 0.35); j.set({ walk: t * 8 + i, expr: "neutral", blink: blink(t, i), armL: 0.12 + Math.sin(t * 8 + i) * 0.15, armR: 0.12 - Math.sin(t * 8 + i) * 0.15 }); j.root.visible = true; }
      else if (shot.id === "grass") { j.root.position.set(x * 1.1, 0, 0.2 - i * 0.2); j.set({ walk: 0, expr: t > 41.0 ? "shock" : "neutral", blink: blink(t, i), armL: 0.12, armR: 0.12 }); j.root.visible = true; }
      else if (shot.id === "judge_cu") { j.root.position.set(x * 1.4, 0, -3.0 - Math.abs(i - 1) * 0.3); j.set({ walk: 0, expr: "shock", talk: i === 1 ? 1 : 0, blink: 0, glasses: i !== 2, armL: i === 1 ? 2.2 : 0.3, armR: i === 1 ? 2.2 : 0.3 }); j.root.visible = true; }
      else j.root.visible = false;
    });
    // the falling sheet pile
    const fall = ease(t, 43.0, 43.35);
    const p4 = H.piles2[3]; p4.rotation.z = -0.2 - fall * 1.25;
    // price tag
    H.tag.visible = shot.id === "tag";
    H.tag.rotation.z = Math.sin(t * 3.2) * 0.12 * Math.exp(-(t - 44.14) * 0.4) + 0.02;
    H.tag.scale.setScalar(clamp(pop(t, 44.2, 0.3)));
    // flood wave
    const fw = shot.id === "flood";
    H.wave.visible = fw;
    const wu = ease(t, 49.1, 50.6);
    H.wave.position.set(0, -2.6 + Math.min(1, lin(t, 48.9, 49.6)) * 2.6, -14 + wu * 30);
    H.pandiSign.position.z = -4 + (fw ? ease(t, 50.0, 50.9) * 3 : 0);
    H.pandiSign.rotation.z = fw ? ease(t, 50.0, 50.9) * 0.3 : 0;
    H.pandiSign.position.y = fw ? ease(t, 50.0, 50.9) * 0.4 : 0;
  }
  if (set === "eatery") {
    paintTV(t);
    H.fan.rotation.y = t * 9;
    H.diners.forEach((d, i) => d.set({ look: 1, blink: blink(t, i + 5), expr: t > 58.6 ? (i === 1 ? "shock" : "neutral") : "neutral", armL: 0.3, armR: i === 0 ? 0.9 + Math.sin(t * 5) * 0.15 : 0.5 }));
  }
  if (set === "ballot") {
    if (t > 70.25 && !H.ballotCircled) { H.ballotCircled = true; const c = H.ballotTex.userData.c; c.strokeStyle = "#d4202a"; c.lineWidth = 9; c.beginPath(); c.ellipse(360, 474, 260, 52, -0.02, 0, 7); c.stroke(); H.ballotTex.needsUpdate = true; }
    const show = shot.id === "tail";
    H.tail.visible = show;
    const out = ease(t, 71.15, 71.6);
    H.tail.rotation.y = 1.6 - out * 2.5; H.tail.scale.setScalar(1.7);
    H.tailSegs.forEach((s, k) => { s.rotation.y = Math.sin(t * 7 - k * 0.7) * 0.22 * out; s.rotation.z = 0.05; });
    H.ballotBox.rotation.z = show ? Math.sin(t * 30) * 0.02 * Math.exp(-(t - 71.06) * 3) : 0;
  }
}
