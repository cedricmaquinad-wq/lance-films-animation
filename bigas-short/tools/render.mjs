// node tools/render.mjs stills out/dir 0,100,200      -> JPGs of chosen frames
// node tools/render.mjs video out/video.mp4 [start end] -> silent h264 of frames [start, end)
import { createRequire } from "module";
const { chromium } = createRequire(import.meta.url)("playwright");
import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const root = path.resolve("web");
const server = http.createServer((req, res) => {
  const p = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  const ext = path.extname(p);
  res.writeHead(200, { "Content-Type": { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".woff2": "font/woff2" }[ext] || "application/octet-stream" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const [mode, out, a, b] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-webgl"] });
const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
page.on("console", (m) => { if (m.type() === "error" || m.type() === "warning") console.log("[page]", m.text().slice(0, 300)); });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://localhost:${port}/index.html`);
const ok = await page.evaluate(() => window.initDone);
if (!ok) { console.log(await page.evaluate(() => window.initError)); process.exit(1); }
const dur = await page.evaluate(() => window.DURATION);
const total = Math.round(dur * 30);

const grab = async (f, opts = {}) => {
  const data = await page.evaluate(([f, o]) => window.renderAt(f, o), [f, opts]);
  return Buffer.from(data.split(",")[1], "base64");
};

if (mode === "stills") {
  fs.mkdirSync(out, { recursive: true });
  const frames = a.split(",").map(Number);
  for (const f of frames) {
    const t0 = Date.now();
    fs.writeFileSync(path.join(out, `f${String(f).padStart(4, "0")}.jpg`), await grab(f, { q: 0.88 }));
    console.log(`frame ${f} ${(Date.now() - t0)}ms`);
  }
} else {
  const s = a ? +a : 0, e = b ? +b : total;
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = s; f < e; f++) {
    const buf = await grab(f, { q: 0.95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((f - s) % 60 === 0) console.log(`frame ${f}/${e}  ${((Date.now() - t0) / (f - s + 1)).toFixed(0)} ms/f`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
}
await browser.close();
server.close();
