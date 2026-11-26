import * as THREE from "three";
import { toon, canvasTex, mesh, box, cyl, sphere, palm, bush, tree, house, jeepney, pole, wire, signboard, cloud, Card, fitText, rnd } from "./kit.js";
import { INK } from "./toon.js";

export const H = {}; // handles used by the story
export const SETS = {};
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- people presets
const SKINS = ["#e9b68a", "#d9a477", "#c68b5e", "#f0c49a", "#b97c52"];
const SHIRTS = ["#e24b4b", "#2f7fd8", "#f2b632", "#3aa76d", "#ef7d33", "#8a5cc9", "#f06fa0", "#2bb3b1", "#ffffff"];
export function citizen(i, extra = {}) {
  const r = rnd(i * 7 + 3);
  return { kind: "person", skin: SKINS[i % SKINS.length], shirt: SHIRTS[(i * 3) % SHIRTS.length], pants: ["#3a4a7a", "#4a4a52", "#6a5a3a", "#2f5a8a"][i % 4], hair: "#1d1716", long: i % 3 === 1, expr: "neutral", ...extra };
}
export const CROC = (extra = {}) => ({ kind: "croc", shirt: "#f4eedc", barong: true, pants: "#1f1f26", shoes: "#141418", skin: "#5d9e3f", expr: "grin", armL: 0.16, armR: 0.16, ...extra });
export const CONTRACTOR = (i, extra = {}) => ({ kind: "person", skin: SKINS[(i + 2) % 5], shirt: ["#1f5fb8", "#d8382f", "#2c8a4a"][i % 3], vest: "#ff8a1e", pants: "#3a3a44", hat: "hardhat", shades: 1, chain: i % 2 === 0, expr: "grin", ...extra });
export const JUDGE = (i, extra = {}) => ({ kind: "person", skin: SKINS[(i + 1) % 5], robe: "#1c1a22", hair: i === 1 ? "#cfcfd6" : "#2a2222", glasses: i !== 2, expr: "neutral", ...extra });

// ---------- water (animated stripe texture)
export function waterMat(col = "#3d8fd0", col2 = "#5fb0e6", murky = false) {
  const t = canvasTex(256, 256, (c, W, Hh) => {
    c.fillStyle = col; c.fillRect(0, 0, W, Hh);
    const r = rnd(9);
    for (let i = 0; i < 90; i++) { c.fillStyle = i % 3 ? col2 : "rgba(255,255,255,0.6)"; const x = r() * W, y = r() * Hh, L = 50 + r() * 110; c.fillRect(x, y, L, 2); c.fillRect(x - W, y, L, 2); }
    if (murky) { for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(90,60,30,0.15)"; c.beginPath(); c.arc(r() * W, r() * Hh, 10 + r() * 30, 0, 7); c.fill(); } }
  }, [5, 14]);
  const m = toon("#ffffff", { map: t }); m.userData.anim = t;
  return m;
}

function ground(w, d, col, tex) { return mesh(new THREE.PlaneGeometry(w, d), toon(col, tex ? { map: tex } : {}), { rot: [-Math.PI / 2, 0, 0], cast: false }); }
function grassTex(base = "#7cc152", dark = "#5ea83f", rep = 20) {
  return canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = base; c.fillRect(0, 0, W, Hh); const r = rnd(4); for (let i = 0; i < 400; i++) { c.fillStyle = i % 2 ? dark : "#94d062"; c.fillRect(r() * W, r() * Hh, 3, 8); } }, [rep, rep]);
}
function phFlag() {
  return canvasTex(300, 150, (c, W, Hh) => {
    c.fillStyle = "#0038a8"; c.fillRect(0, 0, W, Hh / 2); c.fillStyle = "#ce1126"; c.fillRect(0, Hh / 2, W, Hh / 2);
    c.fillStyle = "#ffffff"; c.beginPath(); c.moveTo(0, 0); c.lineTo(W * 0.43, Hh / 2); c.lineTo(0, Hh); c.closePath(); c.fill();
    c.fillStyle = "#fcd116"; c.beginPath(); c.arc(W * 0.15, Hh / 2, 14, 0, 7); c.fill();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; c.fillRect(W * 0.15 + Math.cos(a) * 22 - 3, Hh / 2 + Math.sin(a) * 22 - 3, 6, 6); }
    for (const [x, y] of [[12, 16], [12, Hh - 16], [W * 0.36, Hh / 2]]) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
  });
}
export function flagpole(h = 10) {
  const g = new THREE.Group();
  g.add(cyl(0.07, 0.09, h, "#d9dde4", { pos: [0, h / 2, 0], seg: 8 }));
  const f = mesh(new THREE.PlaneGeometry(2.4, 1.2, 12, 1), new THREE.MeshBasicMaterial({ map: phFlag(), side: THREE.DoubleSide }), { pos: [1.2, h - 0.8, 0], cast: false });
  f.userData.noND = true; g.add(f); g.userData.flag = f;
  return g;
}

// =====================================================================================================
// TOWN: street toward the city hall (origin)
function buildTown() {
  const g = new THREE.Group(); g.name = "town";
  const road = canvasTex(256, 1024, (c, W, Hh) => { c.fillStyle = "#5b5a60"; c.fillRect(0, 0, W, Hh); const r = rnd(2); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(0,0,0,${r() * 0.12})`; c.fillRect(r() * W, r() * Hh, 4, 4); } c.fillStyle = "#f4d03f"; for (let y = 0; y < Hh; y += 128) c.fillRect(W / 2 - 5, y, 10, 64); }, [1, 6]);
  g.add(ground(9, 140, "#ffffff", road).translateZ(0));
  for (const s of [-1, 1]) g.add(box(2.6, 0.22, 140, "#c9c2b5", { pos: [s * 5.8, 0.11, -10] }));
  const lot = ground(300, 300, "#ffffff", grassTex("#8cc35a", "#73ad48", 40)); lot.position.y = -0.02; g.add(lot);
  const cols = ["#f2d38a", "#9fd3c7", "#f4a6a6", "#b8d47a", "#f6c28b", "#c7b8ea", "#8fc1e8", "#f7e3a1"];
  const roofs = ["#b5533c", "#3d6fa8", "#a8452f", "#6a7d8a", "#c2683a", "#2f8a6a"];
  let i = 0;
  for (const s of [-1, 1]) {
    for (let z = 30; z > -40; z -= 9.5) {
      const w = 7.5, h = 4.5 + ((i * 37) % 3) * 1.4, d = 7;
      const hs = house(i + 11, w, h, d, cols[i % cols.length], roofs[(i * 5) % roofs.length], { store: i % 5 === 2 ? "SARI-SARI STORE" : null, awning: i % 4 === 1 ? "#e85d3a" : null });
      hs.position.set(s * (7.1 + d / 2), 0, z); hs.rotation.y = -s * Math.PI / 2; g.add(hs);
      if (i % 2 === 0) { const p = palm(i + 3, 6.5 + (i % 3)); p.position.set(s * 6.6, 0, z - 4.7); g.add(p); }
      i++;
    }
  }
  // power poles + wires on the left
  const poles = [];
  for (let z = 26; z > -40; z -= 16) { const p = pole(8); p.position.set(-6.4, 0, z); g.add(p); poles.push(V(-6.4, 7.4, z)); }
  for (let k = 0; k < poles.length - 1; k++) for (let w = 0; w < 3; w++) g.add(wire(poles[k].clone().add(V(-0.7 + w * 0.7, 0, 0)), poles[k + 1].clone().add(V(-0.7 + w * 0.7, 0, 0)), 0.7 + w * 0.15, 0.025));
  const jeep = jeepney(1, "#d8382f"); jeep.position.set(3.2, 0, 10); g.add(jeep); H.jeep = jeep;
  const jeep2 = jeepney(2, "#2f7fd8"); jeep2.position.set(-3, 0, -18); jeep2.rotation.y = Math.PI; g.add(jeep2);
  // ---- city hall at z = -62
  const hall = new THREE.Group(); hall.position.set(0, 0, -62); g.add(hall);
  const frieze = canvasTex(1024, 128, (c, W, Hh) => { c.fillStyle = "#f6f1e6"; c.fillRect(0, 0, W, Hh); fitText(c, "BULWAGANG PANLUNGSOD", W / 2, Hh / 2 + 6, W * 0.8, 84, "Baloo", 800, "#5a4a3a"); });
  hall.add(box(34, 13, 14, "#f6f1e6", { pos: [0, 6.5, -4] }));
  hall.add(box(36, 1.2, 15, "#e8dcc6", { pos: [0, 13.6, -4] }));
  hall.add(box(16, 2.2, 1.2, "#f6f1e6", { pos: [0, 12.2, 3.9], mat: [toon("#f6f1e6"), toon("#f6f1e6"), toon("#f6f1e6"), toon("#f6f1e6"), toon("#fff", { map: frieze }), toon("#f6f1e6")] }));
  const ped = new THREE.Shape(); ped.moveTo(-8.5, 0); ped.lineTo(8.5, 0); ped.lineTo(0, 3.6); ped.closePath();
  hall.add(mesh(new THREE.ExtrudeGeometry(ped, { depth: 1.4, bevelEnabled: false }), toon("#efe6d4"), { pos: [0, 13.3, 3.2] }));
  for (let k = -3; k <= 3; k++) hall.add(cyl(0.55, 0.62, 10.6, "#fbf8f0", { pos: [k * 2.4, 5.5, 4], seg: 18 }));
  for (let st = 0; st < 4; st++) hall.add(box(20 - st * 0.6, 0.3, 3 - st * 0.6, "#e3dccd", { pos: [0, 0.15 + st * 0.3, 5.8 - st * 0.3] }));
  // windows on the wings
  const win = canvasTex(512, 256, (c, W, Hh) => { c.fillStyle = "#f6f1e6"; c.fillRect(0, 0, W, Hh); for (let x = 0; x < 4; x++) for (let y = 0; y < 2; y++) { c.fillStyle = "#7fb4de"; c.fillRect(30 + x * 125, 30 + y * 120, 70, 80); c.strokeStyle = INK; c.lineWidth = 5; c.strokeRect(30 + x * 125, 30 + y * 120, 70, 80); } });
  for (const s of [-1, 1]) hall.add(box(9, 9, 0.2, "#fff", { pos: [s * 12.5, 5.5, 3.05], mat: toon("#fff", { map: win }) }));
  hall.add(mesh(new THREE.SphereGeometry(4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon("#c7d3dc"), { pos: [0, 14.2, -4], smooth: true }));
  const fp = flagpole(16); fp.position.set(-12, 0, 9); hall.add(fp); H.flag = fp.userData.flag;
  // tarpaulin: hangs from the frieze, unrolls downward (scale.y)
  H.tarpTex = canvasTex(1000, 600, () => {});
  const tarpPivot = new THREE.Group(); tarpPivot.position.set(0, 10.9, 4.75); hall.add(tarpPivot);
  const tg = new THREE.PlaneGeometry(13, 7.8); tg.translate(0, -3.9, 0);
  const tarp = mesh(tg, new THREE.MeshBasicMaterial({ map: H.tarpTex, side: THREE.DoubleSide }), { cast: false });
  tarpPivot.add(tarp); H.tarp = tarpPivot;
  // flood water for the town (hidden by default)
  const fw = mesh(new THREE.PlaneGeometry(40, 160), waterMat("#7c6540", "#c9b48a", true), { rot: [-Math.PI / 2, 0, 0], pos: [0, 1.15, -10], cast: false });
  fw.visible = false; g.add(fw); H.townFlood = fw;
  // SUV
  const suv = new THREE.Group();
  const body = "#15161b";
  suv.add(box(2.2, 1.1, 5.0, body, { pos: [0, 1.0, 0] }));
  suv.add(box(2.1, 0.12, 3.0, body, { pos: [0, 2.35, -0.4] }));
  for (const [x, z] of [[-1, 1.1], [1, 1.1], [-1, -1.9], [1, -1.9]]) suv.add(box(0.12, 0.85, 0.14, body, { pos: [x * 1.0, 1.95, z] }));
  suv.add(box(2.24, 0.2, 0.3, "#d9dde4", { pos: [0, 0.7, 2.55] }));
  for (const s of [-1, 1]) { suv.add(sphere(0.18, "#fff6c8", { pos: [s * 0.8, 1.2, 2.5], m: {} })); }
  for (const [x, z] of [[-1, -1.6], [1, -1.6], [-1, 1.6], [1, 1.6]]) suv.add(cyl(0.5, 0.5, 0.4, "#111", { pos: [x * 1.05, 0.5, z], rot: [0, 0, Math.PI / 2] }));
  const shine = box(2.22, 0.06, 4.6, "#6a7080", { pos: [0, 1.56, 0] }); suv.add(shine);
  for (const q of [-1, 1]) suv.add(sphere(0.55, "#eef8ff", { pos: [q * 1.15, 1.18, 2.3], scale: [1.5, 0.45, 1.2], cast: false }));
  suv.add(sphere(0.6, "#eef8ff", { pos: [0, 1.18, 2.75], scale: [2.2, 0.4, 0.8], cast: false }));
  H.suv = suv; g.add(suv);
  H.suvDriver = new Card(CROC({ shades: 1, armR: 2.2, armL: 0.5 }), 1.75); H.suvDriver.root.position.set(-0.45, 0.75, 0.2); suv.add(H.suvDriver.root); H.suvDriver.shadow.visible = false;
  // clouds
  for (let k = 0; k < 8; k++) { const cl = cloud(k + 1, 2.2); cl.position.set(-90 + k * 26, 38 + (k % 3) * 8, -170 - (k % 2) * 40); g.add(cl); }
  return g;
}

// =====================================================================================================
// RIVER valley (coconut gag, project signs, ghosts)
function buildRiver() {
  const g = new THREE.Group(); g.name = "river";
  const water = mesh(new THREE.PlaneGeometry(26, 500), waterMat(), { rot: [-Math.PI / 2, 0, 0], pos: [0, 0, -100], cast: false });
  g.add(water); H.riverWater = water;
  const gt = grassTex("#7cc152", "#5ea83f", 60);
  for (const s of [-1, 1]) {
    const bank = mesh(new THREE.BoxGeometry(300, 3, 500), [toon("#8a6a45"), toon("#8a6a45"), toon("#fff", { map: gt }), toon("#6b5035"), toon("#8a6a45"), toon("#8a6a45")], { pos: [s * (13 + 150), 0.7, -100] });
    g.add(bank);
    const slope = mesh(new THREE.BoxGeometry(4, 0.6, 500), toon("#a08055"), { pos: [s * 13.4, 0.9, -100], rot: [0, 0, s * 0.45] });
    g.add(slope);
  }
  const bed = mesh(new THREE.PlaneGeometry(40, 500), toon("#2d5f8a"), { rot: [-Math.PI / 2, 0, 0], pos: [0, -0.8, -100] }); g.add(bed);
  const r = rnd(77);
  for (let k = 0; k < 70; k++) {
    const s = r() < 0.5 ? -1 : 1; const x = s * (16 + r() * 60), z = 40 - r() * 330;
    const p = r() < 0.5 ? palm(k + 5, 6 + r() * 4) : tree(k + 9, 4 + r() * 3); p.position.set(x, 2.2, z); g.add(p);
  }
  // nipa huts on stilts
  for (let k = 0; k < 7; k++) {
    const s = k % 2 ? -1 : 1; const hut = new THREE.Group();
    hut.add(box(4, 2.6, 4, "#c9a46a", { pos: [0, 2.6, 0] }));
    const rf = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.4, 4), toon("#9a7a45")); rf.position.y = 5.1; rf.rotation.y = Math.PI / 4; rf.castShadow = true; hut.add(rf);
    for (const [x, z] of [[-1.7, -1.7], [1.7, -1.7], [-1.7, 1.7], [1.7, 1.7]]) hut.add(cyl(0.12, 0.12, 1.4, "#6b4a2a", { pos: [x, 0.7, z], seg: 6 }));
    hut.position.set(s * (20 + k * 4), 2.2, -20 - k * 38); hut.rotation.y = r() * 3; g.add(hut);
  }
  // mountains
  for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.ConeGeometry(40 + (k % 3) * 15, 45 + (k % 4) * 12, 7), toon(k % 2 ? "#6f9f78" : "#7fae86")); m.position.set(-180 + k * 45, 15, -330 - (k % 3) * 30); g.add(m); }
  // coconuts (the "croc eyes") in the water
  H.coconuts = new THREE.Group(); g.add(H.coconuts); H.coconuts.position.set(0.6, 0, 6);
  for (const x of [-0.55, 0.55]) { const cn = sphere(0.42, "#6b4a2a", { pos: [x, 0, 0] }); H.coconuts.add(cn); cn.add(sphere(0.12, "#3a2a1a", { pos: [0, 0.2, 0.35] })); }
  // flood-control project signs (pop up) along both banks
  H.projSigns = [];
  const signTex = canvasTex(640, 400, (c, W, Hh) => {
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#1d4f9a"; c.fillRect(0, 0, W, 110);
    fitText(c, "FLOOD CONTROL", W / 2, 60, W * 0.9, 84, "Luckiest Guy", 400, "#fff");
    fitText(c, "PROJECT", W / 2, 175, W * 0.9, 90, "Luckiest Guy", 400, "#1d4f9a");
    c.fillStyle = "#f4c430"; c.fillRect(0, Hh - 110, W, 110);
    fitText(c, "₱ ₱ ₱ ₱ ₱", W / 2, Hh - 55, W * 0.9, 70, "Baloo", 800, "#241726");
    c.strokeStyle = INK; c.lineWidth = 14; c.strokeRect(0, 0, W, Hh);
  });
  for (let k = 0; k < 140; k++) {
    const s = k % 2 ? -1 : 1; const z = 30 - (k / 2 | 0) * 4.2 - r() * 2; const x = s * (15.5 + r() * 18);
    const sg = new THREE.Group();
    sg.add(box(2.4, 1.5, 0.1, "#fff", { pos: [0, 2.0, 0], mat: [toon("#ddd"), toon("#ddd"), toon("#ddd"), toon("#ddd"), new THREE.MeshBasicMaterial({ map: signTex }), toon("#ddd")] }));
    for (const q of [-1, 1]) sg.add(cyl(0.06, 0.06, 2.0, "#6d7480", { pos: [q * 0.9, 1.0, -0.08], seg: 5, cast: false }));
    sg.position.set(x, 2.2, z); sg.rotation.y = -s * 0.5 + (r() - 0.5) * 0.4;
    sg.scale.setScalar(0.001); sg.userData.order = (Math.abs(z - 30) / 300) * 0.6 + r() * 0.4; sg.userData.x = x; sg.userData.z = z;
    g.add(sg); H.projSigns.push(sg);
  }
  // ghosts (cards) above signs
  H.ghosts = [];
  for (let k = 0; k < 26; k++) {
    const near = H.projSigns.filter((q) => q.position.z > -2 && q.position.z < 24);
    const sgn = near[(k * 3) % near.length];
    const gh = new Card({ kind: "ghost", t: k }, 5.0); gh.shadow.visible = false;
    gh.root.position.set(sgn.position.x, sgn.position.y + 2, sgn.position.z); gh.root.visible = false; gh.base = gh.root.position.clone(); gh.k = k;
    g.add(gh.root); H.ghosts.push(gh);
  }
  for (let k = 0; k < 7; k++) { const cl = cloud(k + 20, 2.6); cl.position.set(-100 + k * 34, 40 + (k % 3) * 8, -260 - (k % 2) * 30); g.add(cl); }
  return g;
}

// =====================================================================================================
// SESSION HALL (interior)
function buildHall() {
  const g = new THREE.Group(); g.name = "hall";
  const wood = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#9a6a3f"; c.fillRect(0, 0, W, Hh); for (let x = 0; x < W; x += 32) { c.fillStyle = "rgba(60,30,10,0.35)"; c.fillRect(x, 0, 3, Hh); } const r = rnd(5); for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(255,220,170,0.08)"; c.fillRect(r() * W, r() * Hh, 2, 40); } }, [6, 2]);
  const floor = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#7a2f2f"; c.fillRect(0, 0, W, Hh); c.strokeStyle = "rgba(240,200,90,0.4)"; c.lineWidth = 4; for (let i = 0; i < 8; i++) { c.strokeRect(10 + i * 2, 10 + i * 2, W - 20 - i * 4, Hh - 20 - i * 4); i += 3; } }, [8, 8]);
  g.add(ground(40, 40, "#fff", floor));
  // walls
  g.add(box(40, 12, 0.4, "#fff", { pos: [0, 6, -14], mat: toon("#fff", { map: wood }) }));
  for (const s of [-1, 1]) g.add(box(0.4, 12, 40, "#fff", { pos: [s * 16, 6, 0], mat: toon("#fff", { map: wood }) }));
  g.add(box(40, 0.4, 40, "#e9dcc4", { pos: [0, 12, 0], cast: false }));
  // seal
  const seal = canvasTex(512, 512, (c, W, Hh) => {
    c.beginPath(); c.arc(W / 2, Hh / 2, 240, 0, 7); c.fillStyle = "#f4c430"; c.fill(); c.lineWidth = 14; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(W / 2, Hh / 2, 170, 0, 7); c.fillStyle = "#1d4f9a"; c.fill(); c.stroke();
    fitText(c, "SANGGUNIANG", W / 2, 80, 330, 50, "Baloo", 800, INK); fitText(c, "BUWAYA", W / 2, Hh - 70, 300, 60, "Luckiest Guy", 400, INK);
    // tiny croc silhouette
    c.fillStyle = "#5d9e3f"; c.beginPath(); c.ellipse(W / 2 - 20, Hh / 2 + 10, 110, 42, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(W / 2 + 60, Hh / 2 - 10); c.lineTo(W / 2 + 150, Hh / 2 + 10); c.lineTo(W / 2 + 60, Hh / 2 + 30); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.arc(W / 2 + 10, Hh / 2 - 18, 12, 0, 7); c.fill();
  });
  const sm = mesh(new THREE.CircleGeometry(3, 40), new THREE.MeshBasicMaterial({ map: seal }), { pos: [0, 7.5, -13.75], cast: false }); g.add(sm);
  for (const s of [-1, 1]) { const f = flagpole(6); f.position.set(s * 6, 0, -12.5); f.scale.setScalar(0.8); g.add(f); }
  // curved desk (arc of boxes) facing +z, crocs behind
  H.hallCrocs = [];
  const N = 9;
  for (let k = 0; k < N; k++) {
    const a = (k / (N - 1) - 0.5) * 2.4; const R = 5.5;
    const x = Math.sin(a) * R, z = -Math.cos(a) * R - 1.5;
    const d = box(1.5, 1.15, 0.9, "#7a4a2a", { pos: [x, 0.58, z + 0.6], rot: [0, -a, 0] }); g.add(d);
    g.add(box(1.6, 0.08, 1.0, "#5a341c", { pos: [x, 1.18, z + 0.6], rot: [0, -a, 0] }));
    const mic = cyl(0.02, 0.02, 0.5, "#222", { pos: [x + 0.3, 1.45, z + 0.55], seg: 4 }); g.add(mic);
    const c = new Card(CROC({ expr: ["grin", "smug", "grin", "sly"][k % 4], croc: ["#5d9e3f", "#4f9150", "#6aa646"][k % 3] }), 1.7);
    c.root.position.set(x, -0.15, z - 0.2); c.shadow.visible = false; g.add(c.root); H.hallCrocs.push(c);
    g.add(box(0.8, 1.6, 0.2, "#3a2a5a", { pos: [x, 1.0, z - 0.75], rot: [0, -a, 0] })); // chair back
  }
  // ceiling lamps
  for (let k = -1; k <= 1; k++) { const l = sphere(0.5, "#fff6d0", { pos: [k * 7, 10.8, -4], m: {} }); l.material = new THREE.MeshBasicMaterial({ color: "#fff3c4" }); g.add(l); }
  // standing croc for "naka-barong" + "nakangiti" close-ups
  H.hallHero = new Card(CROC({ expr: "smug", armL: 0.2, armR: 0.2 }), 1.75); H.hallHero.root.position.set(0, 0, 4); g.add(H.hallHero.root);
  return g;
}

// =====================================================================================================
// MONEY plaza
function buildMoney() {
  const g = new THREE.Group(); g.name = "money";
  const tile = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#e8dcc8"; c.fillRect(0, 0, W, Hh); c.strokeStyle = "rgba(120,100,70,0.35)"; c.lineWidth = 3; for (let x = 0; x <= W; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, Hh); c.stroke(); c.beginPath(); c.moveTo(0, x); c.lineTo(W, x); c.stroke(); } }, [40, 40]);
  g.add(ground(300, 300, "#fff", tile));
  // backdrop buildings
  const cols = ["#9fc4e8", "#f2d38a", "#c7b8ea", "#f4a6a6", "#b8d47a"];
  for (let k = 0; k < 12; k++) { const h = 12 + (k * 7) % 14; const b = house(k + 40, 10, h, 10, cols[k % 5], "#6a7d8a"); b.position.set(-66 + k * 12, 0, -40 - (k % 2) * 8); g.add(b); }
  for (let k = 0; k < 6; k++) { const cl = cloud(k + 50, 2.2); cl.position.set(-60 + k * 26, 36, -120); g.add(cl); }
  // bills: instanced
  const billCols = ["#3a6fd0", "#e9c43a", "#8d5fc7", "#4aa860", "#d8573a"];
  const billTex = canvasTex(256, 120, (c, W, Hh) => { c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, Hh); c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = 6; c.strokeRect(8, 8, W - 16, Hh - 16); c.beginPath(); c.arc(W * 0.3, Hh / 2, 30, 0, 7); c.stroke(); fitText(c, "₱1000", W * 0.68, Hh / 2, W * 0.5, 52, "Baloo", 800, "rgba(0,0,0,0.5)"); });
  H.piles = [];
  const pileCenters = [V(-7.5, 0, 0), V(-3.75, 0, -1.2), V(0, 0, -1.6), V(3.75, 0, -1.2), V(7.5, 0, 0)];
  for (let p = 0; p < 5; p++) {
    const pg = new THREE.Group(); g.add(pg);
    const n = 260; const geo = new THREE.BoxGeometry(0.9, 0.06, 0.42);
    const im = new THREE.InstancedMesh(geo, toon("#ffffff", { map: billTex }), n);
    im.castShadow = true; im.receiveShadow = true;
    const r = rnd(p + 100); const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const col = new THREE.Color();
    for (let k = 0; k < n; k++) {
      const u = r(); const h = u * 3.2; const rad = (1 - u) * 2.3 * Math.sqrt(r());
      const a = r() * 6.28;
      q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6.28, (r() - 0.5) * 0.5));
      m4.compose(V(Math.cos(a) * rad, h * (1 - rad / 2.6) + 0.05, Math.sin(a) * rad), q, V(1, 1, 1));
      im.setMatrixAt(k, m4); im.setColorAt(k, col.set(billCols[(k + p) % 5]));
    }
    pg.add(im); pg.userData.home = pileCenters[p]; H.piles.push(pg);
  }
  // contractors (15) in rows, to the right
  H.contractors = [];
  for (let k = 0; k < 15; k++) {
    const row = k / 5 | 0, col = k % 5;
    const c = new Card(CONTRACTOR(k), 1.7 + (k % 3) * 0.06);
    c.root.position.set(20 + col * 1.35 + row * 0.5, 0, 2 - row * 1.5); g.add(c.root); H.contractors.push(c);
  }
  return g;
}

// =====================================================================================================
// PANDI riverbank: sign, calendar, grass, rusty sheet piles, judges, flood wave
function buildPandi() {
  const g = new THREE.Group(); g.name = "pandi";
  const gt = grassTex("#86bf55", "#6aa83f", 50);
  g.add(mesh(new THREE.BoxGeometry(200, 2, 200), [toon("#8a6a45"), toon("#8a6a45"), toon("#fff", { map: gt }), toon("#6b5035"), toon("#8a6a45"), toon("#8a6a45")], { pos: [0, -1, -100 + 0] }));
  // river behind the bank (z < -14)
  const water = mesh(new THREE.PlaneGeometry(300, 40), waterMat("#4a8fc0", "#6fb0dc"), { rot: [-Math.PI / 2, 0, 0], pos: [0, -0.6, -34], cast: false });
  g.add(water); H.pandiWater = water;
  g.children[0].position.z = 86; // bank ends at z=-14
  const slope = mesh(new THREE.BoxGeometry(300, 0.6, 4), toon("#9a7a50"), { pos: [0, -0.4, -15.4], rot: [-0.5, 0, 0] }); g.add(slope);
  const far = mesh(new THREE.BoxGeometry(300, 2, 60), [toon("#8a6a45"), toon("#8a6a45"), toon("#fff", { map: gt }), toon("#6b5035"), toon("#8a6a45"), toon("#8a6a45")], { pos: [0, -0.8, -84] }); g.add(far);
  const r = rnd(31);
  for (let k = 0; k < 30; k++) { const p = r() < 0.6 ? palm(k + 60, 6 + r() * 4) : tree(k + 70, 4 + r() * 3); p.position.set(-80 + r() * 160, 0.2, -60 - r() * 30); g.add(p); }
  for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.ConeGeometry(40 + (k % 3) * 15, 40 + (k % 4) * 10, 7), toon(k % 2 ? "#6f9f78" : "#7fae86")); m.position.set(-150 + k * 60, 10, -200); g.add(m); }
  for (let k = 0; k < 5; k++) { const cl = cloud(k + 80, 2.4); cl.position.set(-70 + k * 34, 34, -150); g.add(cl); }
  // tall grass where the wall should be: instanced blades in clumps along z=-10..-13, x=-14..14
  const blade = new THREE.ConeGeometry(0.09, 1.0, 3); blade.translate(0, 0.5, 0);
  const N = 2600; const im = new THREE.InstancedMesh(blade, toon("#ffffff"), N);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  const gcol = ["#5aa83f", "#6fbd4a", "#4b9636", "#86c95a", "#9bcf62"];
  for (let k = 0; k < N; k++) {
    let x = -16 + r() * 32, z = -13.5 + r() * 5.2 + (r() < 0.3 ? r() * 4 : 0);
    if (x > 1.2 && x < 6.5 && z > -8.6) z = -8.6 - r() * 1.5;
    const h = 0.7 + r() * 1.3;
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * 6, (r() - 0.5) * 0.5));
    m4.compose(V(x, 0, z), q, V(1, h, 1)); im.setMatrixAt(k, m4); im.setColorAt(k, col.set(gcol[k % 5]));
  }
  im.castShadow = true; im.receiveShadow = true; im.userData.noND = false; g.add(im); H.grass = im;
  // rusty sheet piles (a few)
  const rust = canvasTex(128, 256, (c, W, Hh) => { c.fillStyle = "#9a4a22"; c.fillRect(0, 0, W, Hh); const rr = rnd(3); for (let i = 0; i < 80; i++) { c.fillStyle = ["#6b2e12", "#b8642c", "#7a3a1a", "#c97a3a"][i % 4]; c.beginPath(); c.arc(rr() * W, rr() * Hh, 3 + rr() * 9, 0, 7); c.fill(); } for (let x = 0; x < W; x += 32) { c.fillStyle = "rgba(0,0,0,0.25)"; c.fillRect(x, 0, 8, Hh); } });
  H.piles2 = [];
  for (const [x, z, ry, tilt] of [[-2.2, -9.8, 0.1, 0.05], [-1.0, -9.9, 0.05, -0.08], [2.2, -8.2, -0.12, 0.12], [3.6, -8.0, 0.3, -0.2], [5.0, -8.3, 0.0, 0.3]]) {
    const pv = new THREE.Group(); pv.position.set(x, 0, z); pv.rotation.y = ry;
    const pl = box(1.1, 2.4, 0.12, "#fff", { pos: [0, 1.1, 0], mat: toon("#fff", { map: rust }) });
    pv.add(pl); pv.rotation.z = tilt; g.add(pv); H.piles2.push(pv);
  }
  // the project sign (big)
  H.pandiSignTex = canvasTex(900, 640, () => {});
  const sign = signboard(4.6, 3.2, () => {}, { post: 1.5 });
  sign.userData.board.material[4] = new THREE.MeshBasicMaterial({ map: H.pandiSignTex });
  sign.position.set(-6, 0, -4); sign.rotation.y = 0.35; g.add(sign); H.pandiSign = sign;
  // calendar on a post
  H.calTex = canvasTex(400, 480, () => {});
  const cal = signboard(1.3, 1.56, () => {}, { post: 1.4 });
  cal.userData.board.material[4] = new THREE.MeshBasicMaterial({ map: H.calTex });
  cal.position.set(-2.6, 0, -2.4); cal.rotation.y = 0.2; g.add(cal); H.cal = cal;
  // flying calendar pages (cards of paper)
  H.pages = [];
  for (let k = 0; k < 12; k++) { const p = mesh(new THREE.PlaneGeometry(1.2, 1.0), toon("#fbfbf5", { side: THREE.DoubleSide }), { cast: false }); p.userData.noND = true; p.visible = false; g.add(p); H.pages.push(p); }
  // judges
  H.judges = [0, 1, 2].map((i) => { const c = new Card(JUDGE(i), 1.72); g.add(c.root); return c; });
  // price tag on the grass
  H.tagTex = canvasTex(512, 300, (c, W, Hh) => {
    c.fillStyle = "#ffe14a"; c.beginPath(); c.moveTo(80, 0); c.lineTo(W, 0); c.lineTo(W, Hh); c.lineTo(80, Hh); c.lineTo(0, Hh / 2); c.closePath(); c.fill(); c.lineWidth = 12; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.arc(60, Hh / 2, 18, 0, 7); c.fillStyle = "#fff"; c.fill(); c.stroke();
    fitText(c, "₱92,000,000", W / 2 + 40, Hh / 2 - 30, W - 140, 96, "Luckiest Guy", 400, "#d22", INK, 10);
    fitText(c, "DAMO (1 lote)", W / 2 + 40, Hh / 2 + 70, W - 160, 56, "Baloo", 800, INK);
  });
  const tag = new THREE.Group(); tag.position.set(-0.8, 2.5, -9.2);
  const tm = mesh(new THREE.PlaneGeometry(1.3, 0.76), new THREE.MeshBasicMaterial({ map: H.tagTex, side: THREE.DoubleSide, transparent: true, alphaTest: 0.3 }), { cast: false });
  tm.position.y = -0.55; tm.userData.noND = true; tag.add(tm);
  const str = cyl(0.008, 0.008, 0.25, "#fff", { pos: [-0.55, -0.1, 0], seg: 4 }); str.userData.noND = true; tag.add(str);
  g.add(tag); tag.visible = false; H.tag = tag;
  // flood wave: a raised water slab with a rolling front
  const wave = new THREE.Group(); g.add(wave); H.wave = wave;
  const wm = waterMat("#4a8fc0", "#cfe9f7");
  const slab = mesh(new THREE.BoxGeometry(120, 1.6, 60), wm, { pos: [0, 0.2, -30], cast: false }); wave.add(slab);
  const front = mesh(new THREE.CylinderGeometry(0.9, 0.9, 120, 16, 1, false, 0, Math.PI), toon("#e8f6ff"), { rot: [0, 0, Math.PI / 2], pos: [0, 0.9, 0], smooth: true, cast: false });
  front.rotation.set(Math.PI / 2, 0, Math.PI / 2); wave.add(front);
  wave.position.set(0, -2.5, -14); wave.visible = false;
  return g;
}

// =====================================================================================================
// CARINDERIA with the TV
function buildEatery() {
  const g = new THREE.Group(); g.name = "eatery";
  const tiles = canvasTex(256, 256, (c, W, Hh) => { for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) { c.fillStyle = (x + y) % 2 ? "#e9e2d2" : "#b84a3a"; c.fillRect(x * 32, y * 32, 32, 32); } }, [10, 10]);
  g.add(ground(30, 30, "#fff", tiles));
  const wallTex = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = "#8fd0c2"; c.fillRect(0, 0, W, Hh); c.fillStyle = "#6fb3a5"; c.fillRect(0, Hh * 0.62, W, Hh * 0.38); c.fillStyle = "rgba(0,0,0,0.06)"; for (let i = 0; i < 30; i++) c.fillRect(Math.random() * W, Math.random() * Hh, 30, 20); }, [3, 1]);
  g.add(box(20, 6, 0.3, "#fff", { pos: [0, 3, -5], mat: toon("#fff", { map: wallTex }) }));
  g.add(box(0.3, 6, 14, "#fff", { pos: [-8, 3, 2], mat: toon("#fff", { map: wallTex }) }));
  // menu board
  const menu = canvasTex(600, 360, (c, W, Hh) => { c.fillStyle = "#2a3a2a"; c.fillRect(0, 0, W, Hh); c.strokeStyle = "#c9a46a"; c.lineWidth = 16; c.strokeRect(0, 0, W, Hh);
    fitText(c, "CARINDERIA NI ALING NENA", W / 2, 50, W * 0.9, 44, "Luckiest Guy", 400, "#f4c430");
    const items = [["ADOBO", "₱80"], ["SINIGANG", "₱90"], ["TINOLA", "₱75"], ["KANIN", "₱15"]];
    items.forEach(([a, b], i) => { c.font = "800 44px Baloo"; c.textAlign = "left"; c.fillStyle = "#fff"; c.fillText(a, 50, 120 + i * 60); c.textAlign = "right"; c.fillText(b, W - 50, 120 + i * 60); }); });
  g.add(box(3.6, 2.2, 0.1, "#fff", { pos: [-4.5, 3.9, -4.8], mat: toon("#fff", { map: menu }) }));
  // counter with pots
  g.add(box(6, 1.1, 1.2, "#c9a46a", { pos: [-4.5, 0.55, -3.8] }));
  for (let k = 0; k < 4; k++) { g.add(cyl(0.38, 0.32, 0.45, "#b9c0c8", { pos: [-6.6 + k * 1.4, 1.33, -3.8] })); g.add(cyl(0.4, 0.4, 0.05, "#9aa1aa", { pos: [-6.6 + k * 1.4, 1.58, -3.8] })); }
  // TV on a bracket, upper right
  const tv = new THREE.Group(); tv.position.set(3.2, 3.6, -4.4); g.add(tv); H.tv = tv;
  tv.add(box(2.6, 1.6, 0.25, "#1b1b22", { pos: [0, 0, 0] }));
  H.tvTex = canvasTex(960, 540, () => {});
  const scr = mesh(new THREE.PlaneGeometry(2.4, 1.35), new THREE.MeshBasicMaterial({ map: H.tvTex }), { pos: [0, 0, 0.13], cast: false });
  scr.userData.nd = null; tv.add(scr); H.tvScreen = scr;
  tv.add(box(0.2, 0.9, 0.2, "#444", { pos: [0, 1.2, -0.2] }));
  // table + customers
  g.add(box(4.2, 0.12, 1.6, "#d9b98a", { pos: [1.5, 1.0, 0.5] }));
  for (const x of [-0.3, 3.3]) for (const z of [-0.1, 1.1]) g.add(cyl(0.06, 0.06, 1.0, "#6b4a2a", { pos: [x, 0.5, z], seg: 6 }));
  for (let k = 0; k < 3; k++) { g.add(cyl(0.32, 0.28, 0.06, "#ffffff", { pos: [0.3 + k * 1.3, 1.1, 0.3] })); g.add(sphere(0.18, "#f7f2e6", { pos: [0.3 + k * 1.3, 1.15, 0.3], scale: [1, 0.5, 1] })); }
  g.add(box(4.2, 0.1, 0.5, "#8a5a32", { pos: [1.5, 0.55, 1.75] }));
  H.diners = [];
  for (let k = 0; k < 3; k++) { const c = new Card(citizen(k + 2, { look: 1, expr: "neutral", armL: 0.3, armR: 0.5 }), 1.6); c.root.position.set(0.3 + k * 1.3, -0.35, 1.95); c.shadow.visible = false; g.add(c.root); H.diners.push(c); }
  const fan = new THREE.Group(); fan.position.set(-1.6, 5.4, -1); g.add(fan); H.fan = fan;
  for (let k = 0; k < 3; k++) { const b = box(1.4, 0.03, 0.25, "#e9e9e9", { pos: [0.7, 0, 0] }); const p = new THREE.Group(); p.rotation.y = k * 2.094; p.add(b); fan.add(p); }
  return g;
}

// =====================================================================================================
// BALLOT table
function buildBallot() {
  const g = new THREE.Group(); g.name = "ballot";
  const woodTex = canvasTex(512, 512, (c, W, Hh) => { c.fillStyle = "#b07a48"; c.fillRect(0, 0, W, Hh); const r = rnd(8); for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(80,40,15,${0.1 + r() * 0.15})`; c.lineWidth = 2 + r() * 3; c.beginPath(); const y = r() * Hh; c.moveTo(0, y); c.bezierCurveTo(W * 0.3, y + 20 * (r() - 0.5), W * 0.6, y + 20 * (r() - 0.5), W, y); c.stroke(); } }, [2, 2]);
  g.add(box(4, 0.1, 3, "#fff", { pos: [0, 0.95, 0], mat: toon("#fff", { map: woodTex }) }));
  g.add(ground(60, 60, "#c7c0b2"));
  const wall = box(30, 10, 0.2, "#e6e0f0", { pos: [0, 5, -3] }); g.add(wall);
  // ballot paper
  H.ballotTex = canvasTex(800, 1300, (c, W, Hh) => {
    c.fillStyle = "#fbfbf7"; c.fillRect(0, 0, W, Hh);
    c.fillStyle = "#222"; fitText(c, "OPISYAL NA BALOTA", W / 2, 70, W * 0.85, 64, "Baloo", 800, "#111");
    fitText(c, "PAMBANSA AT LOKAL NA HALALAN", W / 2, 130, W * 0.8, 36, "Baloo", 700, "#333");
    c.fillStyle = "#1d1d1d"; c.fillRect(40, 170, W - 80, 56); fitText(c, "KONSEHAL  —  Bumoto ng hindi hihigit sa 3", W / 2, 199, W * 0.85, 34, "Baloo", 700, "#fff");
    const names = ["ABAD, PEDRO (IND)", "BAUTISTA, ROSA (PDP)", "BUWAYA, BOY (PB)", "CRUZ, JUAN (IND)", "DELA PAZ, LIZA (LP)", "GARCIA, BEN (NP)", "MANALO, JOY (IND)", "REYES, TONI (PB)", "SANTOS, MARIA (IND)", "TOLENTINO, ED (LP)", "VILLAR, NENE (IND)"];
    names.forEach((n, i) => { const y = 280 + i * 92; c.lineWidth = 5; c.strokeStyle = "#111"; c.beginPath(); c.ellipse(90, y, 30, 20, 0, 0, 7); c.stroke(); c.font = "700 44px Baloo"; c.textAlign = "left"; c.fillStyle = "#111"; c.fillText(`${i + 1}. ${n}`, 150, y + 14); c.strokeStyle = "rgba(0,0,0,0.15)"; c.lineWidth = 2; c.beginPath(); c.moveTo(40, y + 46); c.lineTo(W - 40, y + 46); c.stroke(); });
  });
  const paper = mesh(new THREE.PlaneGeometry(0.8, 1.3), toon("#fff", { map: H.ballotTex }), { rot: [-Math.PI / 2, 0, 0.08], pos: [-0.35, 1.006, 0.1], cast: false });
  g.add(paper); H.ballot = paper;
  // pen
  const pen = cyl(0.012, 0.012, 0.32, "#2a5fd0", { pos: [0.25, 1.02, 0.35], rot: [Math.PI / 2, 0, 0.6], seg: 8 }); g.add(pen);
  // ballot box with slot
  const bb = new THREE.Group(); bb.position.set(0.95, 1.0, -0.55); g.add(bb); H.ballotBox = bb;
  const bbTex = canvasTex(512, 400, (c, W, Hh) => { c.fillStyle = "#e8e4d8"; c.fillRect(0, 0, W, Hh); fitText(c, "BALLOT BOX", W / 2, Hh / 2, W * 0.8, 90, "Luckiest Guy", 400, "#1d4f9a"); c.fillStyle = "#ce1126"; c.fillRect(0, Hh - 40, W, 40); });
  bb.add(box(0.9, 0.7, 0.6, "#fff", { pos: [0, 0.35, 0], mat: [toon("#e8e4d8"), toon("#e8e4d8"), toon("#e8e4d8"), toon("#e8e4d8"), toon("#fff", { map: bbTex }), toon("#e8e4d8")] }));
  bb.add(box(0.4, 0.02, 0.05, "#111", { pos: [0, 0.705, 0] }));
  // croc tail: chain of segments that sweeps out from behind the box
  const tail = new THREE.Group(); bb.add(tail); H.tail = tail; tail.position.set(0.38, 0.12, -0.22);
  H.tailSegs = [];
  let parent = tail;
  for (let k = 0; k < 9; k++) {
    const seg = new THREE.Group(); seg.position.x = k === 0 ? 0 : 0.13; parent.add(seg);
    const r0 = 0.12 * (1 - k / 10);
    const m = mesh(new THREE.CylinderGeometry(r0 * 0.85, r0, 0.14, 10), toon("#5d9e3f"), { rot: [0, 0, Math.PI / 2], pos: [0.065, 0, 0], smooth: true });
    seg.add(m);
    const sp = mesh(new THREE.ConeGeometry(0.03, 0.07, 4), toon("#4a8433"), { pos: [0.065, r0 * 0.95, 0] }); seg.add(sp);
    H.tailSegs.push(seg); parent = seg;
  }
  tail.visible = false;
  return g;
}

// =====================================================================================================
export function buildWorld(scene) {
  const defs = { town: [buildTown, V(0, 0, 0)], river: [buildRiver, V(1000, 0, 0)], hall: [buildHall, V(-1000, 0, 0)], money: [buildMoney, V(0, 0, 1000)], pandi: [buildPandi, V(1000, 0, 1000)], eatery: [buildEatery, V(-1000, 0, 1000)], ballot: [buildBallot, V(0, 0, -1000)] };
  for (const [k, [fn, p]] of Object.entries(defs)) { const g = fn(); g.position.copy(p); g.visible = false; scene.add(g); SETS[k] = g; }
}
