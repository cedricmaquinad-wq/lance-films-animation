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
const CROC = { kind: "person", skin: "#d9a477", shirt: "#2f7fd8", pants: "#3a4a7a", hair: "#1d1716", hat: "cap", capCol: "#e24b4b", expr: "shock", hold: "ricebag", armR: 0.9, thumbL: true, armL: 2.0 };
window.makeThumb = async (frame, wide) => {
  await window.initDone;
  const bg = await load(window.renderAt(frame, { captions: false, q: 0.95 }));
  const W = wide ? 1280 : 1080, Hh = wide ? 720 : 1920;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = Hh; const c = cv.getContext("2d");
  if (wide) c.drawImage(bg, 0, 640, 1080, 608, 0, 0, W, Hh); else c.drawImage(bg, 0, 0);
  // punchy grade + vignette
  const g = c.createRadialGradient(W / 2, Hh * 0.55, Hh * 0.2, W / 2, Hh * 0.55, Hh * 0.85); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,5,20,0.55)");
  c.fillStyle = g; c.fillRect(0, 0, W, Hh);
  const cr = croc(0, CROC);
  if (!wide) {
    c.drawImage(cr, 30, 640, 1020, 1620);
    text(c, "₱20 NA BIGAS", W / 2, 230, 160, "#ffffff", -0.05);
    text(c, "PARA SA LAHAT?!", W / 2, 410, 128, "#ffd93b", -0.05);
    sticker(c, "₱46 → ₱20?", 290, 1480, 80, -0.12);
  } else {
    c.drawImage(cr, 690, 20, 560, 890);
    text(c, "₱20 NA BIGAS", 380, 200, 112, "#ffffff", -0.05, 24);
    text(c, "PARA SA LAHAT?!", 390, 335, 92, "#ffd93b", -0.05, 22);
    sticker(c, "₱46 → ₱20?", 330, 560, 62, -0.08);
  }
  return cv.toDataURL("image/jpeg", 0.93);
};
