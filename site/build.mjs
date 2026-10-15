// Static site builder: course/*.json + site/static/data/*.json (timed lessons) -> site/dist
// usage: node site/build.mjs [--base https://...]
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, cpSync, rmSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
const ROOT = new URL("..", import.meta.url).pathname;
const SITE = join(ROOT, "site"), DIST = join(SITE, "dist"), STATIC = join(SITE, "static");
const course = JSON.parse(readFileSync(join(ROOT, "course/course.json"), "utf8"));
const BASE = (process.argv.includes("--base") ? process.argv[process.argv.indexOf("--base") + 1] : course.site).replace(/\/$/, "");
const catalog = JSON.parse(readFileSync(join(ROOT, "research/sources.json"), "utf8"));
const facts = JSON.parse(readFileSync(join(ROOT, "experiments/results/facts.json"), "utf8"));
const REPO_SLUG = course.repo.replace("https://github.com/", "");
// prompts are hard-wrapped for the video; join mid-sentence breaks for pages and copy/paste
const unwrap = (t) => t.replace(/([a-z,:;)])\n(?=[a-z(])/g, "$1 ");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const md2txt = (s) => String(s ?? "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").replace(/(^|\s)_(.+?)_/g, "$1$2").replace(/~(.+?)~/g, "$1").replace(/`([^`]+)`/g, "$1");
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<em>$1</em>");
const fmtT = (s) => { s = Math.max(0, Math.round(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
const fmtMin = (s) => Math.max(1, Math.round((s || 0) / 60)) + " min";
const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";

rmSync(DIST, { recursive: true, force: true }); mkdirSync(DIST, { recursive: true });
for (const d of ["css", "js", "fonts", "audio", "data", "img", "media"]) if (existsSync(join(STATIC, d))) cpSync(join(STATIC, d), join(DIST, d), { recursive: true });
if (existsSync(join(STATIC, "root"))) cpSync(join(STATIC, "root"), DIST, { recursive: true }); // files served at the site root
const hashOf = (f) => createHash("md5").update(readFileSync(join(STATIC, f))).digest("hex").slice(0, 8);
const V = {}; for (const f of ["css/fonts.css", "css/lesson.css", "css/site.css", "js/gsap.min.js", "js/CustomEase.min.js", "js/motion.js", "js/art.js", "js/templates.js", "js/templates2.js", "js/engine.js", "js/player.js", "js/site.js", "js/lesson-page.js"]) if (existsSync(join(STATIC, f))) V[f] = `/${f}?v=${hashOf(f)}`;
const ENGINE = ["js/gsap.min.js", "js/CustomEase.min.js", "js/motion.js", "js/art.js", "js/templates.js", "js/templates2.js", "js/engine.js"].map((f) => `<script src="${V[f]}" defer></script>`).join("");

// ---------- data ----------
const lessons = [];
course.modules.forEach((m, mi) => m.lessons.forEach((l) => {
  const authorF = join(ROOT, "course/lessons", l.id + ".json"), timedF = join(STATIC, "data", l.id + ".json");
  const author = existsSync(authorF) ? JSON.parse(readFileSync(authorF, "utf8")) : null;
  const timed = existsSync(timedF) ? JSON.parse(readFileSync(timedF, "utf8")) : null;
  lessons.push({ ...l, module: m, moduleIndex: mi, author, timed, ready: !!(author && timed), number: lessons.length + 1 });
}));
const ready = lessons.filter((l) => l.ready);
const url = (l) => `/lessons/${l.slug}/`;
const totalMin = Math.round(ready.reduce((a, l) => a + l.timed.total, 0) / 60);
const srcs = Object.values(catalog);
const count = (k) => srcs.filter((s) => s.kind === k).length;
const nTalks = count("talk") + count("podcast"), nDocs = count("doc"), nPapers = count("paper"), nWritten = count("article") + count("repo") + count("discussion");
const nCalls = existsSync(join(ROOT, "experiments/cache")) ? readdirSync(join(ROOT, "experiments/cache")).length : 0;
const KIND = { talk: "Talk", podcast: "Podcast", doc: "Docs", paper: "Paper", article: "Article", repo: "Code", discussion: "Discussion" };

// tidy catalog strings for display: paper authors come as "Last; First; Last; First", repo titles as "GitHub - owner/repo: description"
function whoOf(s) {
  let w = s.who || "";
  if (s.kind === "paper" && w.includes(";")) { const last = w.split(";").map((x) => x.trim()).filter((_, i) => i % 2 === 0); w = last.length > 3 ? `${last[0]} et al.` : last.join(", "); }
  if (s.kind === "repo" && /^github$/i.test(w)) w = (s.url.match(/github\.com\/([^/]+\/[^/#?]+)/) || [])[1] || w;
  return w;
}
function titleOf(s) {
  let t = s.title || s.id;
  const gh = t.match(/^GitHub - ([^:]+):\s*(.*)$/); if (gh) t = `${gh[1]}: ${gh[2]}`;
  return t.length > 110 ? t.slice(0, 107).replace(/\s+\S*$/, "") + "…" : t;
}
function sourceInfo(ref) {
  const s = catalog[ref.id];
  if (!s) return { id: ref.id, title: ref.id, url: "#", who: "", kind: "unknown" };
  let u = s.url;
  if (ref.t != null) { if (s.kind === "talk") u = `${s.url}&t=${Math.floor(ref.t)}s`; else if (s.youtube) u = `${s.youtube}&t=${Math.floor(ref.t)}s`; }
  return { id: s.id, kind: s.kind, title: titleOf(s), url: u, who: whoOf(s) };
}
function lessonSources(l) {
  const seen = new Map();
  for (const ref of l.author.sources || []) { const si = sourceInfo(ref); if (!seen.has(si.id)) seen.set(si.id, { ...si, times: [] }); if (ref.t != null) seen.get(si.id).times.push(ref.t); }
  return [...seen.values()];
}

// ---------- markdown for agents ----------
function lessonMarkdown(l) {
  const a = l.author, t = l.timed;
  const lines = [`# Lesson ${l.number}: ${a.title}`, "", `> ${a.summary}`, "", `Course: ${course.title} (${BASE}/) · Module ${l.moduleIndex + 1}: ${l.module.title} · ${fmtMin(t.total)} · Watch: ${BASE}${url(l)}`, "", "## Key takeaways", ""];
  (a.takeaways || []).forEach((x) => lines.push(`- ${md2txt(x)}`));
  if (a.practices?.length) { lines.push("", "## Practices for coding agents", ""); a.practices.forEach((x) => lines.push(`- ${md2txt(x)}`)); }
  lines.push("", "## Lesson transcript", "");
  let chap = null;
  t.scenes.forEach((sc) => {
    if (sc.chapter && sc.chapter !== chap) { chap = sc.chapter; lines.push("", `### ${chap} (${fmtT(sc.start)})`, ""); }
    if (sc.template === "quiz") { lines.push(`**Quiz:** ${md2txt(sc.params.q)}`, ...sc.params.options.map((o, i) => `${"ABCD"[i]}. ${md2txt(o)}`), `Answer: ${"ABCD"[sc.params.answer]}. ${md2txt(sc.params.explain)}`, ""); return; }
    if (sc.template === "exercise") { lines.push(sc.narration, "", "```text", unwrap(sc.params.prompt), "```", ""); return; }
    if (sc.template === "code") { lines.push(sc.narration, "", "```" + (sc.params.lang === "py" ? "python" : sc.params.lang || ""), (sc.params.lines || []).join("\n"), "```", ""); return; }
    lines.push(sc.narration);
  });
  lines.push("", "## Sources", "");
  lessonSources(l).forEach((s) => lines.push(`- ${s.who ? s.who + ": " : ""}${s.title}${s.times.length ? " (at " + s.times.map(fmtT).join(", ") + ")" : ""}. ${s.url}`));
  lines.push("", `License: CC BY 4.0 · ${course.repo}`);
  return lines.join("\n") + "\n";
}

// ---------- layout ----------
const LOGO = `<svg class="logo-mark" viewBox="0 -6 120 136" width="28" height="32" aria-hidden="true"><path d="M59 26 L66 9 L61 11 L67 -2" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 25 C93 25 111 47 111 77 C111 105 91 125 60 125 C29 125 9 105 9 77 C9 47 27 25 60 25 Z" fill="#FFC21A" stroke="currentColor" stroke-width="7"/><ellipse cx="44" cy="71" rx="11" ry="9" fill="#fff"/><ellipse cx="76" cy="71" rx="11" ry="9" fill="#fff"/><circle cx="46" cy="72" r="6" fill="currentColor"/><circle cx="78" cy="72" r="6" fill="currentColor"/><path d="M32 60 L56 63 M64 63 L88 60" stroke="currentColor" stroke-width="6" stroke-linecap="round"/><path d="M48 95 Q60 106 72 95" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>`;
function page({ title, desc, path, body, og, scripts = "", head = "", type = "website", jsonld = null }) {
  const full = title === course.title ? `${course.title}: a free animated course on decision models` : `${title} · ${course.title}`;
  const ogImg = og || `${BASE}/img/og/og-default.png`;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${BASE}${path}">
<meta property="og:type" content="${type}"><meta property="og:title" content="${esc(full)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${BASE}${path}"><meta property="og:image" content="${ogImg}"><meta property="og:site_name" content="${esc(course.title)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(full)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${ogImg}">
<meta name="theme-color" content="#F4F0E6">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="text/plain" title="llms.txt" href="/llms.txt">
<link rel="preload" href="/fonts/Fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${V["css/fonts.css"]}"><link rel="stylesheet" href="${V["css/site.css"]}">
${head}
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head><body>
<a class="skip" href="#main">Skip to content</a>
<header class="nav"><div class="wrap nav-in">
  <a class="brandlink" href="/">${LOGO}<span>System One</span></a>
  <nav class="nav-links"><a href="/#lessons">Lessons</a><a href="/measured/">What we measured</a><a href="/agents/">For agents</a><a href="/sources/">Sources</a><a class="gh" href="${course.repo}" rel="noopener">GitHub</a></nav>
</div></header>
<main id="main">${body}</main>
<footer class="foot"><div class="wrap foot-in">
  <div><a class="brandlink" href="/">${LOGO}<span>System One</span></a><p>A free, open-source course. Content <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>, code MIT. Not affiliated with TypeSafe, OpenAI, Cloudflare or AWS.</p></div>
  <div class="foot-links"><a href="/#lessons">All lessons</a><a href="/measured/">What we measured</a><a href="/agents/">For agents</a><a href="/sources/">Sources</a><a href="/about/">How this was made</a><a href="/llms.txt">llms.txt</a><a href="${course.repo}">GitHub</a></div>
</div></footer>
<script src="${V["js/site.js"]}" defer></script>
${scripts}
</body></html>`;
}

// ---------- home ----------
const people = (() => {
  // names quoted on screen, in order of appearance
  const m = new Map();
  for (const l of ready) for (const sc of l.author.scenes) { const w = sc.template === "quote" ? sc.params.who : null; if (w && !/docs|unsiloed|hacker news/i.test(w)) for (const n of w.split(/\s*&\s*|\s+and\s+/)) if (n.split(/\s+/).length >= 2 && !m.has(n)) m.set(n, sc.params.role || ""); }
  for (const n of ["Simon Willison", "Shreya Shankar", "Mike Ramos", "IndyDevDan", "Amir Rafe", "Subasish Das", "Ryan Porter"]) if (!m.has(n)) m.set(n, "");
  return [...m.keys()];
})();
const lessonRow = (l) => l.ready
  ? `<a class="lrow" href="${url(l)}" data-lesson="${l.id}"><span class="lnum">${String(l.number).padStart(2, "0")}</span><span class="ltxt"><b>${esc(l.author.title)}</b><i>${esc(l.author.summary)}</i></span><span class="lmeta"><span class="ldone" aria-label="watched">✓</span>${fmtMin(l.timed.total)}</span></a>`
  : `<div class="lrow soon"><span class="lnum">${String(l.number).padStart(2, "0")}</span><span class="ltxt"><b>${esc(l.author?.title || l.title)}</b><i>Coming soon</i></span><span class="lmeta">—</span></div>`;
const B77 = facts.experiments.banking77, NEWS = facts.experiments.fresh_news, FAN = facts.experiments.fanout;
const home = page({
  title: course.title, path: "/", desc: course.description,
  jsonld: { "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.description, url: BASE + "/", isAccessibleForFree: true, inLanguage: "en", license: "https://creativecommons.org/licenses/by/4.0/", provider: { "@type": "Organization", name: "System One course (open source)", sameAs: course.repo }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: `PT${totalMin}M` }, hasPart: ready.map((l) => ({ "@type": "LearningResource", name: l.author.title, url: BASE + url(l) })) },
  body: `
<section class="hero"><div class="wrap hero-in">
  <div class="hero-txt">
    <div class="eyebrow">Free course · ${lessons.length} animated lessons · open source</div>
    <h1>Build software that <span class="mk">decides</span></h1>
    <p class="lede">Decision models like TypeSafe's Jev, OpenAI's Decisions API and Cloudflare's Clef answer typed questions with probabilities, in a quarter of a second, for a fraction of a cent. Learn what to ask them, which numbers to trust, and where they break, from ${srcs.length} sources and ${nCalls.toLocaleString("en-US")} API calls we ran ourselves.</p>
    <div class="cta"><a class="btn primary" href="${ready[0] ? url(ready[0]) : "#lessons"}">Start lesson 1 →</a><a class="btn" href="/agents/">Let your agent take it</a></div>
    <ul class="facts"><li><b>${ready.length ? totalMin + " min" : "—"}</b> of lessons</li><li><b>${srcs.length}</b> sources</li><li><b>0</b> sign-ups</li></ul>
  </div>
  <div class="hero-play"><div class="mini" id="mini" data-src="/data/${existsSync(join(STATIC, "data", "trailer.json")) ? "trailer" : ready[0]?.id}.json"><div class="stage"></div></div><p class="mini-cap">Not a video file: every lesson is animated live by code in your browser.</p></div>
</div></section>
<section class="band"><div class="wrap band-in">
  <div><h3>For developers</h3><p>Replace fragile prompt-and-parse calls with typed answers your code can branch on, and know which probabilities to trust.</p></div>
  <div><h3>For tech leads</h3><p>Where decision models fit next to code and LLMs, how to evaluate them on your own data, and where they fail.</p></div>
  <div><h3>For your agent</h3><p>Install the course as a skill, and your coding agent designs decision-model integrations the way the course teaches.</p></div>
</div></section>
<section id="lessons" class="wrap curriculum">
  <h2>The course</h2>
  <div class="progress-line"><span id="prog-txt">Your progress is saved in this browser.</span><div class="pbar"><i id="prog-bar"></i></div></div>
  ${course.modules.map((m, mi) => `<div class="module"><div class="mhead"><span class="mnum">Module ${mi + 1}</span><h3>${esc(m.title)}</h3><p>${esc(m.blurb)}</p></div><div class="lrows">${lessons.filter((l) => l.moduleIndex === mi).map(lessonRow).join("")}</div></div>`).join("")}
</section>
<section class="wrap measured-teaser">
  <div class="eyebrow">We didn't just read about it</div><h2>Measured for this course</h2>
  <p class="sub">Vendor numbers are upper bounds, so we ran our own tests from a server in Brazil. A few results:</p>
  <div class="mgrid">
    <div class="mcard"><b>${pct(B77["jev-1.13.0"].acc_ge_099)}</b><span>right on the half of 3,080 banking messages where Jev said ≥ 0.99 (${pct(B77["jev-1.13.0"].acc)} overall)</span></div>
    <div class="mcard"><b>${FAN.batched.median_latency_s.toFixed(2)} s</b><span>for 13 questions in one request, vs ${FAN.sequential.median_latency_s.toFixed(1)} s as 13 separate calls</span></div>
    <div class="mcard"><b>0 of ${facts.experiments.option_order.by_confidence.filter((b) => b.pmax_from >= 0.9).reduce((a, b) => a + b.n, 0).toLocaleString("en-US")}</b><span>answers above 0.9 changed when we reversed the 77 options; ${pct(facts.experiments.option_order.by_confidence[0].flip_rate, 0)} of those under 0.5 did</span></div>
  </div>
  <a class="btn" href="/measured/">Everything we measured →</a>
</section>
<section class="wrap agents-teaser">
  <div class="at-txt"><div class="eyebrow">Your agent can take this course too</div><h2>One course, two students</h2><p>The lessons double as agent skills. Install them and Claude Code, Codex, Cursor or any agent that reads skills will design decision-model calls the way the course teaches: typed questions, one request, thresholds from costs, code for the arithmetic.</p><a class="btn" href="/agents/">Agent setup →</a></div>
  <pre class="code-card"><span class="c">$</span> npx skills add ${REPO_SLUG}\n\n<span class="d"># or point any agent at the course</span>\n<span class="c">$</span> curl ${BASE}/llms.txt</pre>
</section>
<section class="wrap people">
  <h2>Built from the people building it</h2>
  <p class="sub">The TypeSafe, OpenAI, Cloudflare and AWS docs, ${nTalks} talks and podcasts, ${nPapers} papers, and essays and benchmarks from independent testers. <a href="/sources/">See all ${srcs.length} sources →</a></p>
  <div class="names">${people.slice(0, 40).map((n) => `<span>${esc(n)}</span>`).join("")}</div>
  <p class="fine">Not affiliated with or endorsed by any of the people or companies cited. Quotes link to the original source, at the exact moment for talks.</p>
</section>
<section class="wrap faq">
  <h2>Questions</h2>
  <details><summary>Is it really free?</summary><p>Yes. No sign-up, no paywall, no tracking cookies. The content is CC BY 4.0 and the code is MIT on <a href="${course.repo}">GitHub</a>.</p></details>
  <details><summary>Which decision models does it cover?</summary><p>TypeSafe's Jev, OpenAI's Decisions API, Cloudflare's Clef and Clef-flash, and AWS's open Strands Decider. They share one request shape, so the lessons apply to all of them. Most examples use Jev, because it's the one we measured most.</p></details>
  <details><summary>Do I need to know machine learning?</summary><p>No. If you can call an API and write an if statement, you can follow the course. The statistics you need (calibration, thresholds, margins of error) are explained from scratch.</p></details>
  <details><summary>Are these videos?</summary><p>Sort of. Each lesson is a scene graph rendered live by JavaScript and synced to narration, so it's tiny, crisp at any size, scrubbable and searchable. The narration is an AI voice. Every lesson also has a full transcript and a Markdown version.</p></details>
  <details><summary>Who made this, and how?</summary><p>It was researched, measured and produced with AI agents. Sources were distilled into quote-checked insights, every number shown on screen comes from a source or from our own runs, and the lessons are animated by code. <a href="/about/">Read how it was made</a>.</p></details>
  <details><summary>I found a mistake.</summary><p>Please <a href="${course.repo}/issues">open an issue</a>. Every claim links to its source, so corrections are easy to check.</p></details>
</section>`,
  scripts: `${ENGINE}<link rel="stylesheet" href="${V["css/lesson.css"]}">`,
});
writeFileSync(join(DIST, "index.html"), home);

// ---------- lesson pages ----------
for (const [k, l] of lessons.entries()) {
  if (!l.ready) continue;
  const a = l.author, t = l.timed;
  const prev = lessons.slice(0, k).reverse().find((x) => x.ready), next = lessons.slice(k + 1).find((x) => x.ready);
  const nextAny = lessons[k + 1];
  const srcsL = lessonSources(l);
  const mdUrl = `${BASE}/lessons/${l.slug}.md`;
  const askText = `I'm taking the free System One course on decision models. Read lesson ${l.number}, "${a.title}": ${mdUrl}\n\nThen quiz me on it with 3 questions, one at a time, and help me apply it to a project I'm working on.`;
  const ex = t.scenes.find((s) => s.template === "exercise");
  let chap = null;
  const transcript = t.scenes.map((sc, i) => {
    let h = "";
    if (sc.chapter && sc.chapter !== chap) { chap = sc.chapter; h = `<h4>${esc(chap)}</h4>`; }
    return `${h}<p class="tr-p" data-t="${sc.start}" data-i="${i}"><button class="tr-t" data-seek="${sc.start}">${fmtT(sc.start)}</button>${esc(sc.narration)}</p>`;
  }).join("");
  const body = `
<div class="wrap lesson">
  <div class="crumbs"><a href="/#lessons">Course</a><span>›</span><span>Module ${l.moduleIndex + 1}: ${esc(l.module.title)}</span><span>›</span><span>Lesson ${l.number}</span></div>
  <h1 class="ltitle">${esc(a.title)}</h1>
  <div id="player" class="player-host" data-src="/data/${l.id}.json" data-audio="${t.audio}" data-id="${l.id}" data-next="${next ? url(next) : "/agents/"}" data-next-title="${next ? esc(next.author.title) : "let your agent take the course"}"${next ? "" : ' data-last="1"'}></div>
  <noscript><p class="nojs">This lesson is animated with JavaScript. Read the <a href="/lessons/${l.slug}.md">text version</a>.</p></noscript>
  <div class="actions">
    ${prev ? `<a class="btn small" href="${url(prev)}">← ${String(prev.number).padStart(2, "0")}</a>` : ""}
    <button class="btn small" id="mark-done" type="button">Mark as done</button>
    <a class="btn small" href="https://claude.ai/new?q=${encodeURIComponent(askText)}" target="_blank" rel="noopener">Ask Claude about it</a>
    <a class="btn small" href="https://chatgpt.com/?q=${encodeURIComponent(askText)}" target="_blank" rel="noopener">Ask ChatGPT</a>
    <a class="btn small ghost" href="/lessons/${l.slug}.md">Markdown</a>
    <button class="btn small ghost" id="share" type="button" data-url="${BASE}${url(l)}" data-title="${esc(a.title)}">Share</button>
    ${next ? `<a class="btn small primary right" href="${url(next)}">Next: ${esc(next.author.title)} →</a>` : nextAny ? `<span class="btn small ghost right">Next: ${esc(nextAny.author?.title || nextAny.title)} (soon)</span>` : ""}
  </div>
  <div class="lgrid">
    <article class="lmain">
      <p class="lsum">${esc(a.summary)}</p>
      <section><h2>Key takeaways</h2><ul class="tk">${(a.takeaways || []).map((x) => `<li>${inline(x)}</li>`).join("")}</ul></section>
      ${ex ? `<section class="tryit"><h2>Try it with your agent</h2><p>${esc(ex.params.intro || "")}</p><div class="code-card copyable"><button class="copy" type="button">Copy</button><pre>${esc(unwrap(ex.params.prompt))}</pre></div></section>` : ""}
      <section><h2>Transcript</h2><div class="transcript">${transcript}</div></section>
    </article>
    <aside class="lside">
      <section><h3>Sources cited</h3><ul class="srcs">${srcsL.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener"><b>${esc(s.who || KIND[s.kind] || "")}</b><span>${esc(s.title)}</span>${s.times.length ? `<i>${s.times.map(fmtT).join(" · ")}</i>` : ""}</a></li>`).join("")}</ul></section>
      ${a.practices?.length ? `<section><h3>What your agent learns</h3><ul class="pr">${a.practices.map((x) => `<li>${inline(x)}</li>`).join("")}</ul><a class="more" href="/agents/">Install the course skills →</a></section>` : ""}
      <section><h3>Module ${l.moduleIndex + 1}</h3><ol class="mlist">${lessons.filter((x) => x.moduleIndex === l.moduleIndex).map((x) => x.ready ? `<li class="${x.id === l.id ? "cur" : ""}"><a href="${url(x)}" data-lesson="${x.id}">${esc(x.author.title)}</a></li>` : `<li class="soon">${esc(x.author?.title || x.title)}</li>`).join("")}</ol></section>
    </aside>
  </div>
</div>`;
  const html = page({
    title: a.title, path: url(l), desc: a.summary, type: "article", body, og: existsSync(join(STATIC, "img/og", l.slug + ".png")) ? `${BASE}/img/og/${l.slug}.png` : null,
    jsonld: { "@context": "https://schema.org", "@type": "LearningResource", name: a.title, description: a.summary, url: BASE + url(l), isAccessibleForFree: true, inLanguage: "en", timeRequired: `PT${Math.round(t.total / 60)}M`, isPartOf: { "@type": "Course", name: course.title, url: BASE + "/" }, learningResourceType: "Lesson", teaches: (a.takeaways || []).map(md2txt), license: "https://creativecommons.org/licenses/by/4.0/" },
    head: `<link rel="stylesheet" href="${V["css/lesson.css"]}"><link rel="alternate" type="text/markdown" href="/lessons/${l.slug}.md"><link rel="preload" as="fetch" href="/data/${l.id}.json" crossorigin>`,
    scripts: `${ENGINE}<script src="${V["js/player.js"]}" defer></script><script src="${V["js/lesson-page.js"]}" defer></script>`,
  });
  mkdirSync(join(DIST, "lessons", l.slug), { recursive: true });
  writeFileSync(join(DIST, "lessons", l.slug, "index.html"), html);
  writeFileSync(join(DIST, "lessons", l.slug + ".md"), lessonMarkdown(l));
}

// ---------- sources page ----------
const citedBy = new Map();
for (const l of ready) for (const s of lessonSources(l)) { if (!citedBy.has(s.id)) citedBy.set(s.id, []); citedBy.get(s.id).push(l); }
const srcList = srcs.slice().sort((a, b) => (citedBy.get(b.id)?.length || 0) - (citedBy.get(a.id)?.length || 0) || String(a.title).localeCompare(String(b.title)));
mkdirSync(join(DIST, "sources"), { recursive: true });
writeFileSync(join(DIST, "sources", "index.html"), page({
  title: "Sources", path: "/sources/", desc: `The ${srcs.length} docs, talks, papers and articles this course was distilled from.`,
  body: `<div class="wrap prose"><h1>Sources</h1><p class="lede">The course was distilled from ${nDocs} pages of vendor docs and cookbooks, ${nTalks} talks and podcasts, ${nPapers} papers, and ${nWritten} articles, repositories and discussions. Quotes in the lessons link to the exact moment in each talk. Not affiliated with or endorsed by anyone listed.</p>
  <div class="srcgrid">${srcList.map((s) => { const si = sourceInfo({ id: s.id }); return `<a class="srccard" href="${esc(si.url)}" target="_blank" rel="noopener"><span class="kind">${KIND[s.kind] || s.kind}</span><b>${esc(si.title)}</b><span class="who">${esc(si.who)}</span>${citedBy.get(s.id) ? `<span class="cited">Cited in ${citedBy.get(s.id).map((l) => "lesson " + l.number).join(", ")}</span>` : ""}</a>`; }).join("")}</div></div>`,
}));

// ---------- what we measured ----------
const E = facts.experiments;
const row = (name, r, note = "") => `<tr><td>${name}</td><td>${r.n.toLocaleString("en-US")}</td><td>${pct(r.acc)}</td><td>${r.ece.toFixed(3)}</td><td>${r.share_ge_099 ? pct(r.share_ge_099, 1) : "—"}</td><td>${r.acc_ge_099 != null ? pct(r.acc_ge_099) : "—"}</td><td>${r.lat_median_s.toFixed(2)} s</td><td>$${r.usd_per_1000_decisions.toFixed(3)}</td><td>${note}</td></tr>`;
const head7 = `<tr><th>Model</th><th>n</th><th>Accuracy</th><th>ECE</th><th>Answers ≥ 0.99</th><th>Right when ≥ 0.99</th><th>Median latency</th><th>$ / 1,000</th><th></th></tr>`;
const ctf = existsSync(join(ROOT, "experiments/results/e10_counterfactual.json")) ? JSON.parse(readFileSync(join(ROOT, "experiments/results/e10_counterfactual.json"), "utf8")) : null;
mkdirSync(join(DIST, "measured"), { recursive: true });
writeFileSync(join(DIST, "measured", "index.html"), page({
  title: "What we measured", path: "/measured/", desc: "Original measurements behind the System One course: accuracy, calibration, latency and cost of decision models on public and fresh data.",
  body: `<div class="wrap prose wide"><h1>What we measured</h1>
  <p class="lede">Vendor benchmarks are upper bounds. So for this course we ran our own tests: ${nCalls.toLocaleString("en-US")} API calls from a server in Campinas, Brazil, on ${esc(facts.measured)}. Latencies include the network round trip. The code is in the <a href="${course.repo}/tree/main/experiments">repository</a>, so you can rerun everything.</p>
  <h2>BANKING77: 3,080 real support messages, 77 intents</h2>
  <p>One Choice question per message, with the 77 intent names as options. BANKING77 has been public since 2020, so it may be in some models' training data.</p>
  <div class="tbl"><table>${head7}${row("Jev 1.13", E.banking77["jev-1.13.0"])}${row("Jev 1.14", E.banking77["jev-1.14.0"])}${row("Jev 1.13, options reversed", E.banking77["jev-1.13.0_reversed_options"])}${row("Clef-flash (Cloudflare)", E.banking77["clef-flash"], "public test set; see below")}${row("Claude Haiku 5.5, stated confidence (subset)", E.banking77["claude-haiku-5.5_verbalized_subset616"], "JSON answer, 616-message stratified subset")}</table></div>
  <p>Clef-flash's 96% was the best score we saw, and it may also be the least informative: BANKING77 has been public since 2020, and it's one of the benchmarks Cloudflare reports for Clef. That's why we built a fresh test.</p>
  <h2>Fresh news: ${E.fresh_news["jev-1.13.0"].n} stories published after every model's release</h2>
  <p>279 Guardian stories published between September 30 and October 9, 2026, after every model's release, in 8 sections. An answer counts as right if the publisher filed the story in that section. Sections overlap, so some “errors” are defensible.</p>
  <div class="tbl"><table>${head7}${row("Jev 1.13", E.fresh_news["jev-1.13.0"])}${row("Jev 1.14", E.fresh_news["jev-1.14.0"])}${E.fresh_news["claude-haiku-5.5_verbalized"] ? row("Claude Haiku 5.5, stated confidence", E.fresh_news["claude-haiku-5.5_verbalized"]) : ""}</table></div>
  <p>On fresh data the LLM's stated confidence was better calibrated than Jev's probabilities, though it almost never said 0.99. Calibration has to be measured per model and per task.</p>
  <h2>Option order</h2>
  <p>We reversed the 77 options and asked again. ${E.option_order.flips} of ${E.option_order.n.toLocaleString("en-US")} answers changed (${pct(E.option_order.flip_rate)}), almost all of them low-confidence:</p>
  <div class="tbl"><table><tr><th>Top probability</th><th>Answers</th><th>Changed</th></tr>${E.option_order.by_confidence.map((b) => `<tr><td>${b.pmax_from}–${b.pmax_to}</td><td>${b.n}</td><td>${b.flips} (${pct(b.flip_rate, 1)})</td></tr>`).join("")}</table></div>
  <h2>One request vs many</h2>
  <p>One support state of about 1,800 tokens (a ticket, the customer record and a 745-word policy) and 13 questions. Medians of 5 runs each.</p>
  <div class="tbl"><table><tr><th>How</th><th>Median latency</th><th>Input tokens</th></tr><tr><td>13 questions, one request</td><td>${FAN.batched.median_latency_s.toFixed(3)} s</td><td>${FAN.batched.input_tokens.toLocaleString("en-US")}</td></tr><tr><td>13 requests in sequence</td><td>${FAN.sequential.median_latency_s.toFixed(3)} s</td><td>${FAN.sequential.input_tokens.toLocaleString("en-US")}</td></tr><tr><td>13 requests in parallel</td><td>${FAN.concurrent.median_latency_s.toFixed(3)} s</td><td>${FAN.concurrent.input_tokens.toLocaleString("en-US")}</td></tr></table></div>
  <p>Answers differed by at most ${FAN.max_answer_spread_across_runs} across runs.</p>
  <h2>Jagged edges</h2>
  <ul><li>Counting fruits in a list of 12 words in one question: answered ${esc(E.jagged.count_items_one_question.answers.fruit_count.choice)} (p = ${E.jagged.count_items_one_question.answers.fruit_count.probabilities[E.jagged.count_items_one_question.answers.fruit_count.choice]}); the truth is 6. One Noul per word, summed in code: 6.</li>
  <li>Whether four costs add up to a claimed total (they don't): ${E.jagged.arithmetic.answers.sums.noul}. Whether an invoice was paid within 30 days (it took 32): ${E.jagged.dates.answers.on_time.noul}.</li>
  <li>An injected “SYSTEM NOTE TO CLASSIFIER” didn't hide a real threat: ${E.jagged.injection.answers.threat.noul}. Don't build on that; see lesson 16.</li></ul>
  ${ctf ? `<h2>Name-swap audit</h2><p>12 candidate summaries for a backend job, each sent with no name and as Emily Walsh, Greg Baker, Lakisha Washington and Jamal Jones (${ctf.results.length} requests, ${esc(ctf.model)}). The largest change in any one answer was ${Math.max(...ctf.candidates.map((_, i) => { const v = ctf.results.filter((r) => r.cand === i).map((r) => r.interview); return Math.max(...v) - Math.min(...v); })).toFixed(2)} on “should we interview?”, and no decision flipped. That is one test of one attribute on made-up candidates, not evidence of fairness; see lesson 21.</p>` : ""}
  <h2>Capstone pipeline</h2>
  <p>The triage pipeline from lesson 22 is in <a href="${course.repo}/tree/main/capstone">capstone/</a>. Its first run routed 14 of 24 tickets the way we labeled them; after fixing three questions, 24 of 24, and 12 of 12 on tickets written before the fix. All 36 tickets were written by us, so treat that as a smoke test.</p>
  <h2>Caveats</h2>
  <ul><li>Latency includes the network round trip from Brazil; vendors quote model time.</li><li>Costs use list prices on ${esc(facts.measured)}: ${Object.entries(facts.prices_usd_per_m_input).map(([k, v]) => `${k} $${v}/M input tokens`).join(", ")}.</li><li>Some cloud runs were cut short by free-tier quotas; tables show the n we actually have.</li></ul></div>`,
}));

// ---------- agents page ----------
mkdirSync(join(DIST, "agents"), { recursive: true });
writeFileSync(join(DIST, "agents", "index.html"), page({
  title: "For agents", path: "/agents/", desc: "Let your coding agent take the System One course: install it as skills, or read the course as Markdown and llms.txt.",
  body: `<div class="wrap prose"><h1>For agents</h1><p class="lede">Every lesson is also written for machines. Your coding agent can learn the same practices you do, or teach you the course right in your terminal.</p>
  <h2>1. Install the course as skills</h2><p>Works with Claude Code, Codex, Cursor, OpenCode and any agent that supports <a href="https://agentskills.io">Agent Skills</a>.</p>
  <div class="code-card copyable"><button class="copy" type="button">Copy</button><pre>npx skills add ${REPO_SLUG}</pre></div>
  <p>In Claude Code you can also add it as a plugin marketplace:</p>
  <div class="code-card copyable"><button class="copy" type="button">Copy</button><pre>/plugin marketplace add ${REPO_SLUG}
/plugin install system-one@system-one</pre></div>
  <p>This installs three skills: <b>decision-models</b>, the practices from the course that your agent applies whenever it writes a decision-model call (typed questions, one request, thresholds from costs, select don't generate, code for arithmetic); <b>system-one-tutor</b>, which teaches you the course interactively (try <code>teach me lesson 1 of system one</code>); and <b>decision-audit</b>, which finds prompt-and-parse LLM calls in your codebase that should be decisions, and reviews existing decision-model integrations (try <code>audit our LLM decisions</code>).</p>
  <h2>2. Read the course directly</h2>
  <ul><li><a href="/llms.txt">/llms.txt</a>: index of every lesson in Markdown</li><li><a href="/llms-full.txt">/llms-full.txt</a>: the entire course in one file</li><li><code>/lessons/&lt;slug&gt;.md</code>: one lesson, with transcript, takeaways, practices and sources</li><li><a href="/api/course.json">/api/course.json</a>: structured course data</li></ul>
  <h2>3. Paste this into any agent</h2>
  <div class="code-card copyable"><button class="copy" type="button">Copy</button><pre>Read ${BASE}/llms.txt and teach me the System One course on decision
models, one lesson at a time. After each lesson, quiz me and help me
apply it to the project in this directory.</pre></div></div>`,
}));

// ---------- about ----------
mkdirSync(join(DIST, "about"), { recursive: true });
writeFileSync(join(DIST, "about", "index.html"), page({
  title: "How this course was made", path: "/about/", desc: "How the System One course was researched, measured, written and animated, mostly by AI agents.",
  body: `<div class="wrap prose"><h1>How this course was made</h1>
  <p class="lede">A course about models that make judgments, built with models that make judgments. Here's the pipeline, so you can decide what to trust.</p>
  <ol>
  <li><b>Sources.</b> We collected the TypeSafe, OpenAI, Cloudflare and AWS documentation and cookbooks, ${nTalks} talks and podcasts (transcripts fetched in English), ${nPapers} papers, and articles, benchmarks and Hacker News threads from independent testers: ${srcs.length} sources in all.</li>
  <li><b>Distillation.</b> A model read every source and extracted specific, citable insights, each with a verbatim quote (and a timestamp for talks). Quotes were automatically checked against the source text.</li>
  <li><b>Measurement.</b> We ran our own experiments (${nCalls.toLocaleString("en-US")} API calls) so the course wouldn't depend on vendor numbers: see <a href="/measured/">what we measured</a>. Every answer shown on screen in a lesson is a real answer, labeled with the model that gave it.</li>
  <li><b>Writing.</b> Lessons were written by Claude from those insights and measurements, and every number and quote was checked against its source before narration.</li>
  <li><b>Animation.</b> Lessons are not video files. Each one is a list of scenes rendered live by a small JavaScript engine, synced word by word to the narration, with motion rules borrowed from character animation: springs by feel, a camera that only moves for a reason, and a stepped cast.</li>
  <li><b>Narration.</b> The voice is an AI voice (ElevenLabs).</li>
  </ol>
  <p>Mistakes are possible. If you spot one, <a href="${course.repo}/issues">open an issue</a> with the lesson and timestamp. The engine, lessons, experiments and build are all on <a href="${course.repo}">GitHub</a>.</p></div>`,
}));

// ---------- 404 ----------
writeFileSync(join(DIST, "404.html"), page({ title: "Not found", path: "/404", desc: "Page not found.", body: `<div class="wrap prose"><h1>p(page exists) = 0.01</h1><p class="lede">That page doesn't exist. <a href="/">Back to the course</a>.</p></div>` }));

// ---------- llms.txt, llms-full.txt, api, sitemap, robots ----------
const llms = [`# ${course.title}`, "", `> ${course.description}`, "", "Each lesson below is a Markdown file with a summary, key takeaways, practices for coding agents, a full transcript and cited sources (talks link to exact timestamps). Content is CC BY 4.0.", "", "## Lessons", ""];
course.modules.forEach((m, mi) => { llms.push(`### Module ${mi + 1}: ${m.title}`, ""); lessons.filter((l) => l.moduleIndex === mi && l.ready).forEach((l) => llms.push(`- [Lesson ${l.number}: ${l.author.title}](${BASE}/lessons/${l.slug}.md): ${l.author.summary}`)); llms.push(""); });
llms.push("## For agents", "", `- [Install as agent skills](${BASE}/agents/): \`npx skills add ${REPO_SLUG}\``, `- [Full course in one file](${BASE}/llms-full.txt)`, `- [Structured course data](${BASE}/api/course.json)`, "", "## Optional", "", `- [What we measured](${BASE}/measured/): original accuracy, calibration, latency and cost results`, `- [All sources](${BASE}/sources/): ${srcs.length} docs, talks, papers and articles`, `- [Source code](${course.repo})`, "");
writeFileSync(join(DIST, "llms.txt"), llms.join("\n"));
writeFileSync(join(DIST, "llms-full.txt"), `# ${course.title}\n\n> ${course.description}\n\n` + ready.map(lessonMarkdown).join("\n---\n\n"));
mkdirSync(join(DIST, "api"), { recursive: true });
writeFileSync(join(DIST, "api", "course.json"), JSON.stringify({ title: course.title, url: BASE, description: course.description, license: "CC-BY-4.0", modules: course.modules.map((m, mi) => ({ title: m.title, lessons: lessons.filter((l) => l.moduleIndex === mi).map((l) => l.ready ? { number: l.number, title: l.author.title, url: BASE + url(l), markdown: `${BASE}/lessons/${l.slug}.md`, minutes: Math.round(l.timed.total / 60), summary: l.author.summary, takeaways: (l.author.takeaways || []).map(md2txt), practices: (l.author.practices || []).map(md2txt) } : { number: l.number, title: l.author?.title || l.title, status: "coming soon" }) })) }, null, 1));
const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["/", "/measured/", "/agents/", "/sources/", "/about/", ...ready.map(url)].map((p) => `<url><loc>${BASE}${p}</loc><lastmod>${today}</lastmod></url>`).join("\n")}\n</urlset>\n`);
writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${BASE}/sitemap.xml\n`);
writeFileSync(join(DIST, "_headers"), `/data/*\n  Cache-Control: public, max-age=3600\n/audio/*\n  Cache-Control: public, max-age=86400\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n/*.md\n  Content-Type: text/markdown; charset=utf-8\n  Access-Control-Allow-Origin: *\n/llms.txt\n  Access-Control-Allow-Origin: *\n/llms-full.txt\n  Access-Control-Allow-Origin: *\n/api/*\n  Access-Control-Allow-Origin: *\n`);
console.log(JSON.stringify({ base: BASE, lessons_ready: ready.length, lessons_total: lessons.length, minutes: totalMin, sources: srcs.length, calls: nCalls }));
