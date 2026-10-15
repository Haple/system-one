// Motion lab for the course engine: step scenes frame by frame (pure function of t) and look at them like an animator.
// Per scene: a contact strip (12 frames), a pop scan (single-frame jumps in the image diff), text that is cut off by
// the frame or overlaps other text, the camera moves the director chose, and the longest stretch with nothing new.
// usage: node tools/motion_qa.mjs <data-url-path> <outdir> [--portrait] [--fps 15] [--scenes 0,3] [--scale 0.3] [--lite]
import puppeteer from "puppeteer-core"; // npm i puppeteer-core
import { readdirSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const [src, out] = process.argv.slice(2);
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const portrait = process.argv.includes("--portrait"), FPS = +arg("fps", 15), only = arg("scenes", null)?.split(",").map(Number);
const port = process.env.PORT || 4740;
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
const base = `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell/`; const exe = process.env.CHROME_BIN || `${base}${readdirSync(base)[0]}/chrome-headless-shell-linux64/chrome-headless-shell`;
const br = await puppeteer.launch({ executablePath: exe, args: ["--no-sandbox", "--force-color-profile=srgb"] });
const p = await br.newPage();
const W = portrait ? 1080 : 1920, H = portrait ? 1920 : 1080;
await p.setViewport({ width: W, height: H, deviceScaleFactor: +arg("scale", "0.3") });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
await p.goto(`http://127.0.0.1:${port}/dev/stage.html?src=${encodeURIComponent(src)}&portrait=${portrait ? 1 : 0}&mode=capture&noboil=1&nocaps=1${process.argv.includes("--lite") ? "&lite=1" : ""}`, { waitUntil: "load" });
await p.evaluate(() => window.__ready);
const scenes = await p.evaluate(() => window.L.scenes.map((S) => ({ t0: S.t0, dur: S.dur, tpl: S.sc.template, cam: S.camLog, gap: S.maxGap, seam: S.seam })));
const cueErrors = await p.evaluate(() => window.L.cueErrors);
const TEXT = ".ti-h,.ti-sub,.stm-h,.stm-sub,.side-h,.side-p,.qt-text,.qt-cap,.rq-qt,.rq-text,.rq-json,.nl-t,.nl-dot b,.ds-l,.ds-p,.lv-t,.cv-read,.ln3-card,.ln3-h,.rc2-out,.rc2-a,.dc-t,.dc-big,.tb-c,.sy-h,.sy-col li,.rt-d,.rt-src,.jg-q,.qz-q,.qz-t,.rc-main li,.ex-prompt,.hnote,.fl-node b,.cmp-col li,.li-t,.stat-l,.stat-v,.bub,.bubble,.ch-v,.ch-x,.ev-box,.fml-t,.lv-mark b,.cap-in";
const textCheck = () => p.evaluate((sel) => {
  const vis = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.visibility === "hidden" || +cs.opacity < 0.5 || cs.display === "none") return false; } return true; };
  const R = [...document.querySelectorAll(sel)].filter((e) => vis(e)).map((e) => ({ c: e.className?.baseVal ?? e.className, e, r: e.getBoundingClientRect() })).filter((x) => x.r.width > 4 && x.r.height > 4);
  const bad = [];
  for (const a of R) if (a.r.left < -2 || a.r.right > innerWidth + 2 || a.r.top < -2 || a.r.bottom > innerHeight + 2) bad.push(`cut:${String(a.c).split(" ")[0]}`);
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    if (R[i].e.contains(R[j].e) || R[j].e.contains(R[i].e)) continue;
    const a = R[i].r, b = R[j].r, ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)), iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    if (ix * iy > 0.12 * Math.min(a.width * a.height, b.width * b.height)) bad.push(`overlap:${String(R[i].c).split(" ")[0]}/${String(R[j].c).split(" ")[0]}`);
  }
  return bad;
}, TEXT);
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", maxBuffer: 1 << 26 });
const report = [];
for (const [i, s] of scenes.entries()) {
  if (only && !only.includes(i)) continue;
  const name = `${String(i).padStart(2, "0")}-${s.tpl}`, dir = `${out}/${name}`; mkdirSync(dir, { recursive: true });
  const n = Math.round(s.dur * FPS), bad = new Set();
  for (let k = 0; k <= n; k++) {
    const t = s.t0 + k / FPS;
    await p.evaluate((t) => window.__seek(t), t);
    if (k % Math.max(1, Math.round(FPS / 3)) === 0 && t > s.t0 + 0.5) for (const x of await textCheck()) bad.add(`${x}@${(t - s.t0).toFixed(1)}`);
    await p.screenshot({ path: `${dir}/f${String(k).padStart(3, "0")}.png` });
  }
  // pop scan: mean absolute luma change per frame pair; a spike > 3x both neighbours is a single-frame pop
  const d = JSON.parse(sh("python3", ["-c", `
import sys, glob, json
from PIL import Image, ImageChops, ImageStat
fs = sorted(glob.glob(sys.argv[1] + "/f*.png")); prev = None; out = []
for f in fs:
    im = Image.open(f).convert("L")
    if prev is not None: out.append(round(ImageStat.Stat(ImageChops.difference(im, prev)).mean[0], 3))
    prev = im
print(json.dumps(out))`, dir]));
  const pops = [];
  for (let k = 1; k < d.length - 1; k++) if (d[k] > 0.6 && d[k] > 3 * d[k - 1] && d[k] > 3 * d[k + 1]) pops.push(+((k + 1) / FPS).toFixed(2));
  const still = d.filter((v) => v < 0.02).length / Math.max(1, d.length);
  const k = Math.max(1, Math.floor(n / 12));
  sh("ffmpeg", ["-v", "error", "-y", "-i", `${dir}/f%03d.png`, "-vf", `select='not(mod(n\\,${k}))',tile=6x2:padding=4:color=white`, "-frames:v", "1", `${out}/${name}-strip.jpg`]);
  const r = { scene: i, tpl: s.tpl, seam: s.seam, cam: s.cam, maxGap: +(s.gap || 0).toFixed(2), deadBeat: (s.gap || 0) > 3.5, pops, stillShare: +still.toFixed(2), text: [...bad].slice(0, 12) };
  report.push(r);
  console.log(`${name.padEnd(20)} seam=${(s.seam || "").padEnd(8)} cam=${String(s.cam).padEnd(28)} gap=${r.maxGap}${r.deadBeat ? " DEAD" : ""} still=${r.stillShare} pops=${pops.join(",") || "-"} ${r.text.length ? "TEXT " + r.text.join(" ") : ""}`);
  if (!process.argv.includes("--keep")) rmSync(dir, { recursive: true, force: true });
}
if (cueErrors.length) console.log("cue errors:\n " + cueErrors.join("\n "));
if (errs.length) console.log("page errors:\n " + errs.join("\n "));
writeFileSync(`${out}/report.json`, JSON.stringify({ report, cueErrors, errs }, null, 1));
await br.close();
