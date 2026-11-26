// Animated "Pa-follow naman" outro: redrawn Lance Films page, follower counter rolling to a joke 999B, croc presses Follow.
import { drawChar } from "./toon.js";

const W = 1080, H = 1920, FPS = 30;
export const OUTRO_DUR = 6.5;
const cv = document.createElement("canvas"); cv.width = W; cv.height = H; const c = cv.getContext("2d");
const chCv = document.createElement("canvas"); chCv.width = 600; chCv.height = 1000; const ch = chCv.getContext("2d");
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ss = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
const back = (x) => { x = clamp(x); const s = 1.9; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); }; // overshoot
const FB = "#0866ff";

function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function txt(s, x, y, size, color, weight = 800, align = "left", font = "Baloo") { c.font = `${weight} ${size}px '${font}'`; c.textAlign = align; c.textBaseline = "alphabetic"; c.fillStyle = color; c.fillText(s, x, y); }
function star(x, y, r, col) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.closePath(); c.fillStyle = col; c.fill(); }

function logo(cx, cy, R) {
  c.save(); c.translate(cx, cy); c.scale(R / 250, R / 250);
  c.beginPath(); c.arc(0, 0, 250, 0, 7); c.fillStyle = "#fff"; c.fill();
  const g = c.createRadialGradient(0, -40, 20, 0, 0, 236); g.addColorStop(0, "#2a52c9"); g.addColorStop(1, "#0b1d6e");
  c.beginPath(); c.arc(0, 0, 236, 0, 7); c.fillStyle = g; c.fill();
  c.fillStyle = "#e9eefc"; for (let i = 0; i < 64; i++) { const a = i / 64 * Math.PI * 2; c.save(); c.translate(Math.cos(a) * 210, Math.sin(a) * 210); c.rotate(a); c.fillRect(-4, -4, 8, 8); c.restore(); }
  c.beginPath(); c.arc(0, 0, 188, 0, 7); c.lineWidth = 4; c.strokeStyle = "#d4a84b"; c.stroke();
  // clapperboard
  c.fillStyle = "#fff"; rr(-72, -122, 144, 78, 6); c.fill();
  c.save(); c.translate(-72, -128); c.rotate(-0.16); c.fillStyle = "#fff"; c.fillRect(0, -24, 144, 24); c.fillStyle = "#13235f"; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(8 + k * 24, -24); c.lineTo(20 + k * 24, -24); c.lineTo(12 + k * 24, 0); c.lineTo(0 + k * 24, 0); c.closePath(); c.fill(); } c.restore();
  c.fillStyle = "#13235f"; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-64 + k * 24, -122); c.lineTo(-52 + k * 24, -122); c.lineTo(-60 + k * 24, -104); c.lineTo(-72 + k * 24, -104); c.closePath(); c.fill(); }
  c.beginPath(); c.moveTo(-10, -92); c.lineTo(18, -76); c.lineTo(-10, -60); c.closePath(); c.fillStyle = "#f1b32c"; c.fill();
  txt("LANCE", 0, 40, 116, "#ffffff", 800, "center");
  c.font = "700 44px Baloo"; c.textAlign = "center"; c.fillStyle = "#f1b32c";
  const F = "F I L M S"; c.fillText(F, 0, 98);
  c.strokeStyle = "#f1b32c"; c.lineWidth = 4; c.beginPath(); c.moveTo(-150, 84); c.lineTo(-80, 84); c.moveTo(80, 84); c.lineTo(150, 84); c.stroke();
  star(-36, 145, 12, "#f1b32c"); star(0, 140, 18, "#f1b32c"); star(36, 145, 12, "#f1b32c");
  c.restore();
}

const STEPS = ["3.4K", "3.9K", "8.7K", "25K", "120K", "870K", "4.2M", "31M", "250M", "1.7B", "40B", "380B", "999B"];
function followers(t) { return { s: "965.5M", roll: 0 }; }
let confetti = null;
function confettiInit() { const out = []; let s = 7; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let k = 0; k < 140; k++) out.push({ x: 140 + r() * 520, y: 1350, vx: (r() - 0.5) * 1700, vy: -600 - r() * 1700, rot: r() * 6, vr: (r() - 0.5) * 18, col: ["#f1b32c", "#0866ff", "#e24b4b", "#3aa76d", "#ffffff", "#8a5cc9"][k % 6], w: 14 + r() * 14 }); return out; }

export function outroFrame(f) {
  const t = f / FPS;
  confetti = confetti || confettiInit();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H);
  // page slides up
  const inU = back(t / 0.55);
  c.save(); c.translate(0, (1 - inU) * 500); c.globalAlpha = clamp(t / 0.25);
  // top bar
  c.strokeStyle = "#111"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(48, 70); c.lineTo(92, 114); c.moveTo(92, 70); c.lineTo(48, 114); c.stroke();
  txt("Lance Films", W / 2, 110, 48, "#111", 700, "center");
  // cover
  const cg = c.createLinearGradient(0, 180, 0, 800); cg.addColorStop(0, "#4f5054"); cg.addColorStop(1, "#8e8f94"); c.fillStyle = cg; c.fillRect(0, 180, W, 620);
  // big call-to-action text on the cover
  const ctaU = back((t - 0.15) / 0.4);
  c.save(); c.translate(W / 2, 330); c.rotate(-0.04 + Math.sin(t * 3) * 0.01); c.scale(ctaU, ctaU);
  c.font = "400 128px 'Luckiest Guy'"; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
  c.lineWidth = 26; c.strokeStyle = "#0b0a0c"; c.strokeText("PA-FOLLOW", 0, -70); c.fillStyle = "#fff"; c.fillText("PA-FOLLOW", 0, -70);
  c.strokeText("NAMAN!", 0, 60); c.fillStyle = "#ffd93b"; c.fillText("NAMAN!", 0, 60);
  c.restore();
  const subU = clamp((t - 0.9) / 0.3);
  c.globalAlpha = Math.min(c.globalAlpha, 1) * subU;
  c.font = "800 46px Baloo"; c.textAlign = "center"; c.lineWidth = 12; c.strokeStyle = "#0b0a0c";
  for (const [s, y] of [["Para updated ka pa sa mga susunod", 470], ["na videos ko. SALAMAT!", 528]]) { c.strokeText(s, W / 2, y); c.fillStyle = "#fff"; c.fillText(s, W / 2, y); }
  c.globalAlpha = clamp(t / 0.25);
  // logo (pop)
  const lp = back((t - 0.15) / 0.45);
  logo(300, 800, 255 * lp);
  // name + followers
  txt("Lance Films", 50, 1150, 104, "#111", 800);
  const fo = followers(t);
  const land = 0;
  const big = fo.roll ? 1.25 : 1 + land * 0.5;
  c.save(); c.translate(50, 1240);
  if (fo.roll) c.translate((Math.random() - 0.5) * 0, Math.sin(t * 60) * 4);
  c.scale(big, big);
  c.font = "800 56px Baloo"; c.textAlign = "left";
  const numCol = "#111";
  c.fillStyle = numCol; c.fillText(fo.s, 0, 0);
  const w1 = c.measureText(fo.s).width;
  c.font = "600 52px Baloo"; c.fillStyle = "#444"; c.fillText(" followers  •  ", w1, 0);
  const w2 = c.measureText(" followers  •  ").width;
  c.font = "800 52px Baloo"; c.fillStyle = "#111"; c.fillText("0", w1 + w2, 0);
  const w3 = c.measureText("0").width; c.font = "600 52px Baloo"; c.fillStyle = "#444"; c.fillText(" following", w1 + w2 + w3, 0);
  c.restore();
  // burst behind number when it lands
  if (false) { const u = 0; c.save(); c.translate(150, 1225); c.strokeStyle = `rgba(241,179,44,${1 - u})`; c.lineWidth = 10; for (let k = 0; k < 14; k++) { const a = k / 14 * 6.283; c.beginPath(); c.moveTo(Math.cos(a) * (90 + u * 120), Math.sin(a) * (60 + u * 80)); c.lineTo(Math.cos(a) * (140 + u * 200), Math.sin(a) * (95 + u * 130)); c.stroke(); } c.restore(); }
  // Follow button (pressed at 4.1 -> Following)
  const press = t > 4.05 && t < 4.3 ? 0.93 : 1;
  const following = t > 4.15;
  c.save(); c.translate(475, 1365); c.scale(press, press); c.translate(-475, -1365);
  rr(50, 1300, 850, 130, 26); c.fillStyle = following ? "#e4e6eb" : FB; c.fill();
  const lbl = following ? "✓  Following" : "Follow";
  if (!following) { c.fillStyle = "#fff"; rr(355, 1340, 54, 50, 10); c.fill(); c.fillStyle = FB; c.font = "800 44px Baloo"; c.textAlign = "center"; c.fillText("+", 382, 1382); }
  txt(lbl, following ? 475 : 520, 1385, 58, following ? "#111" : "#fff", 800, "center");
  c.restore();
  rr(930, 1300, 100, 130, 26); c.fillStyle = "#e4e6eb"; c.fill(); txt("···", 980, 1378, 58, "#111", 800, "center");
  // tabs
  c.fillStyle = "#e7f0ff"; rr(40, 1500, 180, 90, 45); c.fill();
  txt("Posts", 130, 1560, 46, FB, 700, "center"); txt("About", 330, 1560, 46, "#111", 700, "center"); txt("Photos", 540, 1560, 46, "#111", 700, "center"); txt("More ▾", 770, 1560, 46, "#111", 700, "center");
  c.fillStyle = "#e4e6eb"; c.fillRect(0, 1470, W, 6);
  txt("Details", 50, 1690, 52, "#111", 800);
  txt("Page · Digital creator", 120, 1790, 46, "#222", 600);
  c.fillStyle = "#555"; rr(50, 1752, 46, 40, 6); c.fill();
  c.restore();
  // croc walks in, presses Follow, thumbs up
  const walkIn = ss((t - 1.6) / 1.2);
  if (t > 1.5) {
    const x = 1300 - walkIn * 440 + ss((t - 4.35) / 0.4) * 150;
    const pressing = t > 3.8 && t < 4.4;
    const after = t > 4.4;
    drawChar(ch, { kind: "croc", shirt: "#f4eedc", barong: true, pants: "#1f1f26", expr: t > 4.15 ? "happy" : "grin", shades: after ? Math.min(1, (t - 4.6) / 0.3) : 0,
      walk: walkIn < 1 ? t * 9 : 0, wag: t * 4, look: -1, armL: pressing ? 1.5 + ss((t - 3.8) / 0.25) * 0.35 : after ? 0.3 : 0.25 + Math.sin(t * 9) * 0.15 * (walkIn < 1),
      armR: after ? 2.0 : 0.3, thumbR: after, sparkle: t > 4.5 && t < 5.2 ? (t - 4.5) / 0.7 : 0, blink: (t % 2.1) < 0.1 ? 1 : 0 });
    c.save(); c.translate(x, 960); const sc = 1.0; c.scale(-sc, sc); // mirrored: snout points left toward the button
    c.drawImage(chCv, -300, 0); c.restore();
  }
  // confetti after landing on 999B
  if (t > 4.15) {
    const u = t - 4.15;
    for (const p of confetti) {
      const x = p.x + p.vx * u * 0.6, y = p.y + p.vy * u * 0.6 + 900 * u * u;
      if (y > H + 50) continue;
      c.save(); c.translate(x, y); c.rotate(p.rot + p.vr * u); c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.w / 4, p.w, p.w / 2); c.restore();
    }
  }
  // white flash on landing + fade out
  if (t > 4.15 && t < 4.35) { c.fillStyle = `rgba(255,255,255,${0.6 * (1 - (t - 4.15) / 0.2)})`; c.fillRect(0, 0, W, H); }
  if (t > OUTRO_DUR - 0.35) { c.fillStyle = `rgba(0,0,0,${(t - (OUTRO_DUR - 0.35)) / 0.35})`; c.fillRect(0, 0, W, H); }
  return cv.toDataURL("image/jpeg", 0.94);
}

window.outroInit = (async () => {
  for (const [f, u, w] of [["Baloo", "fonts/baloo-800.woff2", "800"], ["Baloo", "fonts/baloo-700.woff2", "700"], ["Baloo", "fonts/baloo-700.woff2", "600"], ["Luckiest Guy", "fonts/luckiest.woff2", "400"]]) { const ff = new FontFace(f, `url(${u})`, { weight: w }); await ff.load(); document.fonts.add(ff); }
  return true;
})();
window.outroFrame = outroFrame;
window.OUTRO_DUR = OUTRO_DUR;
