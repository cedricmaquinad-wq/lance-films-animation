import * as THREE from "three";
import { W, H as HH, FPS, renderFrame, post, glCanvas, outCanvas, out2d, S } from "./engine.js";
import { buildWorld, SETS, H } from "./sets.js";
import { SHOTS, LOOKS, shotAt, cameraAt, animate, allCards, setupExtras, FLASH, DURATION } from "./story.js";
import { skyDome, Card } from "./kit.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, W / HH, 0.05, 900);
const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
const sc = sun.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 1; sc.far = 200;
scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1.2); scene.add(hemi);
let sky = null, skyLook = null;
scene.fog = new THREE.Fog(0xffffff, 40, 300);

let captions = [];
let ready = false;

async function init() {
  const fonts = [["Baloo", "fonts/baloo-800.woff2", "800"], ["Baloo", "fonts/baloo-700.woff2", "700"], ["Luckiest Guy", "fonts/luckiest.woff2", "400"]];
  for (const [f, u, w] of fonts) { const ff = new FontFace(f, `url(${u})`, { weight: w }); await ff.load(); document.fonts.add(ff); }
  captions = await (await fetch("captions.json")).json();
  buildWorld(scene);
  setupExtras(scene, Card);
  ready = true;
}

function applyLook(name, shot) {
  const L = LOOKS[name];
  if (skyLook !== name) {
    if (sky) scene.remove(sky);
    sky = skyDome(L.top, L.hor); scene.add(sky); skyLook = name;
    scene.fog.color.set(L.hor);
    sun.color.set(L.sunCol); sun.intensity = L.sunI;
    hemi.color.set(L.hemiSky); hemi.groundColor.set(L.hemiGround); hemi.intensity = L.hemiI;
  }
  scene.fog.near = L.fog[0]; scene.fog.far = L.fog[1];
  post.uFogNear.value = L.fog[0]; post.uFogFar.value = L.fog[1];
  post.uSat.value = L.sat; post.uExpo.value = L.expo;
  sky.position.copy(camera.position);
  // sun follows the shot's look target
  const off = SETS[shot.set].position;
  const tgt = new THREE.Vector3(...shot.cam[0][2]).add(off);
  sun.target.position.copy(tgt);
  sun.position.copy(tgt).add(new THREE.Vector3(...L.sun).normalize().multiplyScalar(80));
  const span = shot.set === "ballot" ? 4 : shot.set === "eatery" ? 12 : 34;
  sc.left = -span; sc.right = span; sc.top = span; sc.bottom = -span; sc.updateProjectionMatrix();
}

function drawCaption(t) {
  let w = null;
  for (const c of captions) if (t >= c.s - 0.03 && t < (c.e + 0.25)) w = c; // hold last word briefly
  // pick the latest word that has started
  for (const c of captions) if (t >= c.s - 0.03) w = (t < c.e + 0.35) ? c : w;
  if (!w) return;
  const txt = w.w.replace(/[.,?:]$/, "");
  const age = t - w.s;
  const s = 1 + 0.18 * Math.max(0, 1 - age / 0.12);
  const ctx = out2d;
  ctx.save();
  ctx.translate(W / 2, HH * 0.665);
  ctx.scale(s, s);
  let size = 118 * S;
  ctx.font = `800 ${size}px Baloo`;
  while (ctx.measureText(txt).width > W * 0.86 && size > 40) { size -= 4; ctx.font = `800 ${size}px Baloo`; }
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.lineJoin = "round"; ctx.lineWidth = 22 * S; ctx.strokeStyle = "#0b0a0c"; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = "#ffffff"; ctx.fillText(txt, 0, 0);
  ctx.restore();
}

window.renderAt = function (frame, opts = {}) {
  if (!ready) return null;
  const t = frame / FPS;
  const shot = shotAt(t);
  for (const k in SETS) SETS[k].visible = k === shot.set;
  cameraAt(shot, t, camera);
  applyLook(shot.look, shot);
  animate(t, shot);
  for (const c of allCards()) if (c.root.visible !== false) c.update(camera, t);
  // DOF + flash + fade
  post.uFocus.value = shot.focus; post.uBlur.value = (shot.blur || 0) * S;
  let flash = 0; for (const [ft, a] of FLASH) { const d = t - ft; if (d >= 0 && d < 0.2) flash = Math.max(flash, a * (1 - d / 0.2)); }
  post.uFlash.value = flash;
  post.uFade.value = Math.min(1, t / 0.15, (DURATION - t) / 0.35);
  renderFrame(scene, camera);
  out2d.drawImage(glCanvas, 0, 0);
  if (opts.captions !== false) drawCaption(t);
  return outCanvas.toDataURL("image/jpeg", opts.q ?? 0.92);
};
window.SHOTS = SHOTS;
window.DURATION = DURATION;
window.initDone = init().then(() => true).catch((e) => { console.error(e); window.initError = String(e.stack || e); return false; });
