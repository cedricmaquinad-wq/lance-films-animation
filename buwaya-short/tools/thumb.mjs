import { createRequire } from "module"; const { chromium } = createRequire(import.meta.url)("playwright");
import fs from "fs"; import http from "http"; import path from "path";
const root = path.resolve("web");
const server = http.createServer((req, res) => { const p = path.join(root, req.url.split("?")[0]); if (!fs.existsSync(p)) { res.writeHead(404); return res.end(); } res.end(fs.readFileSync(p)); });
await new Promise((r) => server.listen(0, r));
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] }); const pg = await b.newPage();
pg.on("pageerror", (e) => console.log("ERR", e.message));
await pg.goto(`http://localhost:${server.address().port}/thumb.html`);
for (const [f, wide, out] of [[+process.argv[2], false, "thumbnail_vertical.jpg"], [+process.argv[2], true, "thumbnail_16x9.jpg"]]) {
  const d = await pg.evaluate(([f, w]) => window.makeThumb(f, w), [f, wide]);
  fs.writeFileSync(out, Buffer.from(d.split(",")[1], "base64"));
}
await b.close(); server.close();
