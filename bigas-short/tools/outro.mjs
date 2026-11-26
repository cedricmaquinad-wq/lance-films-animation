// node tools/outro.mjs stills dir 0,30,60  |  node tools/outro.mjs video out.mp4
import { createRequire } from "module"; const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "fs"; import http from "http"; import path from "path"; import { spawn } from "child_process";
const root = path.resolve("web");
const server = http.createServer((req, res) => { const p = path.join(root, req.url.split("?")[0]); if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); } res.end(fs.readFileSync(p)); });
await new Promise((r) => server.listen(0, r));
const b = await chromium.launch(); const pg = await b.newPage();
pg.on("pageerror", (e) => console.log("ERR", e.message));
await pg.goto(`http://localhost:${server.address().port}/outro.html`);
await pg.evaluate(() => window.outroInit);
const [mode, out, list] = process.argv.slice(2);
const grab = async (f) => Buffer.from((await pg.evaluate((f) => window.outroFrame(f), f)).split(",")[1], "base64");
if (mode === "stills") { fs.mkdirSync(out, { recursive: true }); for (const f of list.split(",").map(Number)) fs.writeFileSync(`${out}/o${String(f).padStart(3, "0")}.jpg`, await grab(f)); }
else {
  const n = Math.round((await pg.evaluate(() => window.OUTRO_DUR)) * 30);
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "image2pipe", "-framerate", "30", "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < n; f++) { const buf = await grab(f); if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r)); }
  ff.stdin.end(); await new Promise((r) => ff.on("close", r));
}
await b.close(); server.close();
