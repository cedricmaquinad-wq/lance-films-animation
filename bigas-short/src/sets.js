// Sets for "₱20 na Bigas": rally, market (Kadiwa + palengke), home, rice fields.
import * as THREE from "three";
import { toon, canvasTex, mesh, box, cyl, sphere, palm, bush, tree, house, jeepney, pole, wire, signboard, cloud, Card, fitText, rnd } from "./kit.js";
import { INK } from "./toon.js";

export const H = {};
export const SETS = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const SKINS = ["#e9b68a", "#d9a477", "#c68b5e", "#f0c49a", "#b97c52"];
const SHIRTS = ["#e24b4b", "#2f7fd8", "#f2b632", "#3aa76d", "#ef7d33", "#8a5cc9", "#f06fa0", "#2bb3b1", "#ffffff"];
export function citizen(i, extra = {}) {
  return { kind: "person", skin: SKINS[i % SKINS.length], shirt: SHIRTS[(i * 3) % SHIRTS.length], pants: ["#3a4a7a", "#4a4a52", "#6a5a3a", "#2f5a8a"][i % 4], hair: "#1d1716", long: i % 3 === 1, expr: "neutral", ...extra };
}
export const JUAN = (extra = {}) => ({ kind: "person", skin: "#d9a477", shirt: "#2f7fd8", pants: "#3a4a7a", hair: "#1d1716", hat: "cap", capCol: "#e24b4b", expr: "neutral", ...extra });
export const FARMER = (extra = {}) => ({ kind: "person", skin: "#c68b5e", shirt: "#e9e2cf", pants: "#5a4a32", shoes: "#5a3b2a", hair: "#1d1716", hat: "salakot", expr: "neutral", ...extra });
export const CROC = (extra = {}) => ({ kind: "croc", shirt: "#f4eedc", barong: true, pants: "#1f1f26", expr: "grin", ...extra });

export function waterMat(col = "#3d8fd0", col2 = "#5fb0e6", rep = [5, 14]) {
  const t = canvasTex(256, 256, (c, W, Hh) => {
    c.fillStyle = col; c.fillRect(0, 0, W, Hh); const r = rnd(9);
    for (let i = 0; i < 90; i++) { c.fillStyle = i % 3 ? col2 : "rgba(255,255,255,0.6)"; const x = r() * W, y = r() * Hh, L = 50 + r() * 110; c.fillRect(x, y, L, 2); c.fillRect(x - W, y, L, 2); }
  }, rep);
  const m = toon("#ffffff", { map: t }); m.userData.anim = t; return m;
}
function ground(w, d, col, tex) { return mesh(new THREE.PlaneGeometry(w, d), toon(col, tex ? { map: tex } : {}), { rot: [-Math.PI / 2, 0, 0], cast: false }); }
function grassTex(base = "#7cc152", dark = "#5ea83f", rep = 20) {
  return canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = base; c.fillRect(0, 0, W, Hh); const r = rnd(4); for (let i = 0; i < 400; i++) { c.fillStyle = i % 2 ? dark : "#94d062"; c.fillRect(r() * W, r() * Hh, 3, 8); } }, [rep, rep]);
}
function concreteTex(rep = 30) {
  return canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#c9c2b5"; c.fillRect(0, 0, W, Hh); const r = rnd(6); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.07})`; c.fillRect(r() * W, r() * Hh, 6, 6); } c.strokeStyle = "rgba(90,80,70,0.25)"; c.lineWidth = 3; c.strokeRect(0, 0, W, Hh); }, [rep, rep]);
}
export function phFlag() {
  return canvasTex(300, 150, (c, W, Hh) => {
    c.fillStyle = "#0038a8"; c.fillRect(0, 0, W, Hh / 2); c.fillStyle = "#ce1126"; c.fillRect(0, Hh / 2, W, Hh / 2);
    c.fillStyle = "#ffffff"; c.beginPath(); c.moveTo(0, 0); c.lineTo(W * 0.43, Hh / 2); c.lineTo(0, Hh); c.closePath(); c.fill();
    c.fillStyle = "#fcd116"; c.beginPath(); c.arc(W * 0.15, Hh / 2, 14, 0, 7); c.fill();
  });
}
function bunting(a, b, n = 14) {
  const g = new THREE.Group(); const cols = ["#0038a8", "#ce1126", "#fcd116", "#ffffff"];
  g.add(wire(a, b, 0.6, 0.015, "#333"));
  for (let k = 1; k < n; k++) { const t = k / n; const p = new THREE.Vector3().lerpVectors(a, b, t); p.y -= Math.sin(t * Math.PI) * 0.6; const f = mesh(new THREE.ConeGeometry(0.22, 0.45, 3), toon(cols[k % 4]), { pos: [p.x, p.y - 0.22, p.z], rot: [Math.PI, 0, 0], cast: false }); f.scale.z = 0.15; g.add(f); }
  return g;
}
function sackTex() {
  return canvasTex(256, 320, (c, W, Hh) => { c.fillStyle = "#f3ead2"; c.fillRect(0, 0, W, Hh); c.strokeStyle = "rgba(150,120,70,0.25)"; c.lineWidth = 2; for (let y = 0; y < Hh; y += 8) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } fitText(c, "BIGAS", W / 2, Hh * 0.45, W * 0.8, 70, "Luckiest Guy", 400, "#2c8a4a"); fitText(c, "25 KG", W / 2, Hh * 0.68, W * 0.6, 40, "Baloo", 800, "#555"); });
}
let _sack;
export function sack(s = 1) {
  _sack = _sack || sackTex();
  const g = new THREE.Group();
  const m = mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.75, 14), [toon("#ffffff", { map: _sack }), toon("#e9dfc4"), toon("#e9dfc4")], { pos: [0, 0.375, 0], smooth: true }); m.scale.z = 0.62; g.add(m);
  g.add(mesh(new THREE.SphereGeometry(0.3, 12, 8), toon("#e9dfc4"), { pos: [0, 0.78, 0], scale: [1, 0.35, 0.6], smooth: true }));
  g.scale.setScalar(s); return g;
}
function priceSign(text, sub, col = "#ffd93b", w = 2.2, h = 1.4) {
  const g = signboard(w, h, (c, W, Hh) => {
    c.fillStyle = col; c.fillRect(0, 0, W, Hh); c.strokeStyle = INK; c.lineWidth = 16; c.strokeRect(0, 0, W, Hh);
    fitText(c, text, W / 2, Hh * 0.45, W * 0.9, Hh * 0.55, "Luckiest Guy", 400, "#d4202a");
    if (sub) fitText(c, sub, W / 2, Hh * 0.82, W * 0.9, Hh * 0.2, "Baloo", 800, INK);
  }, { post: 0.0 });
  return g;
}

// =====================================================================================================
function buildRally() {
  const g = new THREE.Group();
  g.add(ground(200, 200, "#fff", concreteTex(40)));
  // stage + backdrop banner
  g.add(box(14, 1.2, 6, "#3a3a44", { pos: [0, 0.6, -7] }));
  g.add(box(14.4, 0.15, 6.2, "#ce1126", { pos: [0, 1.25, -7] }));
  const ban = canvasTex(1400, 600, (c, W, Hh) => {
    const gr = c.createLinearGradient(0, 0, 0, Hh); gr.addColorStop(0, "#0038a8"); gr.addColorStop(1, "#1d5fd0"); c.fillStyle = gr; c.fillRect(0, 0, W, Hh);
    c.fillStyle = "#ce1126"; c.fillRect(0, Hh - 110, W, 110); c.fillStyle = "#fcd116"; for (let i = 0; i < 14; i++) { const x = 60 + i * 100; c.beginPath(); c.arc(x, 40, 10, 0, 7); c.fill(); }
    fitText(c, "₱20 / KILO", W / 2, 230, W * 0.9, 250, "Luckiest Guy", 400, "#ffd93b", INK, 16);
    fitText(c, "NG BIGAS!", W / 2, 420, W * 0.8, 150, "Luckiest Guy", 400, "#ffffff", INK, 14);
    fitText(c, "PANGAKO SA BAYAN", W / 2, Hh - 55, W * 0.8, 70, "Baloo", 800, "#ffffff");
  });
  g.add(mesh(new THREE.PlaneGeometry(13, 5.6), new THREE.MeshBasicMaterial({ map: ban }), { pos: [0, 4.2, -9.9], cast: false }));
  g.add(box(13.6, 6.2, 0.3, "#222", { pos: [0, 4.2, -10.1] }));
  for (const s of [-1, 1]) { g.add(cyl(0.12, 0.12, 9, "#555", { pos: [s * 7.2, 4.5, -9.6], seg: 8 })); g.add(sphere(0.5, "#ddd", { pos: [s * 7.2, 9.1, -9.3] })); }
  g.add(cyl(0.03, 0.03, 1.4, "#222", { pos: [0.6, 1.95, -5.4], seg: 6 })); g.add(sphere(0.08, "#111", { pos: [0.6, 2.7, -5.4] }));
  g.add(bunting(V(-12, 6, -3), V(12, 6, -3), 22)); g.add(bunting(V(-12, 5.5, 4), V(12, 5.5, 4), 22));
  H.speaker = new Card({ kind: "person", skin: "#e2b088", shirt: "#f4eedc", barong: true, pants: "#222", hair: "#1b1a1a", expr: "grin" }, 1.75);
  H.speaker.root.position.set(0, 1.25, -5.6); g.add(H.speaker.root);
  // crowd (front-facing; rows in front of the stage)
  H.crowd = [];
  const r = rnd(12);
  for (let k = 0; k < 30; k++) {
    const row = k / 10 | 0, col = k % 10;
    const c = new Card(citizen(k + 1, { hat: k % 4 === 0 ? "cap" : undefined, capCol: ["#e24b4b", "#2f7fd8", "#f2b632"][k % 3] }), 1.55 + r() * 0.25);
    c.root.position.set(-6.3 + col * 1.4 + (row % 2) * 0.6 + (r() - 0.5) * 0.3, 0, -2.2 + row * 1.7 + (r() - 0.5) * 0.4); g.add(c.root); H.crowd.push(c);
  }
  H.juan = H.crowd[14];
  H.juan.set(JUAN());
  H.confetti = [];
  for (let k = 0; k < 70; k++) { const p = mesh(new THREE.PlaneGeometry(0.16, 0.08), toon(["#ffd93b", "#ce1126", "#0038a8", "#ffffff", "#3aa76d"][k % 5], { side: THREE.DoubleSide }), { cast: false }); p.userData.noND = true; g.add(p); H.confetti.push(p); }
  for (let k = 0; k < 6; k++) { const b = house(k + 60, 9, 10 + (k % 3) * 3, 8, ["#f2d38a", "#9fc4e8", "#f4a6a6", "#b8d47a"][k % 4], "#6a7d8a"); b.position.set(-30 + k * 12, 0, -24); g.add(b); }
  for (let k = 0; k < 6; k++) { const cl = cloud(k + 3, 2.4); cl.position.set(-60 + k * 26, 34, -120); g.add(cl); }
  return g;
}

// =====================================================================================================
function buildMarket() {
  const g = new THREE.Group();
  g.add(ground(200, 200, "#fff", concreteTex(40)));
  const r = rnd(21);
  // stalls along both sides of a street (street along z)
  const awn = ["#e24b4b", "#2f7fd8", "#f2b632", "#3aa76d", "#ef7d33"];
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const st = new THREE.Group(); st.position.set(s * 5.2, 0, 14 - k * 5); st.rotation.y = -s * Math.PI / 2; g.add(st);
    st.add(box(4.2, 1.0, 1.2, "#b07a48", { pos: [0, 0.5, 0] }));
    st.add(box(4.6, 0.12, 2.0, awn[(k + (s > 0 ? 2 : 0)) % 5], { pos: [0, 2.7, -0.3], rot: [0.25, 0, 0] }));
    for (const q of [-1, 1]) st.add(cyl(0.06, 0.06, 2.7, "#666", { pos: [q * 2.1, 1.35, -1.0], seg: 6 }));
    for (let i = 0; i < 4; i++) { const bin = cyl(0.36, 0.32, 0.4, "#6b4a2a", { pos: [-1.5 + i, 1.2, 0] }); st.add(bin); st.add(cyl(0.33, 0.33, 0.05, ["#f7f4ea", "#efe6cf", "#f7f4ea", "#e8dcc0"][i], { pos: [-1.5 + i, 1.42, 0] })); }
    st.add(box(4.2, 2.2, 0.1, "#efe6d4", { pos: [0, 1.6, -1.2] }));
  }
  for (let k = 0; k < 8; k++) { const b = house(k + 30, 7, 7 + (k % 3) * 1.5, 7, ["#f2d38a", "#9fc4e8", "#f4a6a6", "#b8d47a", "#c7b8ea"][k % 5], ["#b5533c", "#3d6fa8"][k % 2]); b.position.set((k % 2 ? -1 : 1) * 12, 0, 16 - (k >> 1) * 9); b.rotation.y = (k % 2 ? 1 : -1) * Math.PI / 2; g.add(b); }
  g.add(bunting(V(-5, 3.8, 10), V(5, 3.8, 10), 16)); g.add(bunting(V(-5, 3.8, 0), V(5, 3.8, 0), 16));
  // ---- Kadiwa store at the end of the street (z = -14)
  const kad = new THREE.Group(); kad.position.set(0, 0, -16); g.add(kad); H.kadiwa = kad;
  kad.add(box(10, 4.5, 4, "#f4f1e8", { pos: [0, 2.25, -1.5] }));
  const kt = canvasTex(1200, 300, (c, W, Hh) => { c.fillStyle = "#2c8a4a"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#f4c430"; c.fillRect(0, Hh - 40, W, 40); fitText(c, "KADIWA STORE", W / 2, 105, W * 0.9, 120, "Luckiest Guy", 400, "#ffffff", INK, 10); fitText(c, "₱20 NA BIGAS DITO!", W / 2, 205, W * 0.8, 70, "Baloo", 800, "#ffe14a"); });
  kad.add(mesh(new THREE.PlaneGeometry(9.6, 2.4), new THREE.MeshBasicMaterial({ map: kt }), { pos: [0, 5.6, 0.55], cast: false }));
  kad.add(box(10, 2.6, 0.2, "#1f6b38", { pos: [0, 5.6, 0.4] }));
  kad.add(box(10.6, 0.15, 2.2, "#2c8a4a", { pos: [0, 4.3, 1.4], rot: [0.12, 0, 0] }));
  kad.add(box(6, 1.0, 1.0, "#c9a46a", { pos: [0, 0.5, 0.9] }));
  for (let i = 0; i < 9; i++) { const s = sack(0.8); s.position.set(-3.8 + (i % 3) * 0.6 + (i > 5 ? 6.2 : 0), 0, -0.4 - (i % 2) * 0.5); kad.add(s); }
  H.p20 = priceSign("₱20/KILO", "BENTENG BIGAS", "#ffe14a", 2.0, 1.2); H.p20.position.set(-3.2, 2.4, 1.2); kad.add(H.p20);
  // eligibility board
  H.eligTex = canvasTex(800, 1000, () => {});
  const el = signboard(1.6, 2.0, () => {}, { post: 0.8 }); el.userData.board.material[4] = new THREE.MeshBasicMaterial({ map: H.eligTex }); el.position.set(4.6, 0, 2.2); el.rotation.y = -0.3; kad.add(el); H.elig = el;
  // calendar sign "MAYO 2025"
  H.calTex = canvasTex(500, 400, (c, W, Hh) => { c.fillStyle = "#fbfbf5"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#d4202a"; c.fillRect(0, 0, W, 120); fitText(c, "MAYO", W / 2, 64, W * 0.8, 90, "Luckiest Guy", 400, "#fff"); fitText(c, "2025", W / 2, 270, W * 0.85, 190, "Luckiest Guy", 400, "#1d1d1d"); c.strokeStyle = INK; c.lineWidth = 12; c.strokeRect(0, 0, W, Hh); });
  const cal = signboard(1.5, 1.2, () => {}, { post: 0 }); cal.userData.board.material[4] = new THREE.MeshBasicMaterial({ map: H.calTex }); cal.position.set(2.8, 2.6, 1.3); kad.add(cal); H.cal = cal;
  // ribbon
  H.ribbon = box(6.5, 0.12, 0.04, "#d4202a", { pos: [0, 1.4, 2.4], cast: false }); kad.add(H.ribbon);
  // ---- palengke stall with ₱46 (left side, near camera)
  H.p46 = priceSign("₱46/KILO", "REGULAR RICE", "#ffffff", 1.6, 1.0); H.p46.position.set(-3.4, 1.55, 9.0); H.p46.rotation.y = 0.9; g.add(H.p46);
  // people
  H.guard = new Card({ kind: "person", skin: "#c68b5e", shirt: "#f2f2f2", pants: "#1f2a4a", hair: "#1d1716", hat: "cap", capCol: "#1f2a4a", expr: "neutral", tie: "#1f2a4a" }, 1.75);
  H.guard.root.position.set(-3.6, 0, -12.2); g.add(H.guard.root);
  H.mJuan = new Card(JUAN(), 1.72); g.add(H.mJuan.root);
  H.vendor = new Card(citizen(7, { shirt: "#f06fa0", long: true, expr: "neutral" }), 1.62); H.vendor.root.position.set(-5.6, 0, 9.0); g.add(H.vendor.root);
  // queue: senior, PWD, solo parent, 4Ps, minimum wage worker
  const Q = [
    citizen(3, { hair: "#d9d9de", shirt: "#c7b8ea", hold: "cane", armR: 0.35, expr: "smile" }),
    citizen(5, { pose: "sit", wheelchair: true, shirt: "#2bb3b1", expr: "smile", armL: 0.6, armR: 0.6 }),
    citizen(1, { long: true, shirt: "#f06fa0", hold: "baby", armR: 1.0, expr: "smile" }),
    citizen(8, { shirt: "#f2b632", hold: "card", armR: 1.2, expr: "happy" }),
    citizen(2, { shirt: "#3a6fd0", vest: "#ff8a1e", hat: "hardhat", expr: "smile" }),
  ];
  H.queue = Q.map((o, i) => { const c = new Card(o, i === 1 ? 1.45 : 1.7); c.root.position.set(1.2 - i * 0.05, 0, -12.6 + i * 1.7); g.add(c.root); return c; });
  // dream crowd: everyone carrying ₱20 rice
  H.dreamers = [];
  for (let k = 0; k < 10; k++) { const c = new Card(citizen(k + 11, { hold: "ricebag", armR: 0.5, expr: "happy", hair: k === 3 ? "#d9d9de" : "#1d1716" }), k % 4 === 2 ? 1.25 : 1.68); g.add(c.root); H.dreamers.push(c); }
  // big ₱20 sack pile for the opening shot
  const pile = new THREE.Group(); pile.position.set(1.2, 0, 6); g.add(pile); H.pile = pile;
  for (let i = 0; i < 12; i++) { const s = sack(1); s.position.set((i % 4) * 0.62 - 0.9, (i / 4 | 0) * 0.62, (i % 2) * 0.2); s.rotation.y = (i * 0.7) % 0.4 - 0.2; pile.add(s); }
  H.tag = priceSign("₱20", "KADA KILO", "#ffe14a", 1.4, 1.0); H.tag.position.set(1.0, 1.9, 7.2); H.tag.rotation.y = -0.1; g.add(H.tag);
  for (let k = 0; k < 5; k++) { const cl = cloud(k + 9, 2.4); cl.position.set(-50 + k * 26, 32, -110); g.add(cl); }
  return g;
}

// =====================================================================================================
function buildHome() {
  const g = new THREE.Group();
  const floor = canvasTex(256, 256, (c, W, Hh) => { for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) { c.fillStyle = (x + y) % 2 ? "#e9e2d2" : "#d8c9a8"; c.fillRect(x * 32, y * 32, 32, 32); } }, [10, 10]);
  g.add(ground(30, 30, "#fff", floor));
  const wall = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#f6d9a8"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#e9c48a"; c.fillRect(0, Hh * 0.65, W, Hh * 0.35); }, [3, 1]);
  g.add(box(20, 6, 0.3, "#fff", { pos: [0, 3, -4], mat: toon("#fff", { map: wall }) }));
  g.add(box(0.3, 6, 12, "#fff", { pos: [-6, 3, 1], mat: toon("#fff", { map: wall }) }));
  // window with sky
  g.add(box(2.6, 1.8, 0.1, "#9fd0f2", { pos: [-2.5, 3.4, -3.8] })); g.add(box(2.8, 0.15, 0.2, "#fff", { pos: [-2.5, 2.45, -3.75] }));
  // family photo + calendar
  const ph = canvasTex(300, 220, (c, W, Hh) => { c.fillStyle = "#8a5a32"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#cfe4f2"; c.fillRect(20, 20, W - 40, Hh - 40); for (let i = 0; i < 4; i++) { c.fillStyle = "#e9b68a"; c.beginPath(); c.arc(70 + i * 55, 100, 22, 0, 7); c.fill(); } });
  g.add(box(1.2, 0.9, 0.06, "#fff", { pos: [1.6, 3.6, -3.82], mat: toon("#fff", { map: ph }) }));
  // table + rice pot + plates
  g.add(box(3.6, 0.12, 1.6, "#a0703f", { pos: [0, 1.0, 0] }));
  for (const x of [-1.6, 1.6]) for (const z of [-0.6, 0.6]) g.add(cyl(0.06, 0.06, 1.0, "#6b4a2a", { pos: [x, 0.5, z], seg: 6 }));
  g.add(cyl(0.32, 0.28, 0.35, "#9aa1aa", { pos: [-1.1, 1.23, -0.2] })); g.add(sphere(0.3, "#ffffff", { pos: [-1.1, 1.38, -0.2], scale: [1, 0.35, 1] }));
  for (let k = 0; k < 4; k++) g.add(cyl(0.22, 0.18, 0.05, "#ffffff", { pos: [-0.3 + k * 0.5, 1.09, 0.45] }));
  // piggy bank (grows)
  const pig = new THREE.Group(); pig.position.set(0.7, 1.06, -0.2); g.add(pig); H.pig = pig;
  const pink = "#f49ac1";
  pig.add(sphere(0.32, pink, { pos: [0, 0.3, 0], scale: [1.2, 1, 1] }));
  pig.add(cyl(0.11, 0.11, 0.12, "#f7b6d2", { pos: [0.38, 0.3, 0], rot: [0, 0, Math.PI / 2] }));
  for (const s of [-1, 1]) { pig.add(mesh(new THREE.ConeGeometry(0.08, 0.14, 4), toon(pink), { pos: [0.18, 0.6, s * 0.14] })); pig.add(sphere(0.035, INK, { pos: [0.33, 0.42, s * 0.1] })); }
  for (const x of [-0.18, 0.18]) for (const z of [-0.15, 0.15]) pig.add(cyl(0.05, 0.05, 0.12, pink, { pos: [x, 0.04, z], seg: 8 }));
  pig.add(box(0.16, 0.02, 0.04, INK, { pos: [0, 0.62, 0] }));
  H.coins = [];
  for (let k = 0; k < 16; k++) { const cn = cyl(0.07, 0.07, 0.02, "#f2c230", { seg: 16, cast: false }); cn.userData.noND = true; g.add(cn); H.coins.push(cn); }
  // family
  H.family = [
    new Card({ kind: "person", skin: "#d9a477", shirt: "#3aa76d", pants: "#4a4a52", hair: "#1d1716", expr: "smile" }, 1.75),
    new Card({ kind: "person", skin: "#f0c49a", shirt: "#f06fa0", pants: "#3a4a7a", hair: "#2a1a14", long: true, expr: "smile" }, 1.62),
    new Card(citizen(4, { expr: "happy" }), 1.15),
    new Card(citizen(6, { long: true, shirt: "#f2b632", expr: "happy" }), 1.05),
  ];
  [[-1.0, 0, -1.2], [2.0, 0, -1.1], [-0.2, 0, -1.4], [1.1, 0, -1.4]].forEach((p, i) => { H.family[i].root.position.set(...p); g.add(H.family[i].root); });
  // big number "1"
  return g;
}

// =====================================================================================================
function buildField() {
  const g = new THREE.Group();
  const gt = grassTex("#86bf55", "#6aa83f", 60);
  g.add(ground(400, 400, "#fff", gt));
  // paddies: grid of shallow water plots separated by dikes, with instanced rice plants
  const wm = waterMat("#5fa8c9", "#8cc9e0", [3, 3]);
  const plots = [];
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 7; j++) {
    const x = i * 9, z = 6 - j * 9;
    const w = mesh(new THREE.PlaneGeometry(8.2, 8.2), wm, { rot: [-Math.PI / 2, 0, 0], pos: [x, 0.03, z], cast: false }); g.add(w); plots.push([x, z]);
  }
  const blade = new THREE.ConeGeometry(0.06, 1, 3); blade.translate(0, 0.5, 0);
  const N = 9000; const im = new THREE.InstancedMesh(blade, toon("#ffffff"), N);
  const r = rnd(41); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  H.plantInfo = [];
  for (let k = 0; k < N; k++) {
    const [px, pz] = plots[k % plots.length];
    const gx = Math.round((r() - 0.5) * 7.6 / 0.45) * 0.45, gz = Math.round((r() - 0.5) * 7.6 / 0.45) * 0.45;
    const x = px + gx, z = pz + gz, h = 0.6 + r() * 0.35;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.4, r() * 6, (r() - 0.5) * 0.4));
    m4.compose(V(x, 0, z), q, V(1, h, 1)); im.setMatrixAt(k, m4); im.setColorAt(k, col.set(["#5aa83f", "#6fbd4a", "#4b9636"][k % 3]));
    H.plantInfo.push({ x, z, h, q: q.clone(), order: Math.abs(px) / 27 + (6 - pz) / 60 + r() * 0.2 });
  }
  im.castShadow = true; im.receiveShadow = true; g.add(im); H.plants = im;
  // dikes
  for (let i = -3; i <= 4; i++) g.add(box(0.8, 0.25, 64, "#8a6a45", { pos: [i * 9 - 4.5, 0.12, -21] }));
  for (let j = 0; j <= 7; j++) g.add(box(64, 0.25, 0.8, "#8a6a45", { pos: [0, 0.12, 10.5 - j * 9] }));
  // dirt road on the right
  g.add(mesh(new THREE.PlaneGeometry(5, 200), toon("#b89a6a"), { rot: [-Math.PI / 2, 0, 0], pos: [34, 0.02, -20], cast: false }));
  // nipa hut, trees, mountains
  const hut = new THREE.Group(); hut.add(box(4, 2.6, 4, "#c9a46a", { pos: [0, 2.6, 0] })); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.4, 4), toon("#9a7a45")); rf.position.y = 5.1; rf.rotation.y = Math.PI / 4; rf.castShadow = true; hut.add(rf);
  for (const [x, z] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) hut.add(cyl(0.12, 0.12, 1.4, "#6b4a2a", { pos: [x, 0.7, z], seg: 6 }));
  hut.position.set(-36, 0, -8); g.add(hut);
  for (let k = 0; k < 40; k++) { const p = r() < 0.6 ? palm(k + 5, 6 + r() * 4) : tree(k + 9, 4 + r() * 3); p.position.set(-80 + r() * 160, 0, -70 - r() * 40); g.add(p); }
  for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.ConeGeometry(50 + (k % 3) * 15, 50 + (k % 4) * 14, 7), toon(k % 2 ? "#6f9f78" : "#7fae86")); m.position.set(-200 + k * 50, 15, -230 - (k % 3) * 30); g.add(m); }
  for (let k = 0; k < 7; k++) { const cl = cloud(k + 20, 2.6); cl.position.set(-100 + k * 34, 40 + (k % 3) * 8, -200); g.add(cl); }
  // carabao
  const cara = new THREE.Group(); cara.position.set(-14, 0, 12); cara.rotation.y = 0.6; g.add(cara);
  cara.add(sphere(1, "#5a5560", { pos: [0, 1.15, 0], scale: [1.4, 0.75, 0.7] })); cara.add(sphere(0.45, "#5a5560", { pos: [1.4, 1.3, 0], scale: [1.1, 0.9, 0.8] }));
  for (const s of [-1, 1]) cara.add(mesh(new THREE.TorusGeometry(0.4, 0.07, 6, 12, Math.PI), toon("#d9d2c4"), { pos: [1.4, 1.6, s * 0.2], rot: [0, s * 0.3, 0] }));
  for (const x of [-0.8, 0.8]) for (const z of [-0.35, 0.35]) cara.add(cyl(0.13, 0.13, 0.8, "#4a4550", { pos: [x, 0.4, z], seg: 8 }));
  // three idea signs (1 TIPID, 2 KITA, 3 ANI)
  H.idea = [["1", "TIPID", "#f49ac1"], ["2", "KITA", "#3aa76d"], ["3", "ANI", "#f2b632"]].map(([n, w, colr], i) => {
    const s = signboard(2.4, 2.4, (c, W, Hh) => { c.fillStyle = "#fffdf5"; c.fillRect(0, 0, W, Hh); c.fillStyle = colr; c.beginPath(); c.arc(W / 2, Hh * 0.38, W * 0.3, 0, 7); c.fill(); c.lineWidth = 12; c.strokeStyle = INK; c.stroke(); fitText(c, n, W / 2, Hh * 0.4, W * 0.4, Hh * 0.42, "Luckiest Guy", 400, "#fff", INK, 12); fitText(c, w, W / 2, Hh * 0.84, W * 0.85, Hh * 0.22, "Luckiest Guy", 400, INK); c.strokeRect(0, 0, W, Hh); }, { post: 1.2 });
    s.position.set(-2.75 + i * 2.75, 0, 9.0); g.add(s); return s;
  });
  // farmers
  H.farmer = new Card(FARMER({ hold: "sickle", armR: 0.8 }), 1.7); H.farmer.root.position.set(2, 0, 4); g.add(H.farmer.root);
  H.helpers = [];
  for (let k = 0; k < 10; k++) { const c = new Card(FARMER({ shirt: ["#e9e2cf", "#cfe4f2", "#f2d38a", "#f4a6a6"][k % 4], skin: SKINS[k % 5], back: false, armL: 1.2, armR: 1.4 }), 1.65); g.add(c.root); H.helpers.push(c); }
  H.farmFam = [new Card(FARMER({ expr: "smile", back: true }), 1.7), new Card({ kind: "person", skin: "#d9a477", shirt: "#f06fa0", pants: "#5a4a32", hair: "#1d1716", long: true, back: true }, 1.6), new Card(citizen(3, { back: true }), 1.1)];
  H.farmFam.forEach((c, i) => { c.root.position.set(-1 + i * 1.0, 0.25, 11.3); g.add(c.root); });
  // government truck
  const tr = new THREE.Group(); g.add(tr); H.truck = tr;
  const trT = canvasTex(512, 200, (c, W, Hh) => { c.fillStyle = "#1d4f9a"; c.fillRect(0, 0, W, Hh); fitText(c, "GOBYERNO", W / 2, 70, W * 0.85, 80, "Luckiest Guy", 400, "#fff"); fitText(c, "BUMIBILI NG PALAY", W / 2, 150, W * 0.85, 50, "Baloo", 800, "#ffd93b"); });
  tr.add(box(2.4, 2.2, 5, "#fff", { pos: [0, 1.7, -1], mat: [toon("#fff", { map: trT }), toon("#fff", { map: trT }), toon("#e9e9e9"), toon("#e9e9e9"), toon("#e9e9e9"), toon("#e9e9e9")] }));
  tr.add(box(2.3, 1.6, 1.8, "#e9e9e9", { pos: [0, 1.4, 2.4] })); tr.add(box(2.0, 0.7, 0.1, "#1b2a3a", { pos: [0, 1.75, 3.31] }));
  for (const [x, z] of [[-1.1, -2.6], [1.1, -2.6], [-1.1, 2.4], [1.1, 2.4]]) tr.add(cyl(0.45, 0.45, 0.35, "#222", { pos: [x, 0.45, z], rot: [0, 0, Math.PI / 2] }));
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: phFlag(), side: THREE.DoubleSide })); fl.position.set(0, 3.1, 1.9); fl.userData.noND = true; tr.add(fl);
  H.buyer = new Card({ kind: "person", skin: "#e2b088", shirt: "#f4f1e8", pants: "#33333d", hair: "#1b1a1a", tie: "#1d4f9a", glasses: true, hold: "money", armR: 1.2, expr: "smile" }, 1.72); g.add(H.buyer.root);
  H.fieldSacks = []; for (let k = 0; k < 6; k++) { const s = sack(0.9); g.add(s); H.fieldSacks.push(s); }
  H.palaySign = priceSign("₱16–₱22", "KADA KILO NG PALAY", "#ffffff", 2.4, 1.4); H.palaySign.position.set(4.3, 0.6, 2.4); H.palaySign.rotation.y = -0.4; g.add(H.palaySign);
  for (const s of H.palaySign.children) s.castShadow = true;
  return g;
}

export function buildWorld(scene) {
  const defs = { rally: [buildRally, V(0, 0, 0)], market: [buildMarket, V(1000, 0, 0)], home: [buildHome, V(-1000, 0, 0)], field: [buildField, V(0, 0, 1000)] };
  for (const [k, [fn, p]] of Object.entries(defs)) { const g = fn(); g.position.copy(p); g.visible = false; scene.add(g); SETS[k] = g; }
}
