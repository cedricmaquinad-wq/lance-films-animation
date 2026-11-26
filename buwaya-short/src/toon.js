// 2D cartoon characters drawn with Canvas2D on a 600x1000 card (feet at y=975), plum ink, bean heads, stick limbs.
export const INK = "#241726";
export const CW = 600, CH = 1000, FEET = 975;
const LW = 9; // outline width on the card

const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0;
  return `rgb(${r},${g},${b})`;
};

function ln(c, x1, y1, x2, y2, w, col = INK) {
  c.strokeStyle = col; c.lineWidth = w; c.lineCap = "round";
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
}
function dot(c, x, y, r, fill, stroke = INK, lw = LW * 0.7) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill();
  if (stroke) { c.lineWidth = lw; c.strokeStyle = stroke; c.stroke(); }
}
function fillStroke(c, fill, lw = LW) { c.fillStyle = fill; c.fill(); c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = "round"; c.stroke(); }

// bean head: pointier crown, narrower chin (h/w ~0.94)
function beanPath(c, cx, cy, w, h) {
  const hw = w / 2, hh = h / 2;
  c.beginPath();
  c.moveTo(cx, cy - hh);
  c.bezierCurveTo(cx + hw * 0.62, cy - hh * 1.02, cx + hw * 1.04, cy - hh * 0.45, cx + hw, cy + hh * 0.05);
  c.bezierCurveTo(cx + hw * 0.96, cy + hh * 0.62, cx + hw * 0.55, cy + hh * 1.0, cx, cy + hh);
  c.bezierCurveTo(cx - hw * 0.55, cy + hh * 1.0, cx - hw * 0.96, cy + hh * 0.62, cx - hw, cy + hh * 0.05);
  c.bezierCurveTo(cx - hw * 1.04, cy - hh * 0.45, cx - hw * 0.62, cy - hh * 1.02, cx, cy - hh);
  c.closePath();
}

// ---------------------------------------------------------------- faces
function eyes(c, cx, cy, sep, size, expr, blink, look = 0) {
  for (const s of [-1, 1]) {
    const x = cx + s * sep / 2, y = cy;
    if (blink > 0.5 || expr === "smug" && false) { ln(c, x - size * 0.8, y, x + size * 0.8, y, 7); continue; }
    let ew = size * 0.78, eh = size;
    if (expr === "shock") { ew *= 1.25; eh *= 1.3; }
    if (expr === "happy") { // closed happy arcs
      c.strokeStyle = INK; c.lineWidth = 8; c.lineCap = "round";
      c.beginPath(); c.arc(x, y + 6, ew * 0.8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); continue;
    }
    c.beginPath(); c.ellipse(x, y, ew, eh, 0, 0, Math.PI * 2); fillStroke(c, "#ffffff", 6);
    const pr = expr === "shock" ? size * 0.28 : size * 0.42;
    c.beginPath(); c.ellipse(x + look * ew * 0.35, y + (expr === "smug" ? eh * 0.25 : eh * 0.08), pr, pr * 1.15, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    if (expr === "smug" || expr === "sly") { // heavy lids
      c.save(); c.beginPath(); c.ellipse(x, y, ew + 2, eh + 2, 0, 0, Math.PI * 2); c.clip();
      c.fillStyle = c._skin || "#f1c9a0"; c.fillRect(x - ew - 4, y - eh - 4, ew * 2 + 8, eh * 1.0 + 2);
      c.restore(); ln(c, x - ew, y - 2, x + ew, y - 2, 7);
    }
  }
}
function brows(c, cx, cy, sep, expr) {
  const k = { angry: 0.35, shock: -0.25, sad: -0.3, smug: 0.12, sly: 0.2 }[expr] || 0;
  const lift = expr === "shock" ? -16 : 0;
  for (const s of [-1, 1]) {
    const yi = cy + lift + k * 22, yo = cy + lift - k * 14; // inner end lower when angry
    const xi = cx + s * (sep / 2 - 24), xo = cx + s * (sep / 2 + 26);
    ln(c, xi, yi, xo, yo, 9);
  }
}
function mouth(c, cx, cy, w, expr, open = 0) {
  c.lineCap = "round"; c.strokeStyle = INK; c.lineWidth = 8;
  if (expr === "shock" || open > 0.5) {
    c.beginPath(); c.ellipse(cx, cy + 6, w * 0.22, w * (expr === "shock" ? 0.3 : 0.18 + 0.1 * open), 0, 0, Math.PI * 2); fillStroke(c, "#5a1f2a", 7);
    return;
  }
  if (expr === "smile" || expr === "happy") { c.beginPath(); c.arc(cx, cy - w * 0.25, w * 0.42, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); return; }
  if (expr === "grin") {
    c.beginPath(); c.moveTo(cx - w * 0.45, cy - 4); c.quadraticCurveTo(cx, cy + w * 0.55, cx + w * 0.45, cy - 4); c.closePath(); fillStroke(c, "#ffffff", 7);
    return;
  }
  if (expr === "sad") { c.beginPath(); c.arc(cx, cy + w * 0.35, w * 0.32, Math.PI * 1.2, Math.PI * 1.8); c.stroke(); return; }
  if (expr === "angry") { ln(c, cx - w * 0.3, cy + 6, cx + w * 0.3, cy + 2, 8); return; }
  if (expr === "smug" || expr === "sly") { c.beginPath(); c.moveTo(cx - w * 0.3, cy + 4); c.quadraticCurveTo(cx + w * 0.1, cy + 16, cx + w * 0.38, cy - 8); c.stroke(); return; }
  ln(c, cx - w * 0.22, cy + 4, cx + w * 0.22, cy + 4, 8); // neutral
}

// ---------------------------------------------------------------- body parts
const ARM = 205, LEG = 250;
// arm angle: 0 = straight down, + = outward (away from body), in radians
function arm(c, sx, sy, side, ang, skin, sleeve, len = ARM, sleeveFrac = 0.42) {
  const a = side * ang;
  const ex = sx + Math.sin(a) * len, ey = sy + Math.cos(a) * len;
  const mx = sx + Math.sin(a) * len * sleeveFrac, my = sy + Math.cos(a) * len * sleeveFrac;
  if (sleeve) { ln(c, sx, sy, mx, my, 40, INK); ln(c, sx, sy, mx, my, 40 - LW * 1.6, sleeve); }
  ln(c, mx, my, ex, ey, 15, INK);
  dot(c, ex, ey, 15, skin, INK, 6);
  return [ex, ey];
}
function legs(c, hipY, walk, pants, shoes, spread = 34, short = false) {
  const sw = Math.sin(walk) * 0.38;
  for (const s of [-1, 1]) {
    const a = s * sw;
    const hx = 300 + s * spread;
    const fx = hx + Math.sin(a) * LEG + s * 6, fy = Math.min(FEET - 10, hipY + Math.cos(a) * LEG);
    const lift = Math.max(0, -Math.cos(walk + (s > 0 ? 0 : Math.PI))) * 14;
    if (short) { ln(c, hx, hipY, hx + (fx - hx) * 0.35, hipY + (fy - hipY) * 0.35, 46, INK); ln(c, hx, hipY, hx + (fx - hx) * 0.35, hipY + (fy - hipY) * 0.35, 46 - LW * 1.6, pants); ln(c, hx + (fx - hx) * 0.3, hipY + (fy - hipY) * 0.3, fx, fy - lift, 15, INK); }
    else { ln(c, hx, hipY, fx, fy - lift, 34, INK); ln(c, hx, hipY, fx, fy - lift, 34 - LW * 1.6, pants); }
    c.beginPath(); c.ellipse(fx + s * 12, fy - lift + 6, 30, 15, 0, 0, Math.PI * 2); fillStroke(c, shoes, 6);
  }
}
function torso(c, top, bot, wTop, wBot, fill) {
  c.beginPath();
  c.moveTo(300 - wTop / 2, top + 18); c.quadraticCurveTo(300 - wTop / 2, top, 300 - wTop / 2 + 24, top);
  c.lineTo(300 + wTop / 2 - 24, top); c.quadraticCurveTo(300 + wTop / 2, top, 300 + wTop / 2, top + 18);
  c.lineTo(300 + wBot / 2, bot); c.lineTo(300 - wBot / 2, bot); c.closePath();
  fillStroke(c, fill);
}

// ---------------------------------------------------------------- characters
// opts: {kind, pose: stand|sit|swim, skin, shirt, pants, shoes, hair, expr, blink, walk, armL, armR, talk, look,
//        hold: briefcase|stamp|magnifier|moneybag, thumbR, wag, jaw, laugh, collar}
const CROC_G = "#4f9a3a", CROC_D = "#3b7a2c", CROC_BELLY = "#d9e8a3";
function crocTail(c, hipY, wag, G) {
  // thick tapering tail out to the right, resting on the ground, with ridge spikes
  const pts = [];
  for (let i = 0; i <= 14; i++) {
    const u = i / 14;
    const x = 330 + u * 250;
    const y = hipY + 60 + u * (FEET - hipY - 110) + Math.sin(u * 3 + wag) * 18 * u - Math.sin(u * Math.PI) * 30;
    pts.push([x, y, 52 * (1 - u * 0.88)]);
  }
  c.beginPath();
  pts.forEach(([x, y, r], i) => (i ? c.lineTo(x, y - r) : c.moveTo(x, y - r)));
  for (let i = pts.length - 1; i >= 0; i--) { const [x, y, r] = pts[i]; c.lineTo(x, y + r * 0.8); }
  c.closePath(); fillStroke(c, G);
  // belly stripe
  c.save(); c.clip();
  c.beginPath(); pts.forEach(([x, y, r], i) => (i ? c.lineTo(x, y + r * 0.25) : c.moveTo(x, y + r * 0.25))); for (let i = pts.length - 1; i >= 0; i--) { const [x, y, r] = pts[i]; c.lineTo(x, y + r * 0.85); } c.closePath(); c.fillStyle = CROC_BELLY; c.fill();
  c.restore();
  // spikes
  for (let i = 1; i < 13; i += 1) { const [x, y, r] = pts[i]; c.beginPath(); c.moveTo(x - 9, y - r + 2); c.lineTo(x, y - r - 16 * (1 - i / 14)); c.lineTo(x + 9, y - r + 2); c.closePath(); fillStroke(c, CROC_D, 4); }
}
function crocFoot(c, x, y, s, G) {
  c.beginPath(); c.ellipse(x + s * 10, y + 2, 36, 18, 0, 0, Math.PI * 2); fillStroke(c, G, 6);
  for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(x + s * 30 + k * 12 - 5, y + 12); c.lineTo(x + s * 34 + k * 12, y + 26); c.lineTo(x + s * 30 + k * 12 + 5, y + 12); c.closePath(); fillStroke(c, "#f6f2dc", 3); }
}
function hand(c, x, y, skin, croc, thumb = false, ang = 0) {
  if (thumb) { // fist + thumb up
    c.beginPath(); c.ellipse(x, y, 20, 17, 0, 0, Math.PI * 2); fillStroke(c, skin, 6);
    c.beginPath(); c.ellipse(x - 4, y - 26, 8, 16, -0.15, 0, Math.PI * 2); fillStroke(c, skin, 5);
    return;
  }
  dot(c, x, y, croc ? 19 : 15, skin, INK, 6);
  if (croc) for (let k = -1; k <= 1; k++) { const a = ang + k * 0.5; c.beginPath(); c.moveTo(x + Math.sin(a) * 14 - 4, y + Math.cos(a) * 14); c.lineTo(x + Math.sin(a) * 28, y + Math.cos(a) * 28); c.lineTo(x + Math.sin(a) * 14 + 4, y + Math.cos(a) * 14); c.closePath(); fillStroke(c, "#f6f2dc", 3); }
}
function prop(c, kind, x, y) {
  if (kind === "briefcase") {
    c.beginPath(); c.moveTo(x - 20, y + 10); c.quadraticCurveTo(x, y - 12, x + 20, y + 10); c.lineWidth = 8; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.roundRect(x - 62, y + 10, 124, 86, 10); fillStroke(c, "#7a4a24", 8);
    c.fillStyle = "#f2c230"; c.fillRect(x - 8, y + 30, 16, 12);
  } else if (kind === "stamp") {
    c.beginPath(); c.roundRect(x - 14, y - 70, 28, 70, 10); fillStroke(c, "#8a5a32", 7);
    c.beginPath(); c.ellipse(x, y - 78, 22, 16, 0, 0, Math.PI * 2); fillStroke(c, "#8a5a32", 7);
    c.beginPath(); c.roundRect(x - 50, y, 100, 34, 6); fillStroke(c, "#d4202a", 7);
  } else if (kind === "magnifier") {
    ln(c, x, y, x + 40, y + 60, 16);
    c.beginPath(); c.arc(x - 30, y - 45, 52, 0, Math.PI * 2); c.fillStyle = "rgba(200,230,255,0.45)"; c.fill(); c.lineWidth = 12; c.strokeStyle = INK; c.stroke();
  } else if (kind === "moneybag") {
    c.beginPath(); c.moveTo(x - 20, y); c.quadraticCurveTo(x - 80, y + 40, x - 60, y + 110); c.lineTo(x + 60, y + 110); c.quadraticCurveTo(x + 80, y + 40, x + 20, y); c.closePath(); fillStroke(c, "#c9a46a", 8);
    c.font = "900 60px 'Luckiest Guy'"; c.textAlign = "center"; c.fillStyle = "#3a7a2a"; c.fillText("₱", x, y + 92);
  }
}

export function drawChar(c, o) {
  c.clearRect(0, 0, CW, CH);
  c.save();
  if (o.flip) { c.translate(CW, 0); c.scale(-1, 1); }
  const kind = o.kind || "person";
  if (kind === "ghost") { drawGhost(c, o); c.restore(); return; }
  const croc = kind === "croc";
  const G = o.croc || CROC_G;
  const skin = croc ? G : (o.skin || "#e9b68a");
  c._skin = skin;
  const pose = o.pose || "stand";
  const headH = croc ? 250 : 270, headW = croc ? 300 : 254;
  const sitDrop = pose === "sit" ? 95 : 0;
  const bodyTop = 470 + sitDrop, hip = FEET - LEG - 10 + sitDrop;
  const walk = o.walk || 0;
  const bob = Math.abs(Math.sin(walk)) * 10 + (o.laugh ? Math.abs(Math.sin(o.laugh * 14)) * 10 : 0);
  c.translate(0, -bob);
  // tail first (behind everything)
  if (croc && pose !== "swim") crocTail(c, hip, o.wag || 0, G);
  // legs
  if (pose === "sit") {
    for (const s of [-1, 1]) {
      const hx = 300 + s * 40, kx = 300 + s * 58, ky = hip + 70, fx = 300 + s * 64, fy = FEET - 10;
      ln(c, hx, hip, kx, ky, 38, INK); ln(c, hx, hip, kx, ky, 38 - LW * 1.6, o.pants || "#3a4a7a");
      ln(c, kx, ky, fx, fy - 18, 34, INK); ln(c, kx, ky, fx, fy - 18, 34 - LW * 1.6, o.pants || "#3a4a7a");
      c.beginPath(); c.ellipse(kx, ky, 26, 20, 0, 0, Math.PI * 2); fillStroke(c, o.pants || "#3a4a7a", 6);
      if (croc) crocFoot(c, fx, fy - 6, s, G); else { c.beginPath(); c.ellipse(fx + s * 12, fy - 4, 30, 15, 0, 0, Math.PI * 2); fillStroke(c, o.shoes || "#3a2a22", 6); }
    }
  } else if (pose !== "swim") {
    if (o.robe) {
      c.beginPath(); c.moveTo(300 - 86, bodyTop + 10); c.lineTo(300 + 86, bodyTop + 10); c.lineTo(300 + 128, FEET - 40); c.lineTo(300 - 128, FEET - 40); c.closePath();
      legs(c, FEET - 110, walk * 0.6, o.pants || "#2b2b33", o.shoes || "#2a1f1c", 40, true);
      fillStroke(c, o.robe);
    } else if (croc) {
      const sw = Math.sin(walk) * 0.38;
      for (const s of [-1, 1]) {
        const a = s * sw, hx = 300 + s * 40;
        const fx = hx + Math.sin(a) * LEG + s * 6, fy = Math.min(FEET - 14, hip + Math.cos(a) * LEG);
        const lift = Math.max(0, -Math.cos(walk + (s > 0 ? 0 : Math.PI))) * 14;
        ln(c, hx, hip, fx, fy - lift - 10, 40, INK); ln(c, hx, hip, fx, fy - lift - 10, 40 - LW * 1.6, o.pants || "#23232b");
        crocFoot(c, fx, fy - lift, s, G);
      }
    } else legs(c, hip, walk, o.pants || "#3a4a7a", o.shoes || "#3a2a22", 36);
  }
  const shirt = o.shirt || "#e24b4b";
  const tw = croc ? 220 : 196, bw = croc ? 214 : 176;
  if (!o.robe) torso(c, bodyTop, hip + 18, tw, bw, shirt);
  if (croc) { // green neck in the open collar
    c.beginPath(); c.moveTo(270, bodyTop); c.lineTo(330, bodyTop); c.lineTo(300, bodyTop + 54); c.closePath(); fillStroke(c, CROC_BELLY, 6);
  }
  if (o.barong) {
    c.save(); c.beginPath(); c.moveTo(300 - tw / 2 + 4, bodyTop + 8); c.lineTo(300 + tw / 2 - 4, bodyTop + 8); c.lineTo(300 + bw / 2 - 8, hip + 14); c.lineTo(300 - bw / 2 + 8, hip + 14); c.clip();
    c.strokeStyle = "rgba(150,120,70,0.55)"; c.lineWidth = 4;
    for (let x = -75; x <= 75; x += 30) { if (Math.abs(x) < 20) continue; c.beginPath(); for (let y = bodyTop + 30; y < hip; y += 16) { c.moveTo(300 + x - 8, y); c.quadraticCurveTo(300 + x, y + 8, 300 + x + 8, y); } c.stroke(); }
    c.restore();
    ln(c, 300, bodyTop + 54, 300, hip + 10, 4, "rgba(120,100,60,0.6)");
    for (let y = bodyTop + 70; y < hip - 10; y += 44) dot(c, 300, y, 6, "#fffaf0", INK, 3);
    // collar (pulled outward when tugging)
    const cl = o.collar || 0;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(300 + s * 4, bodyTop + 2); c.lineTo(300 + s * (44 + cl * 20), bodyTop - 6 - cl * 10); c.lineTo(300 + s * 30, bodyTop + 40); c.closePath(); fillStroke(c, shirt, 6); }
  }
  if (o.robe) { c.beginPath(); c.moveTo(270, bodyTop + 6); c.lineTo(300, bodyTop + 60); c.lineTo(330, bodyTop + 6); c.closePath(); fillStroke(c, "#ffffff", 6); }
  if (o.vest) {
    c.beginPath(); c.moveTo(300 - 98, bodyTop + 16); c.lineTo(300 - 30, bodyTop + 16); c.lineTo(300 - 26, hip + 16); c.lineTo(300 - 88, hip + 16); c.closePath(); fillStroke(c, o.vest, 6);
    c.beginPath(); c.moveTo(300 + 98, bodyTop + 16); c.lineTo(300 + 30, bodyTop + 16); c.lineTo(300 + 26, hip + 16); c.lineTo(300 + 88, hip + 16); c.closePath(); fillStroke(c, o.vest, 6);
    c.fillStyle = "#e9e9e9"; c.fillRect(300 - 92, bodyTop + 120, 62, 12); c.fillRect(300 + 30, bodyTop + 120, 62, 12);
  }
  if (o.chain) { c.strokeStyle = "#f2c230"; c.lineWidth = 9; c.beginPath(); c.arc(300, bodyTop - 10, 58, Math.PI * 0.2, Math.PI * 0.8); c.stroke(); dot(c, 300, bodyTop + 50, 13, "#f2c230", INK, 4); }
  if (o.tie) { c.beginPath(); c.moveTo(292, bodyTop + 4); c.lineTo(308, bodyTop + 4); c.lineTo(316, bodyTop + 120); c.lineTo(300, bodyTop + 140); c.lineTo(284, bodyTop + 120); c.closePath(); fillStroke(c, o.tie, 5); }
  // arms (with sleeves); croc arms are thicker
  const sleeve = o.robe || shirt;
  const shY = bodyTop + 34;
  const sleeveFrac = o.barong || o.robe ? 0.85 : 0.42;
  const armW = croc ? 22 : 15;
  const drawArm = (side, ang) => {
    const sx = 300 + side * (tw / 2 - 8);
    const a = side * ang, len = ARM;
    const ex = sx + Math.sin(a) * len, ey = shY + Math.cos(a) * len;
    const mx = sx + Math.sin(a) * len * sleeveFrac, my = shY + Math.cos(a) * len * sleeveFrac;
    ln(c, sx, shY, mx, my, 44, INK); ln(c, sx, shY, mx, my, 44 - LW * 1.6, sleeve);
    if (sleeveFrac < 0.99) { ln(c, mx, my, ex, ey, armW, INK); if (croc) ln(c, mx, my, ex, ey, armW - 8, skin); }
    return [ex, ey, a];
  };
  const hL = drawArm(-1, o.armL ?? 0.18), hR = drawArm(1, o.armR ?? 0.18);
  hand(c, hL[0], hL[1], skin, croc, o.thumbL, hL[2]);
  hand(c, hR[0], hR[1], skin, croc, o.thumbR, hR[2]);
  if (o.hold) prop(c, o.hold, hR[0], hR[1]);
  // head
  const hy = bodyTop - headH / 2 + 22;
  if (croc) drawCrocHead(c, 272, hy - 8, headW, headH, o);
  else drawHead(c, 300, hy, headW, headH, skin, o);
  c.restore();
}

function drawHead(c, cx, cy, w, h, skin, o) {
  const expr = o.expr || "neutral";
  // ears
  dot(c, cx - w / 2 + 2, cy + 18, 22, skin, INK, 7); dot(c, cx + w / 2 - 2, cy + 18, 22, skin, INK, 7);
  beanPath(c, cx, cy, w, h); fillStroke(c, skin);
  // hair
  if (o.hair && !o.hat) {
    c.save(); beanPath(c, cx, cy, w, h); c.clip();
    c.beginPath(); c.moveTo(cx - w, cy - h * 0.12);
    c.quadraticCurveTo(cx - w * 0.25, cy - h * 0.32, cx + w * 0.05, cy - h * 0.2);
    c.quadraticCurveTo(cx + w * 0.3, cy - h * 0.3, cx + w, cy - h * 0.1); c.lineTo(cx + w, cy - h); c.lineTo(cx - w, cy - h); c.closePath();
    c.fillStyle = o.hair; c.fill(); c.restore();
    beanPath(c, cx, cy, w, h); c.lineWidth = LW; c.strokeStyle = INK; c.stroke();
    if (o.long) { c.beginPath(); c.moveTo(cx - w / 2, cy - 20); c.quadraticCurveTo(cx - w / 2 - 30, cy + h * 0.45, cx - w / 2 + 10, cy + h * 0.55); c.lineTo(cx - w / 2 + 30, cy); c.closePath(); fillStroke(c, o.hair, 7);
      c.beginPath(); c.moveTo(cx + w / 2, cy - 20); c.quadraticCurveTo(cx + w / 2 + 30, cy + h * 0.45, cx + w / 2 - 10, cy + h * 0.55); c.lineTo(cx + w / 2 - 30, cy); c.closePath(); fillStroke(c, o.hair, 7); }
  }
  const ey = cy + 4, sep = w * 0.4;
  eyes(c, cx + (o.look || 0) * 8, ey, sep, 26, expr, o.blink || 0, o.look || 0);
  brows(c, cx, ey - 48, sep, expr);
  mouth(c, cx, cy + h * 0.3, 90, expr, o.talk || 0);
  if (o.glasses) { for (const s of [-1, 1]) { c.beginPath(); c.arc(cx + s * sep / 2, ey, 36, 0, Math.PI * 2); c.lineWidth = 7; c.strokeStyle = INK; c.stroke(); } ln(c, cx - sep / 2 + 36, ey, cx + sep / 2 - 36, ey, 7); }
  if (o.shades) drawShades(c, cx, ey, sep, o.shades);
  if (o.hat === "hardhat") {
    c.beginPath(); c.moveTo(cx - w * 0.62, cy - h * 0.18); c.lineTo(cx + w * 0.62, cy - h * 0.18); c.lineTo(cx + w * 0.62, cy - h * 0.24); c.lineTo(cx - w * 0.62, cy - h * 0.24); c.closePath(); fillStroke(c, "#f6c21a", 7);
    c.beginPath(); c.ellipse(cx, cy - h * 0.24, w * 0.47, h * 0.3, 0, Math.PI, 0); c.closePath(); fillStroke(c, "#f6c21a", 8);
    ln(c, cx, cy - h * 0.5, cx, cy - h * 0.27, 7);
  }
  if (o.hat === "cap") {
    c.beginPath(); c.ellipse(cx, cy - h * 0.26, w * 0.45, h * 0.26, 0, Math.PI, 0); c.closePath(); fillStroke(c, o.capCol || "#2f6fd1", 8);
    c.beginPath(); c.ellipse(cx + w * 0.3, cy - h * 0.26, w * 0.3, 16, 0, 0, Math.PI * 2); fillStroke(c, o.capCol || "#2f6fd1", 7);
  }
  if (o.hat === "salakot") {
    c.beginPath(); c.moveTo(cx - w * 0.75, cy - h * 0.2); c.lineTo(cx, cy - h * 0.75); c.lineTo(cx + w * 0.75, cy - h * 0.2); c.closePath(); fillStroke(c, "#d8a85a", 8);
  }
}
function drawShades(c, cx, ey, sep, a = 1) {
  c.save(); c.translate(0, (1 - a) * -60); c.globalAlpha = Math.min(1, a * 1.5);
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * sep / 2, ey + 4, 46, 32, 0, 0, Math.PI * 2); fillStroke(c, "#121218", 7); c.beginPath(); c.ellipse(cx + s * sep / 2 - 14, ey - 6, 12, 6, -0.4, 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255,0.7)"; c.fill(); }
  ln(c, cx - sep / 2 + 40, ey, cx + sep / 2 - 40, ey, 9);
  c.restore();
}

// croc head, 3/4 view facing right: rounded cranium with eye bumps, long snout with nostril knob, zigzag teeth, light jaw
function drawCrocHead(c, cx, cy, w, h, o) {
  const G = o.croc || CROC_G, GD = shade(G, 0.74);
  const expr = o.expr || "grin";
  const jaw = Math.max(o.jaw || 0, o.talk ? 0.35 : 0, o.laugh ? 0.35 + 0.45 * Math.abs(Math.sin(o.laugh * 14)) : 0);
  const grin = expr === "grin" || expr === "happy" ? 1 : expr === "smile" || expr === "smug" || expr === "sly" ? 0.55 : 0;
  // mouth line (upper jaw edge), back corner -> tip
  const bx = cx - w * 0.36, by = cy + h * 0.14 - grin * 26;
  const tipx = cx + w * 0.9, tipy = cy + h * 0.16;
  const mouthY = (x) => { const u = (x - bx) / (tipx - bx); return by + (tipy - by) * (1 - Math.pow(1 - u, 2.2)) ; };
  const ja = jaw * 0.45; // jaw rotation about the back corner
  const rot = (x, y) => [bx + (x - bx) * Math.cos(ja) - (y - by) * Math.sin(ja), by + (x - bx) * Math.sin(ja) + (y - by) * Math.cos(ja)];
  // lower jaw (rotated) + mouth interior
  const lower = [[bx, by], [cx, cy + h * 0.2], [cx + w * 0.5, cy + h * 0.2], [tipx - 6, tipy + 4], [tipx - 10, tipy + h * 0.13], [cx + w * 0.3, cy + h * 0.35], [cx - w * 0.15, cy + h * 0.38], [bx - 12, by + h * 0.1]].map(([x, y]) => rot(x, y));
  if (jaw > 0.02) {
    c.beginPath(); c.moveTo(bx, by); for (let x = bx; x <= tipx; x += 12) c.lineTo(x, mouthY(x)); for (let i = 3; i >= 0; i--) c.lineTo(...lower[i]); c.closePath(); fillStroke(c, "#7a1f2e", 7);
    c.beginPath(); const tg = rot(cx + w * 0.2, cy + h * 0.24); c.ellipse(tg[0], tg[1] - 6, w * 0.22, 20, ja, 0, Math.PI * 2); c.fillStyle = "#d9536a"; c.fill();
  }
  c.beginPath(); c.moveTo(...lower[0]); for (let i = 1; i < lower.length; i++) c.lineTo(...lower[i]); c.closePath(); fillStroke(c, CROC_BELLY);
  // lower teeth (pointing up)
  c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 4;
  for (let k = 0; k < 4; k++) { const x = cx + w * (0.15 + k * 0.17); const [px, py] = rot(x, mouthY(x) + 4); c.beginPath(); c.moveTo(px - 9, py + 2); c.lineTo(px, py - 18); c.lineTo(px + 9, py + 2); c.closePath(); c.fill(); c.stroke(); }
  // upper head: cranium + snout
  c.beginPath();
  c.moveTo(bx - 8, by + 10);
  c.bezierCurveTo(cx - w * 0.6, cy - h * 0.2, cx - w * 0.38, cy - h * 0.52, cx - w * 0.08, cy - h * 0.5);
  c.bezierCurveTo(cx + w * 0.16, cy - h * 0.48, cx + w * 0.22, cy - h * 0.26, cx + w * 0.36, cy - h * 0.2);
  c.lineTo(cx + w * 0.72, cy - h * 0.13);
  c.bezierCurveTo(cx + w * 0.86, cy - h * 0.2, cx + w * 0.98, cy - h * 0.08, tipx + 4, tipy - 6);
  c.quadraticCurveTo(tipx + 6, tipy + 4, tipx - 4, tipy + 2);
  for (let x = tipx - 4; x >= bx; x -= 10) c.lineTo(x, mouthY(x));
  c.closePath(); fillStroke(c, G);
  // darker back scutes
  c.fillStyle = GD;
  for (const [x, y, rx, ry] of [[-0.22, -0.34, 18, 12], [-0.05, -0.38, 16, 11], [0.12, -0.25, 13, 9], [0.32, -0.12, 12, 8], [0.5, -0.08, 11, 7], [-0.36, -0.12, 14, 10], [0.66, -0.05, 9, 6]]) { c.beginPath(); c.ellipse(cx + w * x, cy + h * y, rx, ry, 0.1, 0, Math.PI * 2); c.fill(); }
  // nostril knob
  c.beginPath(); c.ellipse(cx + w * 0.86, cy - h * 0.1, 22, 15, 0.2, Math.PI, Math.PI * 2.05); fillStroke(c, G, 6);
  dot(c, cx + w * 0.82, cy - h * 0.12, 4.5, INK, null); dot(c, cx + w * 0.9, cy - h * 0.1, 4.5, INK, null);
  // upper teeth (pointing down) along the mouth line
  c.fillStyle = "#fff"; c.strokeStyle = INK; c.lineWidth = 4;
  for (let x = bx + w * 0.12; x < tipx - 14; x += 24) { const y = mouthY(x); c.beginPath(); c.moveTo(x - 10, y - 2); c.lineTo(x, y + 18 + (grin ? 2 : 0)); c.lineTo(x + 10, y - 2); c.closePath(); c.fill(); c.stroke(); }
  // mouth line + smile crease
  c.beginPath(); c.moveTo(bx - 4, by + 2); for (let x = bx; x <= tipx - 4; x += 8) c.lineTo(x, mouthY(x)); c.lineWidth = 7; c.stroke();
  if (grin) { c.beginPath(); c.arc(bx + 4, by - 16, 22, Math.PI * 0.25, Math.PI * 0.95); c.lineWidth = 7; c.stroke(); }
  // eye bumps + eyes
  const eyesAt = [[cx - w * 0.27, cy - h * 0.43, 1], [cx + w * 0.0, cy - h * 0.45, 0.94]];
  for (const [x, y, sc] of eyesAt) {
    c.beginPath(); c.ellipse(x, y, 44 * sc, 40 * sc, 0, Math.PI * 0.92, Math.PI * 2.08); fillStroke(c, G, 8);
    const eh = (expr === "shock" ? 34 : 28) * sc;
    c.beginPath(); c.ellipse(x, y + 2, 28 * sc, eh, 0, 0, Math.PI * 2); fillStroke(c, "#fffbe6", 6);
    if ((o.blink || 0) > 0.5 || expr === "happy") {
      c.save(); c.beginPath(); c.ellipse(x, y + 2, 29 * sc, eh + 1, 0, 0, Math.PI * 2); c.clip(); c.fillStyle = G; c.fillRect(x - 40, y - 40, 80, 80); c.restore();
      c.beginPath(); if (expr === "happy") c.arc(x, y + 10, 16, Math.PI * 1.1, Math.PI * 1.9); else { c.moveTo(x - 24, y + 4); c.lineTo(x + 24, y + 4); } c.lineWidth = 7; c.strokeStyle = INK; c.stroke();
      continue;
    }
    const pr = expr === "shock" ? 8 : 11;
    c.beginPath(); c.ellipse(x + 7 + (o.look || 0) * 8, y + 6, pr * sc, 18 * sc, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
    c.beginPath(); c.arc(x + 2 + (o.look || 0) * 8, y - 4, 5 * sc, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
    if (expr === "smug" || expr === "sly" || expr === "grin") { // heavy lid
      const lid = expr === "grin" ? 0.38 : 0.55;
      c.save(); c.beginPath(); c.ellipse(x, y + 2, 29 * sc, eh + 1, 0, 0, Math.PI * 2); c.clip(); c.fillStyle = G; c.fillRect(x - 40, y - 40, 80, 40 + (lid - 0.5) * eh * 2); c.restore();
      ln(c, x - 27 * sc, y + 2 + (lid - 0.5) * eh * 2, x + 27 * sc, y + 2 + (lid - 0.5) * eh * 2, 7);
    }
    // brow
    const k = { angry: 0.4, shock: -0.3, smug: 0.15, sly: 0.25, grin: 0.05 }[expr] || 0;
    ln(c, x - 26, y - 44 - (expr === "shock" ? 10 : 0) + k * 22, x + 24, y - 46 - (expr === "shock" ? 10 : 0) - k * 10, 9);
  }
  if (o.shades) {
    c.save(); c.translate(0, (1 - o.shades) * -80); c.globalAlpha = Math.min(1, o.shades * 1.5);
    for (const [x, y] of eyesAt) { c.beginPath(); c.ellipse(x, y + 4, 46, 32, 0, 0, Math.PI * 2); fillStroke(c, "#121218", 7); c.beginPath(); c.ellipse(x - 14, y - 6, 13, 6, -0.4, 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255,0.7)"; c.fill(); }
    ln(c, eyesAt[0][0] + 44, eyesAt[0][1] + 2, eyesAt[1][0] - 44, eyesAt[1][1] + 2, 9);
    c.restore();
  }
  if (o.sparkle) {
    const s = o.sparkle, x = cx + w * 0.42, y = mouthY(cx + w * 0.42) + 14;
    c.save(); c.translate(x, y); c.rotate(s * 1.2); c.fillStyle = "#ffffff"; c.strokeStyle = INK; c.lineWidth = 4;
    const R = 54 * Math.sin(Math.min(1, s) * Math.PI);
    c.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? R * 0.26 : R; const a = i * Math.PI / 4; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore();
  }
}

function drawGhost(c, o) {
  const t = o.t || 0;
  const wob = (x) => Math.sin(x * 0.05 + t * 6) * 14;
  c.beginPath();
  c.moveTo(150, 560);
  c.bezierCurveTo(140, 250, 460, 250, 450, 560);
  c.lineTo(450, 860);
  for (let x = 450; x >= 150; x -= 50) c.quadraticCurveTo(x - 25, 900 + wob(x), x - 50, 860 + wob(x - 50) * 0.3);
  c.closePath(); fillStroke(c, "rgba(250,250,255,0.96)");
  for (const s of [-1, 1]) { c.beginPath(); c.ellipse(300 + s * 52, 470, 24, 36, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill(); }
  c.beginPath(); c.ellipse(300, 580, 30, 38, 0, 0, Math.PI * 2); c.fillStyle = INK; c.fill();
  // little arms
  ln(c, 160, 640, 100, 600 + Math.sin(t * 5) * 20, 14); ln(c, 440, 640, 500, 600 - Math.sin(t * 5) * 20, 14);
  if (o.label) { c.font = "bold 46px Baloo"; c.textAlign = "center"; c.fillStyle = "#9aa3b8"; c.fillText(o.label, 300, 760); }
}

// ---- small fx cards
export function drawFx(c, kind, t, opt = {}) {
  c.clearRect(0, 0, CW, CH);
  if (kind === "question") {
    c.save(); c.translate(300, 500); const s = Math.min(1, t * 4); c.scale(s, s); c.font = "900 520px 'Luckiest Guy'"; c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 34; c.strokeStyle = INK; c.strokeText("?", 0, 0); c.fillStyle = "#ffd93b"; c.fillText("?", 0, 0); c.restore();
  } else if (kind === "bang") {
    c.save(); c.translate(300, 500); const s = Math.min(1, t * 5); c.scale(s, s); c.font = "900 520px 'Luckiest Guy'"; c.textAlign = "center"; c.textBaseline = "middle";
    c.lineWidth = 34; c.strokeStyle = INK; c.strokeText("!", 0, 0); c.fillStyle = "#ff4d3d"; c.fillText("!", 0, 0); c.restore();
  } else if (kind === "splash") {
    const k = Math.min(1, t * 2.2);
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI / 2 + (i - 4) * 0.28; const r = 150 + 330 * k;
      const x = 300 + Math.cos(a) * r * 0.75, y = 900 + Math.sin(a) * r * (1 - 0.6 * k * k) + 380 * k * k;
      dot(c, x, y, 34 * (1 - k * 0.6), "#e8f6ff", INK, 6);
    }
  } else if (kind === "shadow") {
    const g = c.createRadialGradient(300, 500, 0, 300, 500, 290); g.addColorStop(0, "rgba(20,10,30,0.55)"); g.addColorStop(0.7, "rgba(20,10,30,0.3)"); g.addColorStop(1, "rgba(20,10,30,0)");
    c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  }
}
