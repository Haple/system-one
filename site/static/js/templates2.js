// Scene templates, part 2: the decision-model set. Requests and typed answers, Noul meters, Choice distributions,
// Score ladders, calibration and coverage plots, threshold lanes, the generation-vs-decision race, decomposition,
// routers, jagged-edge cards, comparison tables and the three systems. Probability always reads the same way:
// an ink track, an amber (System One) fill, a mono value. Answers to one request land together (they are parallel).
(function () {
  "use strict";
  const T = window.S1_TEMPLATES, A = window.S1_ART, M = window.S1M, { E, F, SPRING } = M;
  const { isChar } = T._h, hl = T._hl;
  const pct = (v, d = 0) => (v * 100).toFixed(d) + "%";
  const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  const BADGE = { noul: "Noul", choice: "Choice", score: "Score", predicate: "Predicate", box: "Box" };
  const badge = (type) => `<span class="qb qb-${type}">${BADGE[type] || type}</span>`;
  // pretty JSON that keeps small objects and arrays on one line, so a state fits the card
  const inl = (v) => (v === null || typeof v !== "object" ? JSON.stringify(v) : Array.isArray(v) ? `[${v.map(inl).join(", ")}]` : `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${inl(x)}`).join(", ")}}`);
  const jsonLines = (o, max = 44) => {
    const out = [];
    const walk = (v, ind, key, last) => {
      const pre = " ".repeat(ind) + (key != null ? JSON.stringify(key) + ": " : ""), end = last ? "" : ",";
      if (v === null || typeof v !== "object" || (pre.trimStart() + inl(v)).length <= max) { out.push(pre + inl(v) + end); return; }
      const arr = Array.isArray(v), ents = arr ? v.map((x) => [null, x]) : Object.entries(v);
      out.push(pre + (arr ? "[" : "{"));
      ents.forEach(([k, x], i) => walk(x, ind + 2, k, i === ents.length - 1));
      out.push(" ".repeat(ind) + (arr ? "]" : "}") + end);
    };
    walk(o, 0, null, true);
    return out;
  };

  // ---------------- request: state + typed questions in, typed answers out (all at once) ----------------
  T.request = (S, p) => {
    const qs = p.questions || [];
    const state = p.state ?? "";
    const stateHTML = typeof state === "string" ? `<p class="rq-text">${S.md(state)}</p>` : `<pre class="rq-json">${jsonLines(state).map((l) => `<span class="jl">${hl(l, "json")}</span>`).join("\n")}</pre>`;
    const ansHTML = (q) => {
      const a = q.ans || {};
      if (q.type === "noul" || q.type === "predicate") return `<div class="rq-a"><span class="rq-v">${f2(a.v)}</span><span class="pbar"><i class="pfill" style="--c:${a.v >= 0.8 ? "var(--good)" : a.v <= 0.2 ? "var(--bad)" : "var(--warn)"}"></i></span></div>`;
      if (q.type === "choice") return `<div class="rq-a"><span class="rq-chip">${S.esc(a.choice)}</span><span class="pbar"><i class="pfill"></i></span><span class="rq-p">${f2(a.p)}</span></div>`;
      if (q.type === "score") return `<div class="rq-a"><span class="rq-v">${(+a.score).toFixed(2)}<small>/${a.max}</small></span><span class="rq-lab">${S.esc(a.label || "")}</span></div>`;
      return `<div class="rq-a"><span class="rq-v">${S.esc(a.text || "")}</span></div>`;
    };
    const root = S.add(`<div class="rq ${typeof state === "string" ? "st-text" : "st-json"}">
      <div class="rq-state card"><div class="card-h"><span class="lbl">${S.esc(p.state_label || "state")}</span>${A.icon("doc", 26)}</div>${stateHTML}</div>
      <div class="rq-wire"><svg viewBox="0 0 120 40" preserveAspectRatio="none"><path data-draw d="M2 20 H112"/><path class="ah" d="M100 8 L116 20 L100 32"/></svg><i class="rq-pulse"></i></div>
      <div class="rq-q card">
        <div class="card-h"><span class="lbl">${S.esc(p.q_label || "questions")}</span><span class="rq-model">${S.esc(p.model || "jev-1.13.0")}</span><span class="rq-lat"><b class="ms">0</b> ms</span></div>
        <div class="rq-rows">${qs.map((q) => `<div class="rq-row" data-id="${S.esc(q.id || "")}"><i class="rq-mark"></i>${badge(q.type)}<span class="rq-qt">${S.md(q.text)}</span>${ansHTML(q)}</div>`).join("")}</div>
        ${p.footer ? `<div class="rq-foot">${S.md(p.footer)}</div>` : ""}
      </div>
    </div>`);
    // a tall state shrinks its type until the card fits between the header and the captions
    const sj = root.querySelector(".rq-json");
    if (sj && !S.portrait) { const over = root.offsetHeight - (S.H - (S.portrait ? 380 : 300)), h = sj.offsetHeight; if (over > 0 && h > 0) { const fs = parseFloat(getComputedStyle(sj).fontSize); sj.style.fontSize = Math.max(16, (fs * Math.max(h * 0.5, h - over)) / h).toFixed(1) + "px"; } }
    const t0 = S.t0;
    S.set(t0, root, {}); // card frames are on screen from the cut
    const st = root.querySelector(".rq-state > :last-child");
    S.enter(t0 + 0.12, st, { y: 14, d: 0.45 });
    const rows = [...root.querySelectorAll(".rq-row")];
    const times = S.spread(qs, 0.12, 0.42);
    rows.forEach((r, k) => { S.enter(times[k], r.querySelector(".qb"), { x: -16, y: 0, d: 0.35 }); S.enter(times[k] + 0.04, r.querySelector(".rq-qt"), { x: -10, y: 0, d: 0.35 }); gsap.set(r.querySelector(".rq-a"), { autoAlpha: 0 }); });
    const tS = Math.max(times[times.length - 1] + 0.35, S.cue(p.send_at, 0.55));
    const wire = root.querySelector(".rq-wire");
    S.draw(tS - 0.25, wire.querySelector("path"), 0.3); S.fade(tS + 0.02, wire.querySelector(".ah"), 0.1);
    const pulse = wire.querySelector(".rq-pulse"); gsap.set(pulse, { autoAlpha: 0, left: "0%" });
    S.tl.set(pulse, { autoAlpha: 1 }, tS).fromTo(pulse, { left: "0%" }, { left: "100%", duration: 0.28, ease: E.move, immediateRender: false }, tS).set(pulse, { autoAlpha: 0 }, tS + 0.3);
    S.sfx("send", tS + F, 0.5);
    const lat = Math.round((p.latency ?? 0.27) * 1000), tA = Math.max(tS + 0.45, S.cue(p.ans_at, 0) || 0);
    S.count(tS + 0.05, root.querySelector(".ms"), lat, { d: Math.max(0.3, tA - tS - 0.05) });
    // every answer lands at once: they were evaluated in parallel
    rows.forEach((r, k) => {
      const q = qs[k], a = q.ans || {}, box = r.querySelector(".rq-a");
      S.enter(tA + k * 0.02, box, { x: 18, y: 0, d: 0.4 });
      const fill = box.querySelector(".pfill");
      if (fill) S.fill(tA + k * 0.02, fill, q.type === "choice" ? a.p : a.v);
    });
    S.sfx("tick", tA + F, 0.6);
    // the narration walks through the answers after they land: a soft marker follows it row by row
    rows.forEach((r, k) => {
      const at = qs[k].say_at; if (!at) return;
      const t = Math.max(tA + 0.4, S.cue(at, -1)); if (!(t > 0)) return;
      const m = r.querySelector(".rq-mark");
      S.tl.fromTo(m, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: "none", immediateRender: false }, t);
      S.tl.to(m, { opacity: 0, duration: 0.3, ease: E.exit }, t + 1.5);
      S.beat(t);
    });
    if (p.hl) { const r = rows.find((x) => x.dataset.id === p.hl); if (r) { const t = S.cue(p.hl_at, 0.8); S.cls(r, "hl", t); S.want("punch", t, r, 1, 1.06); } }
    else S.want("punch", tA + 0.25, root.querySelector(".rq-rows"), 1, 1.05);
    S.focusEl = root.querySelector(".rq-q");
  };

  // ---------------- noul: the probability that the answer is yes ----------------
  T.noul = (S, p) => {
    const rows = p.rows || [];
    const z = p.zones;
    const zoneHTML = z ? `<i class="zn zn-no" style="width:${z.no * 100}%"></i><i class="zn zn-rv" style="left:${z.no * 100}%;width:${(z.yes - z.no) * 100}%"></i><i class="zn zn-yes" style="left:${z.yes * 100}%;width:${(1 - z.yes) * 100}%"></i>` : "";
    const root = S.add(`<div class="nl">
      ${p.question ? `<div class="nl-q">${badge("noul")}<h3>${S.md(p.question)}</h3></div>` : ""}
      <div class="nl-rows">${rows.map((r) => `<div class="nl-row"><div class="nl-t">${S.md(r.text)}</div><div class="nl-track"><div class="nl-zones">${zoneHTML}</div><i class="nl-mid"></i><i class="nl-fill"></i><span class="nl-dot"><b>0.50</b></span></div></div>`).join("")}</div>
      <div class="nl-axis"><span>0 · no</span><span>0.5 · unsure</span><span>1 · yes</span></div>
      ${z ? `<div class="nl-legend"><span class="lg-no">${S.esc(p.labels?.no || "treat as no")}</span><span class="lg-rv">${S.esc(p.labels?.review || "ask a person")}</span><span class="lg-yes">${S.esc(p.labels?.yes || "treat as yes")}</span></div>` : ""}
    </div>`);
    if (p.question) S.enter(S.t0, root.querySelector(".nl-q"), { y: 16, d: 0.4 });
    S.fade(S.t0 + 0.1, root.querySelector(".nl-axis"), 0.3);
    const times = S.spread(rows, 0.1, 0.72);
    root.querySelectorAll(".nl-row").forEach((el, k) => {
      const r = rows[k], t = times[k];
      S.enter(t, el.querySelector(".nl-t"), { x: -14, y: 0, d: 0.35 });
      S.fade(t, el.querySelector(".nl-track"), 0.2);
      const dot = el.querySelector(".nl-dot"), b = dot.querySelector("b"), fill = el.querySelector(".nl-fill");
      gsap.set(dot, { left: "50%" });
      const td = t + 0.3; // the model "decides": the marker leaves the middle and lands on its probability
      S.tl.fromTo(dot, { left: "50%" }, { left: r.p * 100 + "%", duration: 0.55, ease: E.out, immediateRender: false }, td);
      S.fill(td, fill, r.p, { d: 0.55 });
      S.count(td, b, r.p, { d: 0.55, decimals: 2, from: 0.5 });
      if (z) S.cls(dot, r.p >= z.yes ? "is-yes" : r.p <= z.no ? "is-no" : "is-rv", td + 0.55);
      if (r.note) { const n = S.add(`<span class="nl-note">${S.md(r.note)}</span>`, el); S.pop(S.cue(r.note_at, 0.85), n, { from: 0.6, rot: -4 }); }
    });
    if (z) { const tz = S.cue(p.zones_at, 0.55); root.querySelectorAll(".nl-zones").forEach((zz, k) => S.fade(tz + k * 0.04, zz, 0.35)); S.enter(tz + 0.2, root.querySelector(".nl-legend"), { y: 12, d: 0.4 }); }
    if (rows.length) S.sfx("tick", times[0] + 0.3 + F, 0.4);
    S.focusEl = root.querySelector(".nl-rows");
  };

  // ---------------- dist: a Choice answer is a distribution over your options ----------------
  T.dist = (S, p) => {
    const opts = p.options || [];
    const top = opts.reduce((a, o, k) => (o.p > opts[a].p ? k : a), 0);
    const n = p.n || opts.length;
    const conf = p.confidence ?? ((opts[top].p - 1 / n) / (1 - 1 / n));
    const root = S.add(`<div class="ds">
      <div class="ds-main">
        ${p.state ? `<div class="ds-state">${A.icon("doc", 30)}<span>${S.md(p.state)}</span></div>` : ""}
        ${p.question ? `<div class="nl-q">${badge("choice")}<h3>${S.md(p.question)}</h3></div>` : ""}
        <div class="ds-bars">${opts.map((o, k) => `<div class="ds-row ${k === top ? "top" : ""}"><span class="ds-l">${S.md(o.label)}${o.desc ? `<small>${S.md(o.desc)}</small>` : ""}</span><span class="ds-track"><i class="ds-fill"></i></span><span class="ds-p">0.00</span></div>`).join("")}${p.more ? `<div class="ds-more">${S.md(p.more)}</div>` : ""}</div>
      </div>
      ${p.gauge === false ? "" : `<div class="ds-side"><div class="gauge"><svg viewBox="0 0 200 120"><path class="g-tr" d="M20 105 A80 80 0 0 1 180 105"/><path class="g-fl" d="M20 105 A80 80 0 0 1 180 105" pathLength="1"/><line class="g-nd" x1="100" y1="105" x2="100" y2="38"/><circle cx="100" cy="105" r="9"/></svg><div class="g-v"><b>0.00</b><span>confidence</span></div></div>${p.formula ? `<div class="ds-fml">${S.md(p.formula)}</div>` : ""}</div>`}
    </div>`);
    const t0 = S.t0;
    if (p.state) S.enter(t0 + 0.05, root.querySelector(".ds-state"), { y: 14, d: 0.4 });
    if (p.question) S.enter(t0 + 0.15, root.querySelector(".nl-q"), { y: 14, d: 0.4 });
    const rows = [...root.querySelectorAll(".ds-row")];
    rows.forEach((r, k) => S.enter(t0 + 0.25 + k * 0.05, r.querySelector(".ds-l"), { x: -12, y: 0, d: 0.3 }));
    const tA = S.cue(p.at, 0.3);
    rows.forEach((r, k) => { S.fill(tA, r.querySelector(".ds-fill"), opts[k].p, { d: 0.6 }); S.count(tA, r.querySelector(".ds-p"), opts[k].p, { d: 0.6, decimals: 2 }); });
    S.sfx("tick", tA + F, 0.5);
    const tagT = tA + 0.65;
    S.cls(rows[top], "is-chosen", tagT);
    if (p.more) S.fade(tA + 0.3, root.querySelector(".ds-more"), 0.3);
    if (p.gauge !== false) {
      const tg = S.cue(p.conf_at, 0.55);
      const fl = root.querySelector(".g-fl"), nd = root.querySelector(".g-nd");
      fl.style.strokeDasharray = "1 1"; gsap.set(fl, { strokeDashoffset: 1 }); gsap.set(nd, { rotation: -90, svgOrigin: "100 105" });
      S.fade(tg - 0.2, root.querySelector(".ds-side"), 0.25);
      S.tl.fromTo(fl, { strokeDashoffset: 1 }, { strokeDashoffset: 1 - conf, duration: 0.7, ease: E.out, immediateRender: false }, tg);
      S.tl.fromTo(nd, { rotation: -90 }, { rotation: -90 + 180 * conf, duration: 0.8, ease: SPRING.calm, immediateRender: false, svgOrigin: "100 105" }, tg);
      S.count(tg, root.querySelector(".g-v b"), conf, { d: 0.7, decimals: 2 });
      if (p.formula) S.enter(tg + 0.5, root.querySelector(".ds-fml"), { y: 12, d: 0.4 });
      S.want("punch", tg + 0.75, root.querySelector(".gauge"), 1, 1.08);
    }
    S.focusEl = root.querySelector(".ds-bars");
  };

  // ---------------- levels: a Score is a position along levels you describe ----------------
  T.levels = (S, p) => {
    const lv = p.levels || [];
    const n = lv.length, score = p.score ?? lv.reduce((a, l, k) => a + k * l.p, 0);
    const root = S.add(`<div class="lv">
      ${p.state ? `<div class="ds-state">${A.icon("doc", 30)}<span>${S.md(p.state)}</span></div>` : ""}
      ${p.question ? `<div class="nl-q">${badge("score")}<h3>${S.md(p.question)}</h3></div>` : ""}
      <div class="lv-rows">${lv.map((l, k) => `<div class="lv-row"><span class="lv-n">${k}</span><span class="lv-t">${S.md(l.text)}</span><span class="ds-track"><i class="ds-fill"></i></span><span class="ds-p">0.00</span></div>`).join("")}</div>
      <div class="lv-axis"><div class="lv-line">${lv.map((_, k) => `<i class="lv-tick" style="left:${(k / (n - 1)) * 100}%"><b>${k}</b></i>`).join("")}<span class="lv-mark"><b>0.00</b></span></div><div class="lv-cap">${S.md(p.caption || "score = Σ level × probability")}</div></div>
    </div>`);
    const t0 = S.t0;
    if (p.state) S.enter(t0 + 0.05, root.querySelector(".ds-state"), { y: 14, d: 0.4 });
    if (p.question) S.enter(t0 + 0.12, root.querySelector(".nl-q"), { y: 14, d: 0.4 });
    const rows = [...root.querySelectorAll(".lv-row")];
    const rt = S.spread(lv, 0.08, 0.3);
    rows.forEach((r, k) => S.enter(rt[k], r, { x: -14, y: 0, d: 0.35 }));
    const tA = S.cue(p.at, 0.38);
    rows.forEach((r, k) => { S.fill(tA, r.querySelector(".ds-fill"), lv[k].p, { d: 0.6 }); S.count(tA, r.querySelector(".ds-p"), lv[k].p, { d: 0.6, decimals: 2 }); });
    S.sfx("tick", tA + F, 0.5);
    const tm = S.cue(p.score_at, 0.62), mark = root.querySelector(".lv-mark");
    S.fade(tm - 0.3, root.querySelector(".lv-axis"), 0.3);
    gsap.set(mark, { left: "0%" });
    S.tl.fromTo(mark, { left: "0%" }, { left: (score / (n - 1)) * 100 + "%", duration: 0.85, ease: E.move, immediateRender: false }, tm);
    S.count(tm, mark.querySelector("b"), score, { d: 0.85, decimals: 2 });
    S.want("punch", tm + 0.9, mark, 1, 1.07);
    S.focusEl = root.querySelector(".lv-rows");
  };

  // ---------------- reliability diagram: does 0.8 mean 80%? ----------------
  T.reliability = (S, p) => {
    const D = S.portrait ? 880 : 760, pad = 76, I = D - pad * 2;
    const X = (v) => pad + v * I, Y = (v) => D - pad - v * I;
    const series = p.series || [];
    const pts = series.map((s, si) => (s.bins || []).map((b) => `<circle class="rl-pt tone-${s.tone || "s1"}" data-s="${si}" cx="${X(b.conf).toFixed(1)}" cy="${Y(b.acc).toFixed(1)}" r="${Math.max(7, Math.min(30, Math.sqrt(b.n) * 1.4)).toFixed(1)}"/>`).join("") + `<polyline class="rl-ln tone-${s.tone || "s1"}" data-draw points="${(s.bins || []).map((b) => `${X(b.conf).toFixed(1)},${Y(b.acc).toFixed(1)}`).join(" ")}"/>` + (s.gaps ? (s.bins || []).map((b) => `<line class="rl-gap" x1="${X(b.conf)}" y1="${Y(b.acc)}" x2="${X(b.conf)}" y2="${Y(b.conf)}"/>`).join("") : "")).join("");
    const grid = [0.2, 0.4, 0.6, 0.8].map((v) => `<line class="rl-grid" x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}"/><line class="rl-grid" x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}"/>`).join("");
    const ticks = [0, 0.5, 1].map((v) => `<text class="rl-tk" x="${X(v)}" y="${D - pad + 40}" text-anchor="middle">${v}</text><text class="rl-tk" x="${pad - 18}" y="${Y(v) + 9}" text-anchor="end">${v}</text>`).join("");
    const root = S.add(`<div class="rl">
      <div class="rl-plot"><svg viewBox="0 0 ${D} ${D}" width="${D}" height="${D}">${grid}
        <path class="rl-ax" data-draw d="M${X(0)} ${Y(1)} V${Y(0)} H${X(1)}"/>
        <line class="rl-diag" data-draw x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}"/>
        <text class="rl-dl" x="${X(0.52)}" y="${Y(0.62)}" transform="rotate(-45 ${X(0.52)} ${Y(0.62)})">perfectly calibrated</text>
        ${pts}${ticks}
        <text class="rl-xl" x="${X(0.5)}" y="${D - 6}" text-anchor="middle">${S.esc(p.xlabel || "probability the model gave")}</text>
        <text class="rl-yl" x="18" y="${Y(0.5)}" text-anchor="middle" transform="rotate(-90 18 ${Y(0.5)})">${S.esc(p.ylabel || "how often it was right")}</text>
      </svg></div>
      <div class="rl-side">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<div class="rl-legend">${series.map((s, si) => `<div class="rl-lg" data-s="${si}"><i class="sw tone-${s.tone || "s1"}"></i><b>${S.md(s.name)}</b>${s.stat ? `<span>${S.md(s.stat)}</span>` : ""}</div>`).join("")}</div>${p.note ? `<p class="side-p rl-note">${S.md(p.note)}</p>` : ""}</div>
    </div>`);
    const t0 = S.t0;
    if (p.title) S.enter(t0 + 0.05, root.querySelector(".side-h"), { y: 16, d: 0.45 });
    S.draw(t0 + 0.1, root.querySelector(".rl-ax"), 0.5);
    root.querySelectorAll(".rl-tk,.rl-xl,.rl-yl").forEach((e) => S.fade(t0 + 0.3, e, 0.3));
    const td = S.cue(p.diag_at, 0.12);
    S.draw(td, root.querySelector(".rl-diag"), 0.6); S.fade(td + 0.4, root.querySelector(".rl-dl"), 0.3);
    series.forEach((s, si) => {
      const ts = S.cue(s.at, 0.3 + si * 0.25);
      S.enter(ts - 0.1, root.querySelector(`.rl-lg[data-s="${si}"]`), { x: -12, y: 0, d: 0.35 });
      const cs = root.querySelectorAll(`.rl-pt[data-s="${si}"]`);
      cs.forEach((c, k) => { gsap.set(c, { transformOrigin: "50% 50%", transformBox: "fill-box" }); S.pop(ts + k * 0.07, c, { from: 0.2, d: 0.45 }); });
      const ln = root.querySelectorAll(".rl-ln")[si]; if (ln) S.draw(ts + 0.1, ln, Math.max(0.6, cs.length * 0.07 + 0.2), "none");
      root.querySelectorAll(".rl-gap").forEach((g) => S.fade(ts + cs.length * 0.07 + 0.2, g, 0.3));
    });
    if (p.note) S.enter(S.cue(p.note_at, 0.7), root.querySelector(".rl-note"), { y: 14, d: 0.4 });
    S.focusEl = root.querySelector(".rl-plot");
  };

  // ---------------- coverage: automate the sure ones ----------------
  T.coverage = (S, p) => {
    const W = S.portrait ? 920 : 1080, H = S.portrait ? 760 : 680, pl = 120, pr = 40, pt = 40, pb = 90;
    const pts = (p.curve || []).slice().sort((a, b) => a.coverage - b.coverage);
    const ymin = p.ymin ?? 0.75, ymax = p.ymax ?? 1;
    const X = (c) => pl + c * (W - pl - pr), Y = (a) => pt + (1 - (a - ymin) / (ymax - ymin)) * (H - pt - pb);
    const path = pts.map((q, k) => `${k ? "L" : "M"}${X(q.coverage).toFixed(1)} ${Y(q.acc).toFixed(1)}`).join(" ");
    const target = p.target;
    const yt = [ymin, (ymin + ymax) / 2, ymax].map((v) => `<text class="rl-tk" x="${pl - 16}" y="${Y(v) + 9}" text-anchor="end">${pct(v)}</text>`).join("");
    const xt = [0, 0.5, 1].map((v) => `<text class="rl-tk" x="${X(v)}" y="${H - pb + 44}" text-anchor="middle">${pct(v)}</text>`).join("");
    const stops = p.stops || [];
    const root = S.add(`<div class="cv">
      <div class="cv-plot"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        <path class="rl-ax" data-draw d="M${pl} ${pt} V${H - pb} H${W - pr}"/>
        ${target ? `<line class="cv-tg" x1="${pl}" x2="${W - pr}" y1="${Y(target.acc)}" y2="${Y(target.acc)}"/><text class="cv-tgl" x="${W - pr - 6}" y="${Y(target.acc) - 12}" text-anchor="end">${S.esc(target.label || pct(target.acc) + " correct")}</text>` : ""}
        <path class="cv-ln" data-draw d="${path}"/>${yt}${xt}
        <text class="rl-xl" x="${X(0.5)}" y="${H - 8}" text-anchor="middle">${S.esc(p.xlabel || "share handled automatically")}</text>
        <text class="rl-yl" x="22" y="${Y((ymin + ymax) / 2)}" text-anchor="middle" transform="rotate(-90 22 ${Y((ymin + ymax) / 2)})">${S.esc(p.ylabel || "accuracy of what was automated")}</text>
        <g class="cv-knob"><line class="cv-drop" x1="0" y1="0" x2="0" y2="${H - pb}"/><circle r="15"/></g>
      </svg></div>
      <div class="cv-side">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<div class="cv-reads">${stops.map((s) => `<div class="cv-read"><span class="cv-th">confidence ≥ <b>${s.t}</b></span><span class="cv-n"><b>${pct(s.coverage)}</b> automated</span><span class="cv-n"><b>${pct(s.acc, 1)}</b> right</span>${s.note ? `<i>${S.md(s.note)}</i>` : ""}</div>`).join("")}</div></div>
    </div>`);
    const t0 = S.t0;
    if (p.title) S.enter(t0 + 0.05, root.querySelector(".side-h"), { y: 16, d: 0.45 });
    S.draw(t0 + 0.1, root.querySelector(".rl-ax"), 0.45);
    root.querySelectorAll(".rl-tk,.rl-xl,.rl-yl").forEach((e) => S.fade(t0 + 0.3, e, 0.3));
    if (target) { S.fade(S.cue(target.at, 0.2), root.querySelector(".cv-tg"), 0.3); S.fade(S.cue(target.at, 0.2) + 0.1, root.querySelector(".cv-tgl"), 0.3); }
    const tc = S.cue(p.curve_at, 0.18);
    S.draw(tc, root.querySelector(".cv-ln"), 1.0, E.move);
    const knob = root.querySelector(".cv-knob"), reads = [...root.querySelectorAll(".cv-read")];
    gsap.set(knob, { autoAlpha: 0, x: X(stops[0]?.coverage ?? 1), y: Y(stops[0]?.acc ?? ymin) });
    reads.forEach((r) => gsap.set(r, { autoAlpha: 0 }));
    stops.forEach((s, k) => {
      const ts = S.cue(s.at, 0.35 + k * 0.18);
      if (k === 0) S.pop(ts, knob, { from: 0.3, d: 0.4 });
      else S.tl.to(knob, { x: X(s.coverage), y: Y(s.acc), duration: 0.7, ease: E.move }, ts);
      if (k > 0) S.tl.to(reads[k - 1], { autoAlpha: S.portrait ? 0 : 0.35, duration: 0.2 }, ts);
      S.enter(ts + 0.15, reads[k], { x: 16, y: 0, d: 0.4 });
      S.sfx("tick", ts + (k ? 0.7 : 0.2) + F, 0.35);
    });
    S.focusEl = root.querySelector(".cv-plot");
  };

  // ---------------- lanes: thresholds send each answer to a path ----------------
  T.lanes = (S, p) => {
    const lanes = p.lanes || [], items = p.items || [];
    const root = S.add(`<div class="ln3">
      ${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}
      <div class="ln3-in"><div class="ln3-src"><span class="lbl">${S.esc(p.source || "incoming")}</span></div>
      <div class="ln3-lanes">${lanes.map((l, k) => `<div class="ln3-lane tone-${l.tone || "good"}"><div class="ln3-h">${isChar(l.who) ? A.char(l.who, { size: 64 }) : A.icon(l.icon || "check", 40)}<span><b>${S.md(l.label)}</b><i>${S.md(l.rule || "")}</i></span><em class="ln3-n">0</em></div><div class="ln3-slot"></div></div>`).join("")}</div></div>
    </div>`);
    if (p.title) S.enter(S.t0, root.querySelector(".side-h"), { y: 16, d: 0.45 });
    const laneEls = [...root.querySelectorAll(".ln3-lane")];
    laneEls.forEach((el, k) => S.enter(S.t0 + 0.15 + k * 0.08, el, { x: 30, y: 0, d: 0.45 }));
    const src = root.querySelector(".ln3-src");
    S.enter(S.t0 + 0.1, src, { x: -20, y: 0, d: 0.4 });
    const counts = lanes.map(() => 0), arrivals = lanes.map(() => []);
    const times = S.spread(items, 0.2, 0.8);
    items.forEach((it, k) => {
      const card = S.h(`<div class="ln3-card"><span>${S.md(it.text)}</span><b>${f2(it.conf)}</b></div>`);
      const th = p.thresholds || [0.9, 0.6]; // lanes run high to low; it.lane overrides
      const li = it.lane ?? (lanes.some((l) => l.min != null) ? Math.max(0, lanes.findIndex((l) => it.conf >= (l.min ?? 0) && it.conf < (l.max ?? 1.01))) : Math.min(lanes.length - 1, th.filter((x) => it.conf < x).length));
      laneEls[li].querySelector(".ln3-slot").appendChild(card);
      counts[li]++;
      const t = times[k];
      // the card appears at the source, then travels to its lane (FLIP: start offset measured from layout)
      const s = S.center(src), e = S.center(card);
      gsap.set(card, { autoAlpha: 0 });
      S.tl.set(card, { autoAlpha: 1 }, t);
      S.tl.fromTo(card, { x: s[0] - e[0], y: s[1] - e[1], scale: 0.85 }, { x: 0, y: 0, scale: 1, duration: 0.6, ease: E.move, immediateRender: false }, t + 0.25);
      S.tl.fromTo(card, { opacity: 0 }, { opacity: 1, duration: 4 * F, ease: "none", immediateRender: false }, t);
      arrivals[li].push(t + 0.85);
      S.beat(t);
    });
    laneEls.forEach((el, k) => S.textAt(el.querySelector(".ln3-n"), arrivals[k].map((t, j) => [t, String(j + 1)])));
    S.sfx("pop", times[0] + 0.85, 0.35);
    S.focusEl = root.querySelector(".ln3-lanes");
  };

  // ---------------- race: generating an answer vs deciding one ----------------
  T.race = (S, p) => {
    const L = p.left || {}, R = p.right || {};
    const root = S.add(`<div class="rc2">
      <div class="rc2-col left"><div class="rc2-h"><span class="rc2-av"></span><span><b>${S.md(L.label || "LLM")}</b><i>${S.md(L.sub || "writes the answer token by token")}</i></span><span class="rc2-t"><b>0.0</b> s</span></div><pre class="rc2-out"></pre></div>
      <div class="rc2-col right"><div class="rc2-h"><span class="rc2-av"></span><span><b>${S.md(R.label || "Decision model")}</b><i>${S.md(R.sub || "scores every option in one pass")}</i></span><span class="rc2-t"><b>0.0</b> s</span></div><div class="rc2-ans">${(R.items || []).map((x) => `<div class="rc2-a"><span>${S.esc(x.k)}</span><b>${S.esc(x.v)}</b></div>`).join("")}</div></div>
    </div>`);
    const avs = root.querySelectorAll(".rc2-av");
    const nl = S.actor(avs[0], L.who || "mull", { size: 96, mood: "think" }), nr = S.actor(avs[1], R.who || "snap", { size: 92 });
    S.enter(S.t0, root.querySelector(".rc2-col.left"), { x: -24, y: 0, d: 0.45 }); S.enter(S.t0 + 0.08, root.querySelector(".rc2-col.right"), { x: 24, y: 0, d: 0.45 });
    S.hopIn(S.t0 + 0.15, nl, { h: 30 }); S.hopIn(S.t0 + 0.25, nr, { h: 40 });
    const tS = S.cue(p.at, 0.25);
    const scale = p.scale || 1; // animation seconds per real second
    const ls = (L.secs || 3) * scale, rs = Math.max(0.35, (R.secs || 0.3) * scale);
    S.type(tS, root.querySelector(".rc2-out"), L.text || "", Math.max(8, String(L.text || "").length / ls));
    S.count(tS, root.querySelector(".left .rc2-t b"), L.secs || 3, { d: ls, decimals: 1 });
    S.ponder(tS, nl, { d: Math.min(ls, 4), deg: 3 });
    S.count(tS, root.querySelector(".right .rc2-t b"), R.secs || 0.3, { d: rs, decimals: 2 });
    const ta = tS + rs;
    root.querySelectorAll(".rc2-a").forEach((a, k) => S.enter(ta + k * 0.02, a, { x: 16, y: 0, d: 0.35 }));
    S.sfx("tick", ta + F, 0.6);
    S.react(ta + 0.05, nr, "sure"); S.bounce(ta + 0.5, nr, { h: 30 });
    S.want("punch", ta + 0.1, root.querySelector(".rc2-col.right"), 1, 1.05);
    S.focusEl = root;
  };

  // ---------------- decompose: one vague judgment becomes several narrow ones, combined in code ----------------
  T.decompose = (S, p) => {
    const parts = p.parts || [];
    const root = S.add(`<div class="dc">
      <div class="dc-big">${badge("noul")}<span class="dc-bt">${S.md(p.big?.text || "")}</span>${p.big?.p != null ? `<b class="dc-bp">${f2(p.big.p)}</b>` : ""}</div>
      <div class="dc-parts n${parts.length}">${parts.map((x) => `<div class="dc-p">${badge(x.type || "noul")}<span class="dc-t">${S.md(x.text)}</span><span class="dc-v"><span class="pbar"><i class="pfill"></i></span><b>${f2(x.p)}</b>${x.w != null ? `<em>× ${x.w}</em>` : ""}</span></div>`).join("")}</div>
      ${p.result ? `<div class="dc-res"><span class="dc-f">${S.md(p.result.formula || "")}</span><span class="dc-rv"><i>${S.md(p.result.label || "score")}</i><b>${S.esc(String(p.result.value))}</b></span></div>` : ""}
    </div>`);
    const big = root.querySelector(".dc-big");
    S.enter(S.t0 + 0.05, big, { y: 16, d: 0.45 });
    const tSplit = S.cue(p.split_at, 0.3);
    S.cls(big, "is-split", tSplit);
    const cards = [...root.querySelectorAll(".dc-p")];
    const b = S.center(big);
    cards.forEach((c, k) => {
      const e = S.center(c);
      gsap.set(c, { autoAlpha: 0 });
      S.tl.fromTo(c, { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 * F, ease: "none", immediateRender: false }, tSplit + k * 0.05);
      S.tl.fromTo(c, { x: b[0] - e[0], y: b[1] - e[1], scale: 0.6 }, { x: 0, y: 0, scale: 1, duration: 0.6, ease: E.move, immediateRender: false }, tSplit + k * 0.05);
      S.beat(tSplit + k * 0.05);
    });
    const tv = S.cue(p.values_at, 0.55);
    cards.forEach((c, k) => { S.fill(tv, c.querySelector(".pfill"), parts[k].p, { d: 0.55 }); S.fade(tv, c.querySelector(".dc-v b"), 0.2); const w = c.querySelector(".dc-v em"); if (w) S.fade(tv + 0.3, w, 0.3); });
    S.sfx("tick", tv + F, 0.5);
    if (p.result) { const tr = S.cue(p.result.at, 0.78); S.enter(tr, root.querySelector(".dc-res"), { y: 20, d: 0.45 }); S.slam(tr + 0.35, root.querySelector(".dc-rv b"), { from: 1.7, rot: -4, to: 0 }); S.want("punch", tr + 0.55, root.querySelector(".dc-rv"), 2, 1.08); }
    S.focusEl = root.querySelector(".dc-parts");
  };

  // ---------------- table: compare options side by side ----------------
  T.table = (S, p) => {
    const cols = p.cols || [], rows = p.rows || [];
    const root = S.add(`<div class="tb">${p.title ? `<h3 class="side-h">${S.md(p.title)}</h3>` : ""}<div class="tb-grid" style="grid-template-columns:${p.widths || `1.3fr repeat(${cols.length - 1}, 1fr)`}">
      ${cols.map((c) => `<div class="tb-c tb-head"><span>${S.md(c)}</span></div>`).join("")}
      ${rows.map((r, ri) => (r.cells || r).map((c, ci) => `<div class="tb-c ${ci === 0 ? "tb-first" : ""} ${r.hl ? "tb-hl" : ""}" data-r="${ri}"><span>${S.md(String(c))}</span></div>`).join("")).join("")}
    </div>${p.note ? `<p class="tb-note">${S.md(p.note)}</p>` : ""}</div>`);
    if (p.title) S.enter(S.t0, root.querySelector(".side-h"), { y: 16, d: 0.45 });
    root.querySelectorAll(".tb-head").forEach((h, k) => S.fade(S.t0 + 0.1 + k * 0.03, h, 0.25));
    const times = S.spread(rows.map((r) => (r.at ? { at: r.at } : {})), 0.12, 0.7);
    rows.forEach((r, ri) => root.querySelectorAll(`.tb-c[data-r="${ri}"]`).forEach((c, ci) => S.enter(times[ri] + ci * 0.03, c, { y: 12, d: 0.35 })));
    if (p.note) S.fade(S.cue(p.note_at, 0.85), root.querySelector(".tb-note"), 0.3);
    S.marks(root, S.frac(0.8));
    S.still = true;
  };

  // ---------------- systems: who does what (System One, System Two, code, you) ----------------
  T.systems = (S, p) => {
    const cols = p.cols || [];
    const root = S.add(`<div class="sy n${cols.length}">${p.title ? `<h3 class="side-h sy-title">${S.md(p.title)}</h3>` : ""}<div class="sy-cols">${cols.map((c) => `<div class="sy-col who-${c.who}"><div class="sy-av"></div><b class="sy-h">${S.md(c.title)}</b>${c.sub ? `<i class="sy-s">${S.md(c.sub)}</i>` : ""}<ul>${(c.items || []).map((x) => `<li>${S.md(x)}</li>`).join("")}</ul></div>`).join("")}</div></div>`);
    if (p.title) S.enter(S.t0, root.querySelector(".sy-title"), { y: 16, d: 0.45 });
    const times = S.spread(cols, 0.04, 0.6);
    root.querySelectorAll(".sy-col").forEach((el, k) => {
      const c = cols[k], t = times[k];
      S.enter(t, el, { y: 30, d: 0.5 });
      const n = S.actor(el.querySelector(".sy-av"), c.who, { size: S.portrait ? 130 : 190, mood: c.mood || "normal" });
      S.hopIn(t + 0.1, n, { h: 50 });
      el.querySelectorAll("li").forEach((li, j) => S.enter(t + 0.45 + j * 0.12, li, { x: -10, y: 0, d: 0.3 }));
      if (c.react) S.react(S.cue(c.react.at, 0.8), n, c.react.mood);
    });
    S.focusEl = root.querySelector(".sy-cols");
  };

  // ---------------- router: one fast judgment picks the handler ----------------
  T.router = (S, p) => {
    const routes = p.routes || [];
    const root = S.add(`<div class="rt">
      ${p.title ? `<h3 class="side-h rt-title">${S.md(p.title)}</h3>` : ""}
      <div class="rt-in">
        <div class="rt-src card"><span class="lbl">${S.esc(p.source?.label || "request")}</span><p>${S.md(p.source?.text || "")}</p></div>
        <div class="rt-hub"><span class="rt-av"></span><b>${S.md(p.hub?.label || "one decision")}</b><i>${S.md(p.hub?.sub || "")}</i></div>
        <svg class="rt-wires" preserveAspectRatio="none"></svg>
        <div class="rt-dst">${routes.map((r) => `<div class="rt-d tone-${r.tone || "ink"}">${isChar(r.who) ? A.char(r.who, { size: 70 }) : A.icon(r.icon || "code", 44)}<span><b>${S.md(r.label)}</b><i>${S.md(r.sub || "")}</i></span>${r.share != null ? `<em>${pct(r.share)}</em>` : ""}</div>`).join("")}</div>
      </div>
      ${p.caption ? `<p class="rt-cap">${S.md(p.caption)}</p>` : ""}
    </div>`);
    if (p.title) S.enter(S.t0, root.querySelector(".rt-title"), { y: 16, d: 0.45 });
    const src = root.querySelector(".rt-src"), hub = root.querySelector(".rt-hub"), wires = root.querySelector(".rt-wires");
    S.enter(S.t0 + 0.1, src, { x: -24, y: 0, d: 0.45 });
    const hn = S.actor(root.querySelector(".rt-av"), p.hub?.who || "snap", { size: S.portrait ? 150 : 180 });
    S.enter(S.t0 + 0.25, hub, { y: 20, d: 0.45 }); S.hopIn(S.t0 + 0.3, hn, { h: 40 });
    // wires are measured from layout: hub centre to each destination's left edge (or top in portrait)
    const box = root.querySelector(".rt-in"), bw = box.offsetWidth, bh = box.offsetHeight;
    wires.setAttribute("viewBox", `0 0 ${bw} ${bh}`); wires.style.width = bw + "px"; wires.style.height = bh + "px";
    const rel = (el) => { let x = 0, y = 0, n = el; while (n && n !== box) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; } return [x, y, el.offsetWidth, el.offsetHeight]; };
    const [hx, hy, hw, hh] = rel(hub);
    const dsts = [...root.querySelectorAll(".rt-d")];
    wires.innerHTML = dsts.map((d) => { const [x, y, w, hgt] = rel(d); const a = S.portrait ? [hx + hw / 2, hy + hh] : [hx + hw, hy + hh / 2], b = S.portrait ? [x + w / 2, y] : [x, y + hgt / 2]; const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; return `<path data-draw d="M${a[0]} ${a[1]} C${S.portrait ? `${a[0]} ${my} ${b[0]} ${my}` : `${mx} ${a[1]} ${mx} ${b[1]}`} ${b[0]} ${b[1]}"/>`; }).join("") + `<path class="rt-feed" data-draw d="M${rel(src)[0] + rel(src)[2]} ${rel(src)[1] + rel(src)[3] / 2} L${hx} ${hy + hh / 2}"/>`;
    const feed = wires.querySelector(".rt-feed");
    if (!S.portrait) S.draw(S.t0 + 0.45, feed, 0.35); else gsap.set(feed, { autoAlpha: 0 });
    const times = S.spread(routes, 0.3, 0.8);
    dsts.forEach((d, k) => { S.draw(times[k] - 0.15, wires.querySelectorAll("path")[k], 0.4); S.enter(times[k], d, { x: 24, y: 0, d: 0.4 }); const em = d.querySelector("em"); if (em) S.pop(times[k] + 0.3, em, { from: 0.5, d: 0.4 }); });
    if (p.caption) S.enter(S.cue(p.caption_at, 0.85), root.querySelector(".rt-cap"), { y: 12, d: 0.4 });
    S.focusEl = box;
  };

  // ---------------- jagged: a failure, the truth, and the fix ----------------
  T.jagged = (S, p) => {
    const root = S.add(`<div class="jg">
      <div class="jg-k">${A.icon("warn", 34)}<span>${S.esc(p.kicker || "Jagged edge")}</span></div>
      <div class="jg-card card">
        ${p.state ? `<div class="jg-st"><span class="lbl">state</span><code>${S.esc(p.state)}</code></div>` : ""}
        <div class="jg-q">${badge(p.type || "choice")}<span>${S.md(p.question)}</span></div>
        <div class="jg-row"><div class="jg-ans"><span class="lbl">model says</span><b>${S.esc(p.answer?.text ?? "")}</b>${p.answer?.p != null ? `<em>p = ${f2(p.answer.p)}</em>` : ""}<i class="jg-x">${A.icon("x", 60)}</i></div>
        <div class="jg-truth"><span class="lbl">truth</span><b>${S.esc(p.truth ?? "")}</b></div></div>
      </div>
      ${p.fix ? `<div class="jg-fix"><span class="lbl">${S.esc(p.fix.label || "keep it in code")}</span><pre>${String(p.fix.code || "").split("\n").map((l) => hl(l, p.fix.lang || "py")).join("\n")}</pre></div>` : ""}
    </div>`);
    S.enter(S.t0, root.querySelector(".jg-k"), { x: -16, y: 0, d: 0.35 });
    const card = root.querySelector(".jg-card"); S.set(S.t0, card, {});
    if (p.state) S.enter(S.t0 + 0.1, root.querySelector(".jg-st"), { y: 12, d: 0.35 });
    S.enter(S.t0 + 0.2, root.querySelector(".jg-q"), { y: 12, d: 0.4 });
    const ta = S.cue(p.answer_at, 0.35);
    S.pop(ta, root.querySelector(".jg-ans"), { from: 0.7, zeta: 0.6 });
    const tt = S.cue(p.truth_at, 0.55);
    S.pop(tt, root.querySelector(".jg-truth"), { from: 0.7, zeta: 0.6 });
    const x = root.querySelector(".jg-x"); S.slam(tt + 0.35, x, { from: 2.2, rot: -14, to: -6 });
    if (p.fix) S.enter(S.cue(p.fix_at, 0.72), root.querySelector(".jg-fix"), { y: 20, d: 0.45 });
    S.want("punch", tt + 0.5, root.querySelector(".jg-row"), 2, 1.07);
    S.focusEl = card;
  };

  // ---------------- outro card (course end / lesson end) ----------------
  T.outro = (S, p) => {
    const root = S.add(`<div class="oc"><div class="oc-art"></div><h2 class="stm-h size-l">${S.md(p.text || "")}</h2>${p.sub ? `<p class="stm-sub">${S.md(p.sub)}</p>` : ""}</div>`);
    const art = root.querySelector(".oc-art");
    (p.cast || ["snap", "mull", "curly", "you"]).forEach((w, k) => { const n = S.actor(art, w, { size: S.portrait ? 150 : 170, mood: "happy" }); S.hopIn(S.t0 + 0.2 + k * 0.12, n, { h: 60 + k * 10 }); });
    S.say(root.querySelector(".stm-h"), S.t0 + 0.3);
    if (p.sub) S.rise(S.cue(p.sub_at, 0.5), root.querySelector(".stm-sub"));
    S.want("reveal", S.t0 + 0.1, art);
  };
})();
