import "./main.js";
import { drawChar } from "./toon.js";
const load = (src) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = src; });
function croc(scaleH, opts) {
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 1000; drawChar(cv.getContext("2d"), opts);
  // white sticker outline around the character
  const out = document.createElement("canvas"); out.width = 680; out.height = 1080; const o = out.getContext("2d");
  const tint = document.createElement("canvas"); tint.width = 600; tint.height = 1000; const t = tint.getContext("2d");
  t.drawImage(cv, 0, 0); t.globalCompositeOperation = "source-in"; t.fillStyle = "#fff"; t.fillRect(0, 0, 600, 1000);
  for (let a = 0; a < 24; a++) o.drawImage(tint, 40 + Math.cos(a / 24 * 6.283) * 16, 40 + Math.sin(a / 24 * 6.283) * 16);
  o.drawImage(cv, 40, 40);
  return out;
}
function text(c, s, x, y, size, fill, rot = -0.04, stroke = 30) {
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `400 ${size}px 'Luckiest Guy'`; c.textAlign = "center"; c.textBaseline = "middle";
  c.lineJoin = "round"; c.lineWidth = stroke * 1.6; c.strokeStyle = "rgba(0,0,0,0.35)"; c.strokeText(s, 8, 12);
  c.lineWidth = stroke; c.strokeStyle = "#0b0a0c"; c.strokeText(s, 0, 0); c.fillStyle = fill; c.fillText(s, 0, 0); c.restore();
}
function sticker(c, s, x, y, size, rot) {
  c.save(); c.translate(x, y); c.rotate(rot); c.font = `400 ${size}px 'Luckiest Guy'`; const w = c.measureText(s).width + size * 0.8;
  c.fillStyle = "#d4202a"; c.strokeStyle = "#0b0a0c"; c.lineWidth = 12; c.beginPath(); c.roundRect(-w / 2, -size * 0.75, w, size * 1.5, 24); c.fill(); c.stroke();
  c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText(s, 0, size * 0.06); c.restore();
}
const CROC = { kind: "croc", shirt: "#f4eedc", barong: true, pants: "#1f1f26", expr: "grin", shades: 1, hold: "moneybag", armR: 0.55, thumbL: true, armL: 2.0, wag: 1.2, sparkle: 0.5 };
window.makeThumb = async (frame, wide) => {
  await window.initDone;
  const bg = await load(window.renderAt(frame, { captions: false, q: 0.95 }));
  const W = wide ? 1280 : 1080, Hh = wide ? 720 : 1920;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = Hh; const c = cv.getContext("2d");
  if (wide) c.drawImage(bg, 0, 430, 1080, 608, 0, 0, W, Hh); else c.drawImage(bg, 0, 0);
  // punchy grade + vignette
  const g = c.createRadialGradient(W / 2, Hh * 0.55, Hh * 0.2, W / 2, Hh * 0.55, Hh * 0.85); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,5,20,0.55)");
  c.fillStyle = g; c.fillRect(0, 0, W, Hh);
  const cr = croc(0, CROC);
  if (!wide) {
    c.drawImage(cr, 30, 640, 1020, 1620);
    text(c, "MAY BUWAYA", W / 2, 230, 170, "#ffffff", -0.05);
    text(c, "SA GOBYERNO?!", W / 2, 420, 150, "#ffd93b", -0.05);
    sticker(c, "₱545 BILLION", 300, 1450, 74, -0.12);
  } else {
    c.drawImage(cr, 690, 20, 560, 890);
    text(c, "MAY BUWAYA", 380, 200, 118, "#ffffff", -0.05, 24);
    text(c, "SA GOBYERNO?!", 390, 340, 104, "#ffd93b", -0.05, 22);
    sticker(c, "₱545 BILLION", 330, 560, 60, -0.08);
  }
  return cv.toDataURL("image/jpeg", 0.93);
};
