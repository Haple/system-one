// Scene templates, part 1: the general explainer set (ported from Agentic Engineering onto the System One motion
// language). Each template is (S, params) => builds DOM into S.cam and schedules tweens on S.tl (smooth) and
// S.cast (the stepped cast). Directing hooks: S.want("punch"|"push"|"reveal", t, el, prio), S.focusEl, S.still.
(function () {
  "use strict";
  const A = window.S1_ART, { E, F } = window.S1M;
  const T = {};
  const fmtT = (s) => { s = Math.round(s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };
  const lenClass = (s, a, b) => (String(s || "").length > b ? "s" : String(s || "").length > a ? "m" : "l");
  const isChar = (w) => A.CHARS.includes(w);
  T.defaultBg = (name) => ({ title: "grid", quiz: "grid", recap: "grid", systems: "paper", outro: "grid" }[name] || "paper");
  T._h = { fmtT, lenClass, isChar };

  // ---------------- title ----------------
  T.title = (S, p) => {
    const L = S.L.data;
    const root = S.add(`<div class="ti">
      <div class="ti-text">
        <div class="ti-kick"><span class="chip">${S.esc(p.kicker || "Lesson " + L.number)}</span>${p.module ? `<span class="ti-mod">${S.esc(p.module)}</span>` : ""}</div>
        <h1 class="ti-h">${S.md(p.title || L.title)}</h1>
        ${p.subtitle ? `<p class="ti-sub">${S.md(p.subtitle)}</p>` : ""}
      </div>
      <div class="ti-art"></div>
    </div>`);
    const art = root.querySelector(".ti-art");
    const cast = (p.cast || ["snap"]).map((c, k) => { const o = typeof c === "string" ? { who: c } : c; return { ...o, n: S.actor(art, o.who, { size: Math.round((S.portrait ? 250 : 290) * (o.scale || (k ? 0.86 : 1))), mood: o.mood || "normal" }) }; });
    const t = S.t0;
    S.slideL(t + 0.05, root.querySelector(".ti-kick"));
    S.words(t + 0.2, root.querySelector(".ti-h"), 0.07);
    if (p.subtitle) S.rise(t + 0.95, root.querySelector(".ti-sub"));
    cast.forEach((c, k) => { S.hopIn(t + 0.5 + k * 0.2, c.n, { h: 80 + k * 25 }); if (c.react) S.react(S.cue(c.react.at, 0.55), c.n, c.react.mood); });
    if (p.bubble) { const b = S.add(`<div class="bubble">${S.esc(p.bubble)}</div>`, art); S.pop(S.cue(p.bubble_at, 0.42), b, { from: 0.5, rot: -6 }); }
    S.marks(root, t + 1.4, t + 1.2);
    S.want("reveal", t + 0.1, art);
  };

  // ---------------- statement ----------------
  T.statement = (S, p) => {
    const txt = String(p.text || "");
    const size = p.size || (txt.length > 90 ? "s" : txt.length > 55 ? "m" : txt.length > 28 ? "l" : "xl");
    const who = isChar(p.art) ? p.art : null;
    const root = S.add(`<div class="stm align-${p.align || "left"} ${p.art ? "has-art" : ""}">
      <div class="stm-text">${p.eyebrow ? `<div class="eyebrow">${S.esc(p.eyebrow)}</div>` : ""}<h2 class="stm-h size-${size}">${S.md(txt)}</h2>${p.sub ? `<p class="stm-sub">${S.md(p.sub)}</p>` : ""}</div>
      ${p.art ? `<div class="stm-art tone-${p.tone || "agent"}">${who ? "" : `<span class="st-ico">${A.icon(p.art, S.portrait ? 150 : 190)}</span>`}</div>` : ""}
    </div>`);
    const t = S.cue(p.at, 0.0);
    if (p.eyebrow) S.slideL(t, root.querySelector(".eyebrow"));
    const h2 = root.querySelector(".stm-h");
    if (p.sync === false) S.words(t + 0.1, h2, 0.06); else S.say(h2, t + 0.05);
    S.marks(h2, t + 0.8, t + 0.2);
    if (p.sub) S.rise(S.cue(p.sub_at, 0.5), root.querySelector(".stm-sub"));
    if (who) { const n = S.actor(root.querySelector(".stm-art"), who, { size: S.portrait ? 240 : 290, mood: p.mood || "normal" }); S.hopIn(t + 0.25, n); if (p.react) S.react(S.cue(p.react.at, 0.6), n, p.react.mood); }
    else if (p.art) S.pop(t + 0.3, root.querySelector(".stm-art"), { from: 0.6 });
    S.focusEl = h2;
    if (p.punch) S.want("punch", S.cueEnd(p.punch, 0.5) + 0.05, root.querySelector(".mk") || h2, p.prio || 1);
  };

  // ---------------- quote ----------------
  T.quote = (S, p) => {
    const who = p.who || "";
    const initials = who.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    const root = S.add(`<figure class="qt">
      <div class="qt-mark">&ldquo;</div>
      <blockquote class="qt-text size-${lenClass(p.text, 90, 170)}">${S.md(p.text)}</blockquote>
      <figcaption class="qt-cap"><span class="qt-av">${S.esc(initials)}</span><span class="qt-who"><b>${S.esc(who)}</b>${p.role ? `<i>${S.esc(p.role)}</i>` : ""}</span>
      ${p.src ? `<span class="qt-src">${A.icon("eye", 26)}<span>${S.esc(p.src)}${p.t != null ? " &middot; " + fmtT(p.t) : ""}</span></span>` : ""}</figcaption>
    </figure>`);
    const t = S.cue(p.at, 0.02);
    S.pop(t, root.querySelector(".qt-mark"), { from: 0.5, rot: -10 });
    const bq = root.querySelector(".qt-text");
    if (p.sync === false) S.words(t + 0.2, bq, 0.045); else S.say(bq, t + 0.15);
    S.rise(t + 0.6, root.querySelector(".qt-cap"));
    S.marks(bq, t + 1.2, t + 0.4);
    S.focusEl = bq;
  };

  // ---------------- terminal ----------------
  const PFX = { cmd: "$", you: "&rsaquo;", agent: "&#9679;", tool: "&#9135;", ok: "&#10003;", err: "&#10007;", warn: "!", add: "+", del: "&minus;", out: "", dim: "", blank: "" };
  T.terminal = (S, p) => {
    const lines = p.lines || [];
    const root = S.add(`<div class="term ${p.wide ? "wide" : ""}">
      <div class="term-bar"><i></i><i></i><i></i><span>${S.esc(p.title || "~/project")}</span></div>
      <div class="term-body"><div class="term-scroll"></div></div>
    </div>`);
    if (p.caption) S.add(`<div class="term-cap">${S.md(p.caption)}</div>`);
    const scroll = root.querySelector(".term-scroll");
    S.set(S.t0, root, {}); // the frame is there from the cut
    if (p.caption) S.rise(S.cue(p.caption_at, 0.1), S.cam.querySelector(".term-cap"));
    const times = S.spread(lines, 0.05, 0.85);
    const LH = S.portrait ? 50 : 56, maxV = p.max || (S.portrait ? 18 : 12);
    let last = S.t0 + 0.3;
    lines.forEach((ln, k) => {
      const kind = ln.k || "out";
      const el = S.h(`<div class="tl k-${kind}"><span class="pfx">${PFX[kind] ?? ""}</span><span class="tx"></span></div>`);
      scroll.appendChild(el);
      const tx = el.querySelector(".tx");
      const t = Math.max(times[k], last + 0.1);
      if ((kind === "cmd" || kind === "you") && p.typing !== false) { S.fade(t, el, 0.1); last = S.type(t + 0.06, tx, ln.text, kind === "you" ? 60 : 34); }
      else { tx.innerHTML = S.md(ln.text || ""); S.enter(t, el, { y: 8, d: 0.22 }); last = t + 0.08; }
      if (k >= maxV) S.to(t, scroll, { y: -(k - maxV + 1) * LH, duration: 0.28 });
    });
    S.still = true;
  };

  // ---------------- code (with optional diff + highlights) ----------------
  const KW = /\b(const|let|var|function|return|if|elif|else|for|while|import|from|export|default|class|def|async|await|new|true|false|null|None|True|False|try|catch|except|raise|throw|in|of|with|as|yield|lambda|type|interface|public|private|and|or|not)\b/g;
  function S_esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function hl(line, lang) {
    if (lang === "md" || lang === "text") return S_esc(line).replace(/^(#{1,6} .*)$/, '<span class="c-h">$1</span>').replace(/(`[^`]+`)/g, '<span class="c-s">$1</span>').replace(/^(\s*[-*] )/, '<span class="c-k">$1</span>');
    if (lang === "json") return S_esc(line).replace(/(&quot;[^&]*?&quot;)(\s*:)/g, '<span class="c-k">$1</span>$2').replace(/(:\s*)(&quot;.*?&quot;)/g, '$1<span class="c-s">$2</span>').replace(/(:\s*)(-?\d+(\.\d+)?)/g, '$1<span class="c-n">$2</span>');
    const out = []; let rest = line;
    const m = rest.match(/(\/\/.*|#(?!!).*|--\s.*)$/);
    let comment = "";
    if (m && !/["'`].*(\/\/|#).*["'`]/.test(rest.slice(0, m.index + 2))) { comment = m[0]; rest = rest.slice(0, m.index); }
    rest = S_esc(rest).replace(/(&quot;.*?&quot;|'[^']*'|`[^`]*`)/g, "\u0001$1\u0002").replace(KW, (k) => `\u0003${k}\u0004`).replace(/\b(\d+(\.\d+)?)\b/g, "\u0005$1\u0006");
    rest = rest.replace(/\u0001/g, '<span class="c-s">').replace(/\u0003/g, '<span class="c-k">').replace(/\u0005/g, '<span class="c-n">').replace(/[\u0002\u0004\u0006]/g, "</span>");
    out.push(rest);
    if (comment) out.push(`<span class="c-c">${S_esc(comment)}</span>`);
    return out.join("");
  }
  T._hl = hl;
  T.code = (S, p) => {
    const lines = (p.lines || String(p.code || "").split("\n"));
    const lang = p.lang || "py";
    const rows = lines.map((l, i) => {
      let cls = "", body = l;
      if (p.diff && /^\+/.test(l)) { cls = "d-add"; body = l.slice(1); } else if (p.diff && /^-/.test(l)) { cls = "d-del"; body = l.slice(1); } else if (p.diff && /^ /.test(l)) body = l.slice(1);
      return `<div class="cl ${cls}"><span class="ln">${p.diff ? (cls === "d-add" ? "+" : cls === "d-del" ? "&minus;" : "") : i + 1}</span><span class="cx">${hl(body, lang) || "&nbsp;"}</span></div>`;
    }).join("");
    const root = S.add(`<div class="code ${p.diff ? "is-diff" : ""}">
      <div class="code-bar">${A.icon("file", 26)}<span class="fname">${S.esc(p.file || "untitled")}</span>${p.badge ? `<span class="badge">${S.esc(p.badge)}</span>` : ""}</div>
      <div class="code-body"><div class="code-hls"></div>${rows}</div>
    </div>`);
    if (p.caption) S.add(`<div class="term-cap">${S.md(p.caption)}</div>`);
    const maxLen = Math.max(...lines.map((l) => String(l).length));
    // portrait: long lines wrap with a hanging indent at a readable size instead of shrinking to fit
    const wrap = S.portrait && maxLen > 46;
    if (wrap) root.classList.add("wrap");
    else if (S.portrait && maxLen > 40) root.style.setProperty("--code-fs", Math.max(21, (25 * 40) / maxLen).toFixed(1) + "px");
    else if (!S.portrait && maxLen > 70) root.style.setProperty("--code-fs", Math.max(20, (30 * 70) / maxLen).toFixed(1) + "px");
    if (lines.length > 14 && !wrap) root.style.setProperty("--code-lh", Math.max(34, Math.floor((S.portrait ? 1100 : 690) / lines.length)) + "px");
    S.set(S.t0, root, {});
    const cls = root.querySelectorAll(".cl");
    const tLines = S.cue(p.at, 0.03) + 0.15;
    const gap = Math.min(0.1, (S.dur * 0.4) / Math.max(1, cls.length));
    cls.forEach((c, k) => S.enter(tLines + k * gap, c, { x: -12, y: 0, d: 0.25 }));
    if (p.caption) S.rise(S.cue(p.caption_at, 0.15), S.cam.querySelector(".term-cap"));
    // bands are measured from the laid-out lines (works when lines wrap or the line height changes)
    const span = (x) => { const a = cls[Math.max(0, x.from - 1)], b = cls[Math.min(cls.length, x.to) - 1] || a; return [a.offsetTop, b.offsetTop + b.offsetHeight - a.offsetTop]; };
    const textRight = (x) => { let m = 0; for (let i = x.from - 1; i < Math.min(cls.length, x.to); i++) { const c = cls[i], cx = c.querySelector(".cx"); if (cx && cx.textContent.trim()) m = Math.max(m, c.offsetLeft + cx.offsetLeft + cx.offsetWidth); } return m; };
    const bands = (p.hl || []).map((x, k) => {
      const [top, h] = span(x);
      const band = S.h(`<div class="hlb tone-${x.tone || "agent"}" style="top:${top}px;height:${h}px">${x.label ? `<span class="hlb-l">${S.esc(x.label)}</span>` : ""}</div>`);
      root.querySelector(".code-hls").appendChild(band);
      return { x, k, band, th: S.cue(x.at, 0.45 + k * 0.15) };
    });
    // a label that would sit on top of code moves to a legend under the card (always in portrait)
    const clash = bands.some(({ x, band }) => { const l = band.querySelector(".hlb-l"); return l && l.offsetLeft < textRight(x) + 18; });
    const legend = (S.portrait || clash) && bands.some((b) => b.x.label) ? S.add(`<div class="hl-legend"></div>`) : null;
    bands.forEach(({ x, band, th }) => {
      if (legend) band.querySelector(".hlb-l")?.remove();
      gsap.set(band, { transformOrigin: "0% 50%" });
      S.enter(th, band, { x: 0, y: 0, d: 0.3 }); S.tl.fromTo(band, { scaleX: 0.15 }, { scaleX: 1, duration: 0.4, ease: E.out, immediateRender: false }, th);
      if (legend && x.label) { const chip = S.h(`<span class="hl-chip tone-${x.tone || "agent"}">${S.esc(x.label)}</span>`); legend.appendChild(chip); S.pop(th + 0.15, chip, { from: 0.6 }); }
    });
    S.still = true;
  };

  // ---------------- chat ----------------
  T.chat = (S, p) => {
    const msgs = p.messages || [];
    const root = S.add(`<div class="chat">${p.title ? `<div class="chat-h">${S.md(p.title)}</div>` : ""}<div class="chat-list"></div></div>`);
    const list = root.querySelector(".chat-list");
    const times = S.spread(msgs, 0.04, 0.8);
    if (p.title) S.rise(S.t0, root.querySelector(".chat-h"));
    msgs.forEach((m, k) => {
      const who = m.from === "agent" ? "mull" : isChar(m.from) ? m.from : "you";
      const left = who !== "you";
      const el = S.h(`<div class="msg from-${left ? "agent" : "you"} who-${who} ${m.tone ? "tone-" + m.tone : ""}"><span class="av">${A.char(who, { size: 76 })}</span><div class="bub">${m.label ? `<b class="bub-l">${S.esc(m.label)}</b>` : ""}${S.md(m.text)}</div></div>`);
      list.appendChild(el);
      const t = times[k];
      if (left && m.typing !== false) {
        const dots = S.h(`<div class="msg from-agent typing"><span class="av"></span><div class="bub"><i></i><i></i><i></i></div></div>`);
        list.insertBefore(dots, el); gsap.set(dots, { display: "none" });
        S.tl.set(dots, { display: "flex", autoAlpha: 1 }, Math.max(S.t0, t - 0.6)); S.tl.set(dots, { display: "none" }, t);
      }
      S.enter(t, el, { y: 24, d: 0.4 });
      S.tl.fromTo(el, { scale: 0.97 }, { scale: 1, duration: 0.4, ease: window.S1M.SPRING.calm, immediateRender: false }, t);
      S.marks(el, t + 0.4, t + 0.3);
    });
    S.still = true;
  };

  // ---------------- compare ----------------
  T.compare = (S, p) => {
    const L = p.left || {}, R = p.right || {};
    const col = (c, side) => {
      const tone = c.tone || (side === "l" ? "bad" : "good");
      const head = isChar(c.who) ? A.char(c.who, { size: 70 }) : A.icon(c.icon || ({ good: "check", bad: "x" }[tone] || "spark"), 40);
      return `<div class="cmp-col tone-${tone}">
      <div class="cmp-h">${head}<span>${S.md(c.title || "")}</span></div>
      <ul>${(c.items || []).map((it) => `<li><span class="mk-i">${A.icon(tone === "bad" ? "x" : (tone === "neutral" || tone === "human" || tone === "agent" || tone === "s2") ? "spark" : "check", 30)}</span><span>${S.md(typeof it === "string" ? it : it.text)}</span></li>`).join("")}</ul></div>`;
    };
    const root = S.add(`<div class="cmp">${p.title ? `<h3 class="side-h cmp-title">${S.md(p.title)}</h3>` : ""}<div class="cmp-cols">${col(L, "l")}<div class="cmp-vs">${S.esc(p.vs || "vs")}</div>${col(R, "r")}</div></div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".cmp-title"));
    const cols = root.querySelectorAll(".cmp-col");
    const li = [...cols[0].querySelectorAll("li")], ri = [...cols[1].querySelectorAll("li")];
    const lItems = (L.items || []).map((x) => (typeof x === "string" ? {} : x)), rItems = (R.items || []).map((x) => (typeof x === "string" ? {} : x));
    const tl0 = S.cue(L.at, 0.03), tr0 = S.cue(R.at, 0.45);
    S.slideL(tl0, cols[0]); S.slideR(tr0, cols[1]); S.pop(tr0 - 0.1, root.querySelector(".cmp-vs"), { from: 0.5 });
    li.forEach((el, k) => S.rise(lItems[k].at ? S.cue(lItems[k].at) : tl0 + 0.35 + k * Math.min(0.9, (tr0 - tl0 - 0.4) / Math.max(1, li.length)), el, 0.4, 16));
    ri.forEach((el, k) => S.rise(rItems[k].at ? S.cue(rItems[k].at) : tr0 + 0.35 + k * Math.min(0.9, (S.t1 - tr0 - 1) / Math.max(1, ri.length)), el, 0.4, 16));
    li.concat(ri).forEach((el) => S.marks(el, S.frac(0.85)));
    S.focusEl = root;
  };

  // ---------------- list ----------------
  T.list = (S, p) => {
    const items = p.items || [];
    const style = p.style || "check";
    const bul = (k) => style === "num" ? `<span class="bul num">${k + 1}</span>` : style === "dot" ? `<span class="bul dot"></span>` : `<span class="bul ico tone-${style === "warn" || style === "x" ? "bad" : "good"}">${A.icon(style === "warn" ? "warn" : style === "x" ? "x" : "check", 30)}</span>`;
    const root = S.add(`<div class="lst style-${style} ${items.length > 4 ? "dense" : ""} ${items.length > 5 ? "cols2" : ""}">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<ul>${items.map((it, k) => { const o = typeof it === "string" ? { text: it } : it; return `<li>${bul(k)}<span class="li-t">${S.md(o.text)}${o.sub ? `<small>${S.md(o.sub)}</small>` : ""}</span></li>`; }).join("")}</ul></div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".side-h"));
    const objs = items.map((it) => (typeof it === "string" ? {} : it));
    const times = S.spread(objs, p.title ? 0.12 : 0.04, 0.78);
    root.querySelectorAll("li").forEach((el, k) => { S.rise(times[k], el, 0.45, 22); S.pop(times[k] + 0.08, el.querySelector(".bul"), { from: 0.4 }); S.marks(el, times[k] + 0.5, times[k] + 0.2); });
    S.focusEl = root;
  };

  // ---------------- stat (one or several big numbers) ----------------
  T.stat = (S, p) => {
    const items = p.items || [{ value: p.value, prefix: p.prefix, suffix: p.suffix, decimals: p.decimals, label: p.label, sub: p.sub, tone: p.tone, at: p.at }];
    const root = S.add(`<div class="stat n${items.length}">${p.title ? `<h3 class="side-h stat-title">${S.md(p.title)}</h3>` : ""}<div class="stat-row">${items.map((it) => `<div class="stat-i tone-${it.tone || "agent"}"><div class="stat-v"><span class="num"></span></div><div class="stat-l">${S.md(it.label || "")}</div>${it.sub ? `<div class="stat-s">${S.md(it.sub)}</div>` : ""}</div>`).join("")}</div>${p.src ? `<div class="src">${S.md(p.src)}</div>` : ""}</div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".stat-title"));
    const els = root.querySelectorAll(".stat-i");
    const times = S.spread(items, 0.04, 0.5);
    let best = null;
    els.forEach((el, k) => {
      const it = items[k];
      S.rise(times[k], el, 0.5);
      const num = el.querySelector(".num");
      if (typeof it.value === "number") S.count(times[k] + 0.1, num, it.value, { d: it.d || 1.0, decimals: it.decimals || 0, prefix: it.prefix || "", suffix: it.suffix || "" });
      else { num.textContent = it.value; el.classList.add("is-text"); S.slam(times[k] + 0.05, el.querySelector(".stat-v"), { from: 1.5, rot: -3, to: 0 }); }
      S.marks(el, times[k] + 0.6);
      if (it.hero || (!best && k === items.length - 1)) best = [times[k] + 0.6, el];
    });
    if (p.src) S.fade(S.frac(0.3), root.querySelector(".src"));
    if (best && p.punch !== false) S.want("punch", best[0], best[1].querySelector(".stat-v"), p.prio || 1);
  };

  // ---------------- stack (layers) ----------------
  T.stack = (S, p) => {
    const layers = p.layers || [];
    const root = S.add(`<div class="stk-wrap">${p.title ? `<div class="stk-side"><h3 class="side-h">${S.md(p.title)}</h3>${p.sub ? `<p class="side-p">${S.md(p.sub)}</p>` : ""}</div>` : ""}<div class="stk">${layers.map((l, k) => `<div class="layer tone-${l.tone || ["ink", "agent", "s2", "paper", "human"][k % 5]}">${l.icon ? A.icon(l.icon, 40) : ""}<b>${S.md(l.label)}</b>${l.sub ? `<i>${S.md(l.sub)}</i>` : ""}</div>`).join("")}</div></div>`);
    if (p.title) { S.rise(S.t0, root.querySelector(".side-h")); if (p.sub) S.rise(S.frac(0.2), root.querySelector(".side-p")); }
    const times = S.spread(layers, 0.06, 0.72);
    root.querySelectorAll(".layer").forEach((el, k) => S.enter(times[k], el, { y: -46, d: 0.5, ease: window.S1M.SPRING.calm }));
    S.focusEl = root.querySelector(".stk");
  };

  // ---------------- timeline ----------------
  T.timeline = (S, p) => {
    const ev = p.events || [];
    const root = S.add(`<div class="tln ${S.portrait ? "vert" : ""}">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<div class="tln-track"><div class="tln-line"></div>
      ${ev.map((e, k) => `<div class="ev ${k % 2 ? "alt" : ""} ${e.now ? "now" : ""}" style="${S.portrait ? `top:${((k + 0.5) / ev.length) * 100}%` : `left:${((k + 0.5) / ev.length) * 100}%`}"><span class="ev-dot"></span><div class="ev-box"><span class="ev-when">${S.esc(e.when)}</span><b>${S.md(e.label)}</b>${e.sub ? `<i>${S.md(e.sub)}</i>` : ""}</div></div>`).join("")}</div></div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".side-h"));
    const line = root.querySelector(".tln-line"), ax = S.portrait ? "scaleY" : "scaleX";
    gsap.set(line, { [ax]: 0, transformOrigin: S.portrait ? "50% 0%" : "0% 50%" });
    S.tl.fromTo(line, { [ax]: 0 }, { [ax]: 1, duration: 1.2, ease: E.move, immediateRender: false }, S.t0 + 0.2);
    const times = S.spread(ev, 0.1, 0.8);
    root.querySelectorAll(".ev").forEach((el, k) => { S.pop(times[k], el.querySelector(".ev-dot"), { from: 0.3 }); S.rise(times[k] + 0.08, el.querySelector(".ev-box"), 0.45, 18); });
    S.focusEl = root.querySelector(".tln-track");
  };

  // ---------------- spectrum ----------------
  T.spectrum = (S, p) => {
    const marks = p.marks || [];
    const lw = p.left?.who || "snap", rw = p.right?.who || "mull";
    const root = S.add(`<div class="spc">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}
      <div class="spc-ends"><div class="spc-end l"><span class="spc-av"></span><b>${S.esc(p.left?.label || "")}</b><i>${S.esc(p.left?.sub || "")}</i></div><div class="spc-end r"><span class="spc-av"></span><b>${S.esc(p.right?.label || "")}</b><i>${S.esc(p.right?.sub || "")}</i></div></div>
      <div class="spc-track"><div class="spc-fill"></div>${marks.map((m) => `<div class="spc-mark" style="left:${m.pos * 100}%"><span class="tick"></span><span class="lab">${S.md(m.label)}</span></div>`).join("")}<div class="spc-knob"></div></div>
    </div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".side-h"));
    const avs = root.querySelectorAll(".spc-av");
    const nl = S.actor(avs[0], lw, { size: 110 }), nr = S.actor(avs[1], rw, { size: 110 });
    S.slideL(S.t0 + 0.1, root.querySelector(".spc-end.l")); S.slideR(S.t0 + 0.25, root.querySelector(".spc-end.r"));
    S.hopIn(S.t0 + 0.2, nl, { h: 50 }); S.hopIn(S.t0 + 0.35, nr, { h: 40 });
    S.fade(S.t0 + 0.3, root.querySelector(".spc-track"));
    const knob = root.querySelector(".spc-knob"); gsap.set(knob, { left: "0%" });
    const times = S.spread(marks, 0.15, 0.85);
    root.querySelectorAll(".spc-mark").forEach((el, k) => { S.rise(times[k] - 0.2, el, 0.4, 12); S.tl.to(knob, { left: marks[k].pos * 100 + "%", duration: 0.8, ease: E.move }, times[k] - 0.3); });
    S.focusEl = root.querySelector(".spc-track");
  };

  // ---------------- flow (pipeline) ----------------
  T.flow = (S, p) => {
    const nodes = p.nodes || [];
    const vertical = S.portrait || p.vertical;
    const nodeHTML = nodes.map((nd, k) => {
      const art = isChar(nd.kind) ? A.char(nd.kind, { size: 90 }) : A.icon(nd.icon || ({ tool: "tool", doc: "doc", test: "test", check: "check", code: "code", warn: "warn", db: "db", web: "globe", human: "user", llm: "brain", decision: "bolt" }[nd.kind] || "spark"), 56);
      const arrow = k < nodes.length - 1 ? `<div class="fl-arrow">${vertical ? `<svg viewBox="0 0 40 70" width="40" height="70"><path data-draw d="M20 4 V60" /><path class="ah" d="M8 48 L20 64 L32 48"/></svg>` : `<svg viewBox="0 0 90 40" width="90" height="40"><path data-draw d="M4 20 H76"/><path class="ah" d="M62 8 L80 20 L62 32"/></svg>`}${nodes[k].edge ? `<span class="fl-edge">${S.esc(nodes[k].edge)}</span>` : ""}</div>` : "";
      return `<div class="fl-node kind-${nd.kind || "plain"}"><div class="fl-art">${art}</div><b>${S.md(nd.label)}</b>${nd.sub ? `<i>${S.md(nd.sub)}</i>` : ""}</div>${arrow}`;
    }).join("");
    const root = S.add(`<div class="fl ${vertical ? "vert" : ""}">${p.title ? `<h3 class="side-h fl-title">${S.md(p.title)}</h3>` : ""}<div class="fl-row">${nodeHTML}</div>${p.caption ? `<p class="fl-cap">${S.md(p.caption)}</p>` : ""}</div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".fl-title"));
    const times = S.spread(nodes, 0.06, 0.75);
    const nEls = root.querySelectorAll(".fl-node"), aEls = root.querySelectorAll(".fl-arrow");
    nEls.forEach((el, k) => {
      S.pop(times[k], el, { from: 0.7, zeta: 0.6 });
      if (aEls[k]) { const a = aEls[k]; S.draw(times[k] + 0.3, a, 0.45); S.fade(times[k] + 0.55, a.querySelector(".ah"), 0.15); const e = a.querySelector(".fl-edge"); if (e) S.fade(times[k] + 0.5, e, 0.3); }
    });
    if (p.caption) S.rise(S.cue(p.caption_at, 0.8), root.querySelector(".fl-cap"));
    S.focusEl = root.querySelector(".fl-row");
  };

  // ---------------- chart ----------------
  T.chart = (S, p) => {
    const data = p.data || [];
    const W = S.portrait ? 900 : 1300, H = S.portrait ? 900 : 620, pad = { l: 120, r: 40, t: 50, b: 90 };
    // x labels wrap to their slot (svg text doesn't); the bottom margin grows with the longest label
    const slotW = (W - pad.l - pad.r) / Math.max(1, data.length), maxCh = Math.max(6, Math.floor((slotW - 14) / 16.8));
    const xLines = data.map((d) => { const out = []; let cur = ""; for (const w of String(d.x ?? "").split(/\s+/)) { if (!cur) cur = w; else if ((cur + " " + w).length <= maxCh) cur += " " + w; else { out.push(cur); cur = w; } } if (cur) out.push(cur); return out; });
    pad.b += (Math.max(1, ...xLines.map((l) => l.length)) - 1) * 34;
    const ys = data.map((d) => d.y), log = !!p.log;
    const yMin = log ? Math.log10(Math.min(...ys) / 2) : 0, yMax = log ? Math.log10(Math.max(...ys) * 2) : (p.ymax || Math.max(...ys) * 1.15);
    const Y = (v) => pad.t + (H - pad.t - pad.b) * (1 - ((log ? Math.log10(v) : v) - yMin) / (yMax - yMin));
    const X = (k) => pad.l + ((W - pad.l - pad.r) * (k + 0.5)) / data.length;
    const bw = ((W - pad.l - pad.r) / data.length) * 0.56;
    const yfmt = (v) => (p.prefix || "") + v + (p.suffix || "");
    const bars = p.kind === "line" ? "" : data.map((d, k) => `<rect class="bar ${d.hl ? "hl" : ""} ${d.tone ? "tone-" + d.tone : ""}" x="${X(k) - bw / 2}" y="${Y(d.y)}" width="${bw}" height="${H - pad.b - Y(d.y)}" rx="8"/>`).join("");
    const line = p.kind === "line" ? `<polyline class="ln" data-draw points="${data.map((d, k) => `${X(k)},${Y(d.y)}`).join(" ")}"/>` + data.map((d, k) => `<circle class="pt ${d.hl ? "hl" : ""}" cx="${X(k)}" cy="${Y(d.y)}" r="11"/>`).join("") : "";
    const labels = data.map((d, k) => `<text class="ch-x" x="${X(k)}" y="${H - pad.b + 46}" text-anchor="middle">${xLines[k].map((l, i) => `<tspan x="${X(k)}" dy="${i ? 34 : 0}">${S.esc(l)}</tspan>`).join("")}</text><text class="ch-v" x="${X(k)}" y="${Y(d.y) - 22}" text-anchor="middle">${S.esc(d.label ?? yfmt(d.y))}</text>`).join("");
    const root = S.add(`<div class="chart-wrap">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      <line class="axis" data-draw x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}"/>${p.ylabel ? `<text class="ch-y" x="20" y="${pad.t - 10}">${S.esc(p.ylabel)}</text>` : ""}
      ${bars}${line}${labels}</svg>${p.src ? `<div class="src">${S.md(p.src)}</div>` : ""}</div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".side-h"));
    S.draw(S.t0 + 0.15, root.querySelector(".axis"), 0.5);
    const times = S.spread(data, 0.1, 0.75);
    root.querySelectorAll(".ch-x").forEach((el, k) => S.fade(times[k], el, 0.25));
    root.querySelectorAll(".ch-v").forEach((el, k) => { gsap.set(el, { transformOrigin: "50% 50%", transformBox: "fill-box" }); S.pop(times[k] + 0.4, el, { from: 0.5, d: 0.4 }); });
    root.querySelectorAll(".bar").forEach((el, k) => { gsap.set(el, { transformOrigin: "50% 100%", transformBox: "fill-box" }); gsap.set(el, { scaleY: 0 }); S.tl.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.55, ease: E.out, immediateRender: false }, times[k]); });
    const pl = root.querySelector(".ln"); if (pl) S.draw(times[0], pl, Math.max(0.8, times[times.length - 1] - times[0] + 0.4), "none");
    root.querySelectorAll(".pt").forEach((el, k) => { gsap.set(el, { transformOrigin: "50% 50%", transformBox: "fill-box" }); S.pop(times[k] + 0.1, el, { from: 0.3, d: 0.4 }); });
    if (p.src) S.fade(S.frac(0.5), root.querySelector(".src"));
    const hk = data.findIndex((d) => d.hl); if (hk >= 0) S.want("punch", times[hk] + 0.5, root.querySelectorAll(".ch-v")[hk], p.prio || 1);
    S.focusEl = root.querySelector(".chart");
  };

  // ---------------- formula: A + B + C = D ----------------
  T.formula = (S, p) => {
    const parts = p.parts || [];
    const root = S.add(`<div class="fml">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<div class="fml-row">${parts.map((pt) => pt.op ? `<span class="fml-op">${S.esc(pt.op)}</span>` : `<span class="fml-t tone-${pt.tone || "ink"}">${pt.icon ? A.icon(pt.icon, 56) : ""}<b>${S.md(pt.text)}</b>${pt.sub ? `<i>${S.md(pt.sub)}</i>` : ""}</span>`).join("")}</div>${p.caption ? `<p class="fml-cap">${S.md(p.caption)}</p>` : ""}</div>`);
    if (p.title) S.rise(S.t0, root.querySelector(".side-h"));
    const els = root.querySelectorAll(".fml-row > span");
    const times = S.spread(parts, 0.06, 0.7);
    els.forEach((el, k) => (parts[k].op ? S.pop(times[k], el, { from: 0.4, d: 0.35 }) : S.rise(times[k], el, 0.5)));
    if (p.caption) S.rise(S.cue(p.caption_at, 0.8), root.querySelector(".fml-cap"));
    S.focusEl = root.querySelector(".fml-row");
  };

  // ---------------- quiz ----------------
  T.quiz = (S, p) => {
    const opts = p.options || [];
    const root = S.add(`<div class="quiz">
      <div class="qz-kick">${A.icon("target", 34)}<span>${S.esc(p.kicker || "Quick check")}</span></div>
      <h3 class="qz-q">${S.md(p.q || p.question || "")}</h3>
      <div class="qz-opts n${opts.length}">${opts.map((o, i) => `<button class="qz-o" data-i="${i}" type="button"><span class="qz-l">${"ABCD"[i]}</span><span class="qz-t">${S.md(o)}</span><span class="qz-mark"></span></button>`).join("")}</div>
      <div class="qz-explain">${A.icon("spark", 34)}<span>${S.md(p.explain || "")}</span></div>
      <div class="qz-timer"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="16"/></svg><span>tap an answer</span></div>
    </div>`);
    S.slideL(S.t0, root.querySelector(".qz-kick"));
    S.words(S.t0 + 0.15, root.querySelector(".qz-q"), 0.05);
    const oEls = [...root.querySelectorAll(".qz-o")];
    const times = S.spread(opts.map(() => ({})), 0.2, 0.6);
    oEls.forEach((el, k) => S.rise(times[k], el, 0.4, 18));
    const lastWord = S.ws.length ? S.ws[S.ws.length - 1].e : S.frac(0.7);
    const gateT = Math.min(S.t1 - 1.5, lastWord + 0.25);
    const timer = root.querySelector(".qz-timer");
    S.fade(gateT - 0.1, timer, 0.2);
    const ring = timer.querySelector("circle");
    const holdD = Math.max(1.2, S.t1 - gateT - 2.2);
    const answer = p.answer || 0;
    let state = -1;
    const reveal = (i) => {
      if (state === i) return; state = i;
      oEls.forEach((el, k) => { el.classList.toggle("right", k === answer); el.classList.toggle("wrong", k === i && i !== answer); el.classList.toggle("dim", k !== answer && k !== i); });
      root.classList.add("revealed");
    };
    const reset = () => { if (state === -1) return; state = -1; oEls.forEach((el) => el.classList.remove("right", "wrong", "dim")); root.classList.remove("revealed"); };
    S.amb((t) => {
      const k = Math.max(0, Math.min(1, (t - gateT) / holdD));
      ring.style.strokeDashoffset = (100.5 * k).toFixed(2);
      if (S.L.mode === "capture") { if (t >= gateT + holdD) reveal(answer); else reset(); }
    });
    if (S.L.mode === "capture") { S.enter(gateT + holdD + 0.05, root.querySelector(".qz-explain"), { y: 14, d: 0.4 }); S.sfx("ding", gateT + holdD + F, 0.6); }
    S.L.gates.push({ t: gateT, scene: S.i, root, answer, reveal, reset, auto: () => {}, options: oEls, explain: p.explain });
    S.still = true;
  };

  // ---------------- recap ----------------
  T.recap = (S, p) => {
    const items = p.items || [];
    const root = S.add(`<div class="rc">
      <div class="rc-main"><div class="eyebrow">${S.esc(p.kicker || "Key takeaways")}</div>
      <ul>${items.map((it) => `<li><span class="bul ico tone-good">${A.icon("check", 30)}</span><span>${S.md(it)}</span></li>`).join("")}</ul>
      ${p.next ? `<div class="rc-next"><span>Next</span><b>${S.md(p.next)}</b>${A.icon("rocket", 34)}</div>` : ""}</div>
      <div class="rc-art"></div>
    </div>`);
    S.slideL(S.t0, root.querySelector(".eyebrow"));
    const times = S.spread(items.map(() => ({})), 0.08, 0.72);
    root.querySelectorAll("li").forEach((el, k) => { S.rise(times[k], el, 0.45, 18); S.pop(times[k] + 0.08, el.querySelector(".bul"), { from: 0.4 }); S.marks(el, times[k] + 0.4); });
    if (p.next) S.rise(S.cue(p.next_at, 0.85), root.querySelector(".rc-next"));
    const n = S.actor(root.querySelector(".rc-art"), p.who || "snap", { size: S.portrait ? 210 : 260, mood: "happy" });
    S.hopIn(S.t0 + 0.3, n, { h: 70 });
    S.still = true;
  };

  // ---------------- exercise ----------------
  T.exercise = (S, p) => {
    const root = S.add(`<div class="ex">
      <div class="ex-h">${A.icon("terminal", 40)}<span>${S.esc(p.title || "Try it with your agent")}</span></div>
      ${p.intro ? `<p class="ex-intro">${S.md(p.intro)}</p>` : ""}
      <div class="ex-card"><div class="ex-bar"><span>${S.esc(p.bar || "paste into Claude Code, Codex, Cursor…")}</span><button class="ex-copy" type="button">Copy</button></div><pre class="ex-prompt"></pre></div>
    </div>`);
    S.slideL(S.t0, root.querySelector(".ex-h"));
    if (p.intro) S.rise(S.t0 + 0.3, root.querySelector(".ex-intro"));
    S.rise(S.t0 + 0.5, root.querySelector(".ex-card"));
    const pre = root.querySelector(".ex-prompt");
    S.type(S.t0 + 0.9, pre, p.prompt || "", Math.max(40, String(p.prompt || "").length / Math.max(1, S.dur * 0.6)));
    const btn = root.querySelector(".ex-copy");
    btn.addEventListener("click", (e) => { e.stopPropagation(); navigator.clipboard?.writeText(p.prompt || ""); btn.textContent = "Copied"; setTimeout(() => (btn.textContent = "Copy"), 1500); });
    S.still = true;
  };

  window.S1_TEMPLATES = T;
})();
