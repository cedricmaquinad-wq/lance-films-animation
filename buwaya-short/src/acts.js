// Acting layer: extra characters/props whose motion follows the words of the voice-over.
import * as THREE from "three";
import { H, SETS, CROC } from "./sets.js";
import { Card, box, cyl, sphere, mesh, toon, rnd } from "./kit.js";

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * x * (x * (6 * x - 15) + 10); };
const ease = (t, a, b) => ss((t - a) / (b - a));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const blink = (t, seed) => { const per = 1.5 + (seed % 7) * 0.13; return ((t + seed * 0.37) % per) < 0.12 ? 1 : 0; };
const springy = (t, a, f = 14, d = 5) => (t < a ? 0 : Math.sin((t - a) * f) * Math.exp(-(t - a) * d)); // decaying wobble

export const A = {};
const cards = [];
export function actCards() { return cards; }

function ring() {
  const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 40), new THREE.MeshBasicMaterial({ color: "#eaf6ff", transparent: true, opacity: 0.8, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.userData.noND = true; m.renderOrder = 2;
  return m;
}
function addCard(set, opts, h, pos, fx) { const c = new Card(opts, h, fx); c.root.position.set(...pos); SETS[set].add(c.root); cards.push(c); return c; }

export function buildActs() {
  // ---- river croc (rises from the water, wags finger, hops out with a briefcase)
  A.riverCroc = addCard("river", CROC({ expr: "neutral", hold: "briefcase", armR: 0.25 }), 1.95, [2.5, -1.8, 4]);
  A.riverCroc.shadow.visible = false;
  A.rings = [0, 1, 2].map(() => { const r = ring(); SETS.river.add(r); return r; });
  A.riverSplash = addCard("river", { t: 0 }, 3.0, [2.5, -0.2, 4.2], "splash"); A.riverSplash.root.visible = false;
  A.bubbles = []; for (let k = 0; k < 8; k++) { const b = sphere(0.08 + (k % 3) * 0.03, "#eaf6ff", { cast: false }); b.userData.noND = true; SETS.river.add(b); A.bubbles.push(b); }
  // ---- session hall: big leather chair + the croc who plops into it
  const chair = new THREE.Group(); chair.position.set(0, 0, 1.2); SETS.hall.add(chair); A.chair = chair;
  const red = "#8a1f26";
  chair.add(box(1.3, 0.22, 0.75, red, { pos: [0, 0.42, 0] }));
  chair.add(box(1.4, 2.1, 0.25, red, { pos: [0, 1.25, -0.42] }));
  chair.add(box(1.5, 0.25, 0.3, "#c9a440", { pos: [0, 2.35, -0.42] }));
  for (const s of [-1, 1]) { chair.add(box(0.2, 0.55, 0.8, red, { pos: [s * 0.72, 0.62, -0.02] })); chair.add(cyl(0.05, 0.05, 0.42, "#c9a440", { pos: [s * 0.5, 0.21, 0.25], seg: 6 })); }
  for (let k = 0; k < 5; k++) chair.add(sphere(0.05, "#c9a440", { pos: [-0.5 + k * 0.25, 1.9, -0.28] }));
  A.sitCroc = addCard("hall", CROC({ expr: "smug" }), 1.8, [0, 0, 1.62]); A.sitCroc.shadow.visible = false;
  // ---- stamping croc next to the Pandi sign
  A.stampCroc = addCard("pandi", CROC({ expr: "grin", hold: "stamp", armR: 0.4 }), 1.95, [-3.05, 0, -3.0]);
  // ---- swimming splashes in the flooded street
  A.splashes = [0, 1, 2, 3].map((k) => { const c = addCard("town", { t: 0 }, 1.4, [-2.6 + k * 1.7, 1.0, 5.5 - (k % 2) * 3], "splash"); c.root.visible = false; return c; });
  A.suvSplash = addCard("town", { t: 0 }, 3.2, [0, 0.9, 0], "splash"); A.suvSplash.root.visible = false;
  // ---- money rain
  const billCols = ["#3a6fd0", "#e9c43a", "#8d5fc7", "#4aa860"];
  A.bills = [];
  for (let k = 0; k < 46; k++) { const b = mesh(new THREE.PlaneGeometry(0.9, 0.42), toon(billCols[k % 4], { side: THREE.DoubleSide }), { cast: false }); b.userData.noND = true; SETS.money.add(b); A.bills.push(b); }
  // ---- ballot: magnifying glass
  const mag = new THREE.Group(); SETS.ballot.add(mag); A.mag = mag;
  const rim = mesh(new THREE.TorusGeometry(0.13, 0.018, 10, 40), toon("#222228"), { smooth: true }); rim.rotation.x = Math.PI / 2; mag.add(rim);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.13, 40), new THREE.MeshBasicMaterial({ color: "#dff1ff", transparent: true, opacity: 0.22, depthWrite: false }));
  lens.rotation.x = -Math.PI / 2; lens.userData.noND = true; mag.add(lens);
  const handle = cyl(0.02, 0.025, 0.28, "#7a4a24", { rot: [0, 0, Math.PI / 2], pos: [0.27, 0, 0.06], seg: 8 }); handle.rotation.set(0, -0.4, Math.PI / 2); mag.add(handle);
  // ---- better croc tail (smooth ellipsoid chain with double ridge)
  H.tail.visible = false;
  const tail = new THREE.Group(); H.ballotBox.add(tail); A.tail = tail; tail.position.set(0.36, 0.1, -0.2);
  A.tailSegs = []; let parent = tail;
  for (let k = 0; k < 10; k++) {
    const seg = new THREE.Group(); seg.position.x = k === 0 ? 0 : 0.12; parent.add(seg);
    const r0 = 0.11 * (1 - k / 11);
    const body = mesh(new THREE.SphereGeometry(1, 16, 10), toon(k % 2 ? "#4f9a3a" : "#4a9236"), { smooth: true, scale: [0.09, r0 * 0.75, r0], pos: [0.06, 0, 0] });
    seg.add(body);
    for (const s of [-1, 1]) seg.add(mesh(new THREE.ConeGeometry(0.018, 0.05, 4), toon("#3b7a2c"), { pos: [0.06, r0 * 0.7, s * r0 * 0.35] }));
    A.tailSegs.push(seg); parent = seg;
  }
  tail.visible = false;
  A.bang = addCard("ballot", { t: 0 }, 0.45, [1.55, 1.35, 0.15], "bang"); A.bang.root.visible = false; A.bang.shadow && (A.bang.shadow.visible = false);
}

// ------------------------------------------------------------------------------------------------
export function animateActs(t, shot) {
  const id = shot.id;
  // ---------------- river: "Sa Pilipinas, may mga buwaya" / "pero hindi sila nakatira sa ilog"
  {
    const c = A.riverCroc; const on = id === "hook_river" || id === "out_of_river";
    c.root.visible = on;
    // depth: eyes surface 0.9-1.24, head 1.24-1.6, waist at 2.7, hop out 3.45-3.95, walk away after
    let y = -1.75 + ease(t, 0.85, 1.24) * 0.25 + ease(t, 1.24, 1.62) * 0.55 + ease(t, 2.7, 3.1) * 0.15;
    let x = 2.5, z = 4;
    const hop = lin(t, 3.45, 3.95);
    if (t > 3.45) { x = 2.5 + (14.2 - 2.5) * ss(hop); y = y + (2.2 - y) * ss(hop) + Math.sin(hop * Math.PI) * 1.6; }
    if (t > 3.95) { const w = t - 3.95; x = 14.2 + w * 0.3; z = 4 - w * 1.9; y = 2.2; }
    c.root.position.set(x, y, z);
    const snap = t > 1.86 && t < 2.5 ? Math.abs(Math.sin((t - 1.86) * 9)) * Math.exp(-(t - 1.86) * 2) : 0;
    const wag = t > 2.9 && t < 3.45;
    const walking = t > 3.95;
    c.set({
      expr: t < 1.7 ? "neutral" : t < 2.7 ? "grin" : wag ? "smug" : "grin",
      jaw: t > 1.8 && t < 2.6 ? 0.25 + snap * 0.9 : 0,
      blink: t > 1.0 && t < 1.1 ? 1 : blink(t, 3),
      look: t < 2.7 ? 0 : 0.6,
      armL: wag ? 2.75 + Math.sin(t * 22) * 0.18 : hop > 0 && hop < 1 ? 2.2 : 0.2 + (walking ? Math.sin(t * 9) * 0.15 : 0),
      armR: hop > 0 && hop < 1 ? 1.6 : 0.3 - (walking ? Math.sin(t * 9) * 0.15 : 0),
      hold: "briefcase", walk: walking ? t * 9 : 0, wag: t * 4,
      lean: wag ? Math.sin(t * 11) * 0.06 : hop > 0 && hop < 1 ? -0.25 * Math.sin(hop * Math.PI) : 0,
      squash: (t > 3.95 && t < 4.25 ? 0.16 * Math.sin((t - 3.95) / 0.3 * Math.PI) : 0) + (t > 3.4 && t < 3.5 ? 0.1 : 0),
    });
    // ripples while rising + when snapping
    A.rings.forEach((r, k) => {
      const t0 = [0.95, 1.3, 1.9][k]; const u = t - t0;
      r.visible = on && u > 0 && u < 1.4 && t < 3.45;
      r.position.set(2.5, 0.03, 4); r.scale.setScalar(0.4 + u * 1.6); r.material.opacity = 0.8 * (1 - u / 1.4);
    });
    A.bubbles.forEach((b, k) => { const u = (t * 1.3 + k * 0.17) % 1; b.visible = on && t > 0.3 && t < 1.1; b.position.set(2.5 + Math.sin(k * 2.1) * 0.5, -0.05 + u * 0.12, 4 + Math.cos(k * 1.7) * 0.4); b.scale.setScalar(1 - u); });
    const sp = t - 3.45; A.riverSplash.root.visible = on && sp > 0 && sp < 0.6; A.riverSplash.set({ t: sp / 0.6 }); A.riverSplash.root.position.set(2.6, -0.3, 4.3);
  }
  // ---------------- hall: "nakaupo sila sa gobyerno"
  {
    const c = A.sitCroc; const on = id === "hall_wide";
    c.root.visible = on; A.chair.visible = on || id === "barong" || id === "grin";
    const sitT = 5.2;
    const sat = t > sitT;
    const plop = t - sitT;
    c.root.position.set(0, sat ? 0 : 0.25 * Math.sin(clamp((t - 4.96) / 0.24) * Math.PI), sat ? 1.62 : 1.9);
    c.set({
      pose: sat ? "sit" : "stand", expr: sat && t > 5.6 ? "smug" : "grin", blink: blink(t, 6),
      armL: sat ? 0.75 : 0.5, armR: sat ? 0.75 : 0.5, wag: t * 3,
      squash: sat ? 0.18 * Math.exp(-plop * 7) * Math.cos(plop * 20) : -0.08,
      lean: sat ? -0.05 + Math.sin(t * 1.4) * 0.02 : 0,
    });
    if (id === "barong" || id === "grin") A.chair.position.set(0, 0, 1.2); // background prop
  }
  // ---------------- Pandi sign: the croc stamps "95% COMPLETE"
  {
    const c = A.stampCroc; const on = id === "sign";
    c.root.visible = on; H.cal.visible = !on;
    const up = ease(t, 33.7, 34.3), down = ease(t, 34.38, 34.52);
    c.set({ expr: t > 34.52 ? "happy" : "grin", hold: "stamp", armR: 0.4 + up * 2.3 - down * 1.3, armL: 0.25, blink: blink(t, 8), wag: t * 3, look: -0.6,
      squash: t > 34.52 && t < 34.8 ? 0.1 * Math.sin((t - 34.52) / 0.28 * Math.PI) : 0, lean: up * 0.1 - down * 0.18 });
  }
  // ---------------- flooded street: real swimming strokes + splashes
  A.splashes.forEach((s, k) => { const u = ((t * 1.6 + k * 0.37) % 1); s.root.visible = id === "swim" || id === "suv"; s.set({ t: u }); });
  {
    const on = id === "suv"; A.suvSplash.root.visible = on;
    if (on) { A.suvSplash.root.position.set(H.suv.position.x, 0.9, H.suv.position.z + 2.6); A.suvSplash.set({ t: (t * 2.2) % 1 }); }
  }
  // ---------------- money rain on "545 billion"
  A.bills.forEach((b, k) => {
    const r = rnd(k + 3); const x0 = (r() - 0.5) * 6, z0 = (r() - 0.5) * 4; const t0 = 19.95 + r() * 1.6;
    const u = t - t0; b.visible = id === "money_big" && u > 0 && u < 2.0;
    b.position.set(x0 + Math.sin(u * 3 + k) * 0.5, 9 - u * 4.5, z0); b.rotation.set(u * 4 + k, u * 3, u * 2 + k);
  });
  // ---------------- ballot: magnifier scans the names, stops on BUWAYA
  {
    const on = id === "ballot"; A.mag.visible = on;
    const zOf = (i) => 0.1 - (0.65 - (280 + i * 92) / 1000);
    const u = ease(t, 67.5, 70.2);
    const z = zOf(9) + (zOf(2) - zOf(9)) * u + (t > 70.2 ? Math.sin((t - 70.2) * 18) * 0.006 : 0);
    A.mag.position.set(-0.42 + Math.sin(t * 2.2) * 0.04 * (1 - u), 1.09, z);
  }
  {
    const on = id === "tail"; A.tail.visible = on;
    const out = ease(t, 71.15, 71.7);
    A.tail.rotation.y = 1.5 - out * 2.05;
    A.tailSegs.forEach((s, k) => { s.rotation.y = Math.sin(t * 8 - k * 0.65) * 0.25 * out; });
    A.bang.root.visible = on && t > 71.38; A.bang.set({ t: t - 71.38 });
  }
}
