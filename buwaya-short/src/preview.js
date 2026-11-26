import { drawChar } from "./toon.js";
window.preview = async (list) => {
  for (const [f, u, w] of [["Baloo", "fonts/baloo-800.woff2", "800"], ["Luckiest Guy", "fonts/luckiest.woff2", "400"]]) { const ff = new FontFace(f, `url(${u})`, { weight: w }); await ff.load(); document.fonts.add(ff); }
  const out = document.createElement("canvas"); out.width = 300 * list.length; out.height = 500;
  const o = out.getContext("2d"); o.fillStyle = "#9fc8e8"; o.fillRect(0, 0, out.width, out.height);
  const cv = document.createElement("canvas"); cv.width = 600; cv.height = 1000; const c = cv.getContext("2d");
  list.forEach((opts, i) => { drawChar(c, opts); o.drawImage(cv, i * 300, 0, 300, 500); });
  return out.toDataURL("image/png");
};
