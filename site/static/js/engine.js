// System One lesson engine.
// A lesson is data: scenes {template, narration, params, start, dur} + word timings. Every frame is a pure function
// of lesson time t: one paused GSAP timeline for the smooth layer (UI, text, data, camera), one paused "cast"
// timeline drawn in 15 fps steps (the characters, like hand animation), and ambient functions of t (idle, boil,
// counters). The same page plays interactively, scrubs, and captures frame-exact video.
// Directing (Motion Lab / Lantern v2.2): the camera is punctuation, not decoration (hold by default; rationed
// accents; transitions give and take); every seam has a reason (cut / signature wipe / zoom / dissolve).
(function () {
  "use strict";
  const M = window.S1M, { E, F, SPRING, springEase, landAt, step, zlerp, CAMD, PAYOFF_HOLD } = M;
  const NORM = (s) => String(s).toLowerCase().replace(/[’'`]/g, "").replace(/[^a-z0-9]+/g, "");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // inline markup: *marker highlight*  _underline_  ~strike~  `code`  **bold**  [[s1:yellow text]]
  const md = (s) => esc(s)
    .replace(/`([^`]+)`/g, '<code class="ic">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, '<span class="mk">$1</span>')
    .replace(/(^|[\s(])_(.+?)_(?=[\s.,;:!?)]|$)/g, '$1<span class="ul">$2</span>')
    .replace(/~(.+?)~/g, '<span class="st">$1</span>');
  function h(html) { const t = document.createElement("template"); t.innerHTML = String(html).trim(); return t.content.firstElementChild; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const BOIL_FPS = 8;

  class Lesson {
    constructor(stage, data, opts = {}) {
      this.stage = stage; this.data = data;
      this.mode = opts.mode || "web"; // web | capture
      this.portrait = !!opts.portrait;
      this.W = this.portrait ? 1080 : 1920; this.H = this.portrait ? 1920 : 1080;
      this.lite = !!opts.lite || (this.mode === "web" && window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
      this.tl = gsap.timeline({ paused: true });
      this.cast = gsap.timeline({ paused: true });
      this.scenes = []; this.gates = []; this.cueErrors = []; this.sfx = [];
      this.total = data.total;
      stage.classList.toggle("portrait", this.portrait); stage.classList.toggle("landscape", !this.portrait);
      stage.classList.add("mode-" + this.mode);
      this.words = [];
      data.scenes.forEach((sc, i) => (sc.words || []).forEach((w) => this.words.push({ ...w, n: NORM(w.text), scene: i })));
      this.build();
    }
    build() {
      const { stage, data } = this;
      stage.innerHTML = "";
      stage.appendChild(h(`<svg class="fxdefs" width="0" height="0" aria-hidden="true"><defs>${[0, 1, 2].map((k) => `<filter id="boil${k}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${k * 17 + 3}"/><feDisplacementMap in="SourceGraphic" scale="${k === 0 ? 2.2 : 2.6}" xChannelSelector="R" yChannelSelector="G"/></filter>`).join("")}</defs></svg>`));
      this.layer = h('<div class="scenes"></div>'); stage.appendChild(this.layer);
      data.scenes.forEach((sc, i) => this.buildScene(sc, i));
      this.finalize();
      this.cap = h('<div class="cap"><span class="cap-in"></span></div>'); stage.appendChild(this.cap);
      this.buildCaptions();
      this.bar = h('<div class="stage-progress"><i></i></div>'); stage.appendChild(this.bar);
      if (data.brand !== false) stage.appendChild(h(`<div class="brand"><span class="brand-dot"></span>system one</div>`));
    }
    buildScene(sc, i) {
      const T = window.S1_TEMPLATES;
      const el = h(`<section class="scene tpl-${sc.template} bg-${sc.bg || T.defaultBg(sc.template)}"><div class="bgfar"></div><div class="cam"></div></section>`);
      this.layer.appendChild(el);
      const cam = el.querySelector(".cam");
      const S = new SceneCtx(this, sc, i, el, cam, this.words.filter((w) => w.scene === i));
      const tpl = T[sc.template];
      if (!tpl) cam.appendChild(h(`<div class="err">unknown template ${esc(sc.template)}</div>`));
      else { try { tpl(S, sc.params || {}); } catch (e) { console.error("template", sc.template, e); cam.appendChild(h(`<div class="err">${esc(sc.template)}: ${esc(e.message)}</div>`)); } }
      if (sc.params && sc.params.hnote) S.note(sc.params.hnote);
      if (sc.template !== "title" && this.data.number != null && sc.kicker !== false) el.appendChild(h(`<div class="kicker"><b>${String(this.data.number).padStart(2, "0")}</b><span class="kt">${esc(this.data.short || this.data.title)}</span></div>`));
      this.scenes.push(S);
    }
    // seams with reasons + the director, once every scene exists (the director reads layout and history)
    finalize() {
      const n = this.scenes.length;
      this.scenes.forEach((S, i) => {
        const prev = this.scenes[i - 1];
        const reason = S.sc.seam || (i === 0 ? "none" : S.sc.template === "quiz" ? "zoom" : (S.sc.template === "recap" || S.sc.template === "outro") ? "dissolve" : (S.sc.chapter && prev && S.sc.chapter !== prev.sc.chapter) ? "wipe" : "cut");
        S.seam = reason;
        const b = S.t0;
        if (i === 0) gsap.set(S.el, { autoAlpha: 1 });
        else {
          gsap.set(S.el, { autoAlpha: 0 });
          if (reason === "dissolve") { this.tl.fromTo(S.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: "none", immediateRender: false }, b - 0.25); this.tl.to(prev.el, { autoAlpha: 0, duration: 0.5, ease: "none" }, b - 0.25); }
          else if (reason === "zoom") { this.tl.fromTo(S.el, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: E.out, immediateRender: false }, b); this.tl.to(prev.el, { autoAlpha: 0, duration: 0.2, ease: E.exit }, b); }
          else if (reason === "wipe") { this.wipe(b, prev, S); }
          else { this.tl.set(prev.el, { autoAlpha: 0 }, b); this.tl.set(S.el, { autoAlpha: 1 }, b); } // hard cut on a finished frame
        }
      });
      // director: camera moves decided per scene from its content, with history across scenes (give and take)
      const hist = [];
      this.scenes.forEach((S) => S.direct(hist));
      this.tl.set({}, {}, this.total);
    }
    // the course's signature seam: a probability bar fills the frame left to right, the scene changes under it,
    // then the bar drains out to the right (cover 0.3 s on an accelerating ease, uncover 0.34 s decaying)
    wipe(b, prev, S) {
      const w = h(`<div class="seam-wipe"><i class="sw-fill"></i><i class="sw-edge"></i></div>`); this.layer.appendChild(w);
      gsap.set(w, { autoAlpha: 0, xPercent: -100 });
      this.tl.set(w, { autoAlpha: 1 }, b - 0.3);
      this.tl.fromTo(w, { xPercent: -100 }, { xPercent: 0, duration: 0.3, ease: E.contact, immediateRender: false }, b - 0.3);
      this.tl.set(prev.el, { autoAlpha: 0 }, b); this.tl.set(S.el, { autoAlpha: 1 }, b);
      this.tl.to(w, { xPercent: 100, duration: 0.34, ease: E.out }, b);
      this.tl.set(w, { autoAlpha: 0 }, b + 0.35);
      this.sfx.push({ t: b - 0.3 + F, name: "whoosh", gain: 0.5 });
    }
    // ---------- captions ----------
    buildCaptions() {
      const caps = []; let cur = []; const all = this.words;
      const flush = () => { if (cur.length) caps.push({ w: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
      all.forEach((w, i) => {
        const nx = all[i + 1]; cur.push(w);
        const end = /[.?!]["”)]?$/.test(w.text), soft = /[,;:—–-]["”]?$/.test(w.text);
        const gap = nx ? nx.s - w.e : 9, maxW = this.portrait ? 6 : 9;
        if (end || gap > 0.5 || cur.length >= maxW || (soft && cur.length >= 4) || (nx && nx.scene !== w.scene)) flush();
      });
      flush();
      caps.forEach((c, i) => (c.until = Math.min(c.e + 0.5, caps[i + 1] ? caps[i + 1].s - 0.02 : c.e + 0.5)));
      this.caps = caps; this.capIdx = -2;
    }
    updateCaptions(t) {
      const caps = this.caps; let idx = -1;
      for (let i = 0; i < caps.length; i++) { if (t >= caps[i].s - 0.06 && t < caps[i].until) { idx = i; break; } if (caps[i].s > t) break; }
      const inner = this.cap.firstElementChild;
      if (idx !== this.capIdx) { this.capIdx = idx; inner.innerHTML = idx < 0 ? "" : caps[idx].w.map((w) => `<span>${esc(w.text)}</span>`).join(" "); this.cap.classList.toggle("on", idx >= 0); }
      if (idx >= 0) { const sp = inner.children; caps[idx].w.forEach((w, k) => { sp[k].className = t >= w.s - 0.02 ? (t < w.e + 0.04 ? "now" : "said") : ""; }); }
    }
    seek(t) {
      t = Math.max(0, Math.min(t, this.total));
      this.tl.time(t, false);
      const ts = step(t); if (ts !== this.castAt) { this.castAt = ts; this.cast.time(ts, false); }
      const boil = this.lite ? 0 : Math.floor(t * BOIL_FPS) % 3; if (boil !== this.boilAt) { this.boilAt = boil; this.stage.dataset.boil = boil; }
      const lastS = this.scenes[this.scenes.length - 1];
      for (const S of this.scenes) {
        const vis = t >= S.t0 - 0.6 && (t <= S.t1 + 0.6 || S === lastS);
        S.cam.style.visibility = vis ? "inherit" : "hidden";
        if (vis) { S.ambient.forEach((f) => f(t)); S.camWrite(t); }
      }
      this.updateCaptions(t);
      this.bar.firstElementChild.style.transform = `scaleX(${(t / this.total).toFixed(4)})`;
      for (const g of this.gates) if (this.mode === "capture") g.auto(t);
      this.t = t;
    }
    sceneAt(t) { let k = 0; this.scenes.forEach((S, i) => { if (t >= S.t0 - 0.2) k = i; }); return k; }
  }

  // ---------- per-scene authoring context ----------
  class SceneCtx {
    constructor(L, sc, i, el, cam, words) {
      Object.assign(this, { L, sc, i, el, cam, ws: words });
      this.t0 = sc.start; this.dur = sc.dur; this.t1 = sc.start + sc.dur;
      this.tl = L.tl; this.cast = L.cast; this.ambient = [];
      this.portrait = L.portrait; this.W = L.W; this.H = L.H;
      this.wants = []; this.beats = []; this.pays = []; this.still = false; this.focusEl = null;
      this.camEvents = []; this.camBase = { s: 1, tx: 0, ty: 0 }; this.camLast = "";
    }
    h(html) { return h(html); }
    add(html, parent) { const e = typeof html === "string" ? h(html) : html; (parent || this.cam).appendChild(e); return e; }
    md(s) { return md(s); }
    esc(s) { return esc(s); }
    frac(f) { return this.t0 + f * this.dur; }
    // global time of a phrase spoken in this scene (word-level match, punctuation-insensitive)
    find(phrase, nth = 0, quiet = false) {
      if (phrase == null) return null;
      const toks = String(phrase).split(/\s+/).map(NORM).filter(Boolean);
      if (!toks.length) return null;
      const ws = this.ws; let hit = 0;
      for (let i = 0; i + toks.length <= ws.length; i++) {
        let ok = true;
        for (let k = 0; k < toks.length; k++) if (ws[i + k].n !== toks[k]) { ok = false; break; }
        if (ok && hit++ === nth) return [i, i + toks.length - 1];
      }
      if (toks.length > 1) for (let i = 0; i < ws.length; i++) if (ws[i].n === toks[0]) return [i, i];
      if (toks[0].length >= 4) for (let i = 0; i < ws.length; i++) if (ws[i].n.startsWith(toks[0]) || (toks[0].startsWith(ws[i].n) && ws[i].n.length >= 4)) return [i, i];
      if (!quiet) this.L.cueErrors.push(`scene ${this.i} (${this.sc.template}): "${phrase}"`);
      return null;
    }
    cue(phrase, fallback = 0.15, nth = 0) { if (typeof phrase === "number") return this.frac(phrase); const r = this.find(phrase, nth); return r ? this.ws[r[0]].s : this.frac(fallback); }
    cueEnd(phrase, fallback = 0.5) { const r = this.find(phrase); return r ? this.ws[r[1]].e : this.frac(fallback); }
    spread(items, a = 0.08, b = 0.7, key = "at") {
      const n = items.length;
      return items.map((it, k) => (it && it[key] != null ? this.cue(it[key], a + (b - a) * (n > 1 ? k / (n - 1) : 0)) : this.frac(a + (b - a) * (n > 1 ? k / (n - 1) : 0))));
    }
    amb(fn) { this.ambient.push(fn); }
    // seek-safe class toggles and text swaps (pure functions of t, never timeline callbacks)
    cls(el, name, from, to = Infinity) { if (!el) return; this.amb((t) => el.classList.toggle(name, t >= from && t < to)); this.beat(from); }
    textAt(el, steps) { const st = steps.slice().sort((a, b) => a[0] - b[0]), init = el.textContent; let cur = null; this.amb((t) => { let v = init; for (const [tt, val] of st) if (t >= tt) v = val; if (v !== cur) { cur = v; el.textContent = v; } }); }
    sfx(name, t, gain = 1) { if (Number.isFinite(t)) this.L.sfx.push({ t: +t.toFixed(3), name, gain }); }
    // ---------- directing hooks ----------
    beat(t) { if (Number.isFinite(t)) this.beats.push(t); }                // something new happened (dead-beat check)
    payoff(t) { if (Number.isFinite(t)) this.pays.push(t); }              // a payoff landed: it gets air after it
    want(kind, t, focus, prio = 1, zoom = null) { if (Number.isFinite(t)) { this.wants.push({ kind, t, focus, prio, zoom }); this.beats.push(t); } }
    center(el) { // element centre in stage coordinates (offset chain: immune to transforms)
      if (!el) return [this.W / 2, this.H / 2];
      if (Array.isArray(el)) return el;
      let x = el.offsetWidth / 2, y = el.offsetHeight / 2, n = el;
      while (n && n !== this.el) { x += n.offsetLeft || 0; y += n.offsetTop || 0; n = n.offsetParent; }
      return [x, y];
    }
    // union of the visible content boxes (offset chain, immune to transforms), in stage coordinates
    bbox() {
      const root = this.cam.firstElementChild; if (!root) return null;
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      const walk = (el, depth) => {
        for (const c of el.children) {
          if (c.offsetWidth === undefined || c.classList.contains("cap")) continue;
          // inline boxes that wrap report a misleading offsetLeft/width: measure their block parent instead
          if (getComputedStyle(c).display === "inline") continue;
          const w = c.offsetWidth, h = c.offsetHeight;
          const textBlock = [...c.children].some((k) => getComputedStyle(k).display === "inline");
          if (depth >= 2 || !c.children.length || textBlock) { if (w && h) { const [cx, cy] = this.center(c); x0 = Math.min(x0, cx - w / 2); x1 = Math.max(x1, cx + w / 2); y0 = Math.min(y0, cy - h / 2); y1 = Math.max(y1, cy + h / 2); } }
          else walk(c, depth + 1);
        }
      };
      walk(root, 0);
      return x1 > x0 ? [x0, y0, x1, y1] : null;
    }
    direct(hist) {
      const W = this.W, H = this.H, C = [W / 2, H * 0.47], dur = this.dur, t0 = this.t0;
      // content box (stage coords): a move may zoom only as far as the content still fits inside the safe frame
      const bb = this.bbox(), m = 36, mt = this.portrait ? 170 : 96, mb = this.portrait ? 300 : 150;
      const fitS = bb ? Math.max(1, Math.min((W - 2 * m) / Math.max(1, bb[2] - bb[0]), (H - mt - mb) / Math.max(1, bb[3] - bb[1]))) : 1.2;
      const clampC = (c) => {
        const s = Math.max(1, Math.min(c.s, fitS));
        let tx = c.tx, ty = c.ty;
        // keep the scaled content inside the safe frame (centred on an axis where it can't fit)
        const fx = (lo, hi, v) => (lo <= hi ? clamp(v, lo, hi) : (lo + hi) / 2);
        if (bb) { tx = fx(m - s * bb[0], W - m - s * bb[2], tx); ty = fx(mt - s * bb[1], H - mb - s * bb[3], ty); }
        return { s, tx: clamp(tx, -(s - 1) * W, 0), ty: clamp(ty, -(s - 1) * H, 0) };
      };
      const aim = (c0, p, s1, kc) => { s1 = Math.min(s1, fitS); const S0 = [c0.tx + c0.s * p[0], c0.ty + c0.s * p[1]], S1 = [S0[0] + (C[0] - S0[0]) * kc, S0[1] + (C[1] - S0[1]) * kc]; return clampC({ s: s1, tx: S1[0] - s1 * p[0], ty: S1[1] - s1 * p[1] }); };
      const ID = { s: 1, tx: 0, ty: 0 }, prev = hist.slice(-2), lastIn = hist.length && hist[hist.length - 1].dir === "in";
      const evs = []; let dir = "hold", acc = null;
      // content taller or wider than the safe frame: zoom out until it fits, centred, and hold (no punch can help here)
      const fit0 = bb ? Math.min(1, (W - 2 * m) / Math.max(1, bb[2] - bb[0]), (H - mt - mb) / Math.max(1, bb[3] - bb[1])) : 1;
      if (fit0 < 0.995) {
        this.camBase = { s: fit0, tx: W / 2 - (fit0 * (bb[0] + bb[2])) / 2, ty: (mt + H - mb) / 2 - (fit0 * (bb[1] + bb[3])) / 2 };
        this.camEvents = []; hist.push({ acc: false, dir: "hold" }); this.camLog = `fit ${fit0.toFixed(2)}`;
        const ts0 = [t0, ...this.beats.filter((t) => t > t0 && t < t0 + dur).sort((a, b) => a - b), t0 + dur];
        this.maxGap = Math.max(...ts0.slice(1).map((t, i) => t - ts0[i])); this.el.dataset.cam = this.camLog; this.el.dataset.gap = this.maxGap.toFixed(2);
        return;
      }
      if (this.still || this.L.lite) { hist.push({ acc: false, dir: "hold" }); this.camLog = "hold"; return; }
      const reveal = this.wants.find((w) => w.kind === "reveal");
      if (reveal) { this.camBase = aim(ID, this.center(reveal.focus), 1.07, 0); evs.push({ at: reveal.t, d: CAMD.pull, ease: gsap.parseEase(E.long), to: ID, kind: "pull" }); dir = "out"; }
      acc = this.wants.filter((w) => w.kind === "punch").sort((a, b) => b.prio - a.prio || a.t - b.t)[0] || null;
      if (acc && acc.prio < 3 && prev.length === 2 && prev.every((x) => x.acc)) acc = null; // bold type loses meaning if every shot has it
      if (acc) {
        const rest = evs.length ? ID : this.camBase, to = aim(rest, this.center(acc.focus), acc.zoom || 1.1, 0.22);
        evs.push({ at: acc.t, d: CAMD.punch, ease: gsap.parseEase("power2.inOut"), to, kind: "punch" });
        this.pays.push(acc.t + CAMD.punch); dir = "in";
        const back = acc.t + CAMD.punch + PAYOFF_HOLD;
        if (t0 + dur - back > 2.2) { evs.push({ at: back + 0.6, d: CAMD.pull, ease: gsap.parseEase(E.long), to: ID, kind: "pull" }); dir = "out"; }
      } else if (!reveal) {
        // a transition only when it earns it: a requested push (tension) or a dead stretch of 3.5 s with nothing new
        const pw = this.wants.find((w) => w.kind === "push");
        const ts = [t0, ...this.beats.filter((t) => t > t0 && t < t0 + dur).sort((a, b) => a - b), t0 + dur]; let g = null;
        for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] >= 3.5 && (!g || ts[i] - ts[i - 1] > g[1] - g[0])) g = [ts[i - 1], ts[i]];
        const at = pw ? pw.t : g ? Math.max(t0 + 0.4, (g[0] + g[1]) / 2 - CAMD.push / 2) : null;
        const f = this.center(pw?.focus || this.focusEl);
        if (at != null && at < t0 + dur - 0.8) {
          if (lastIn) { this.camBase = aim(ID, f, 1.05, 0); evs.push({ at, d: CAMD.pull, ease: gsap.parseEase(E.long), to: ID, kind: "pull" }); dir = "out"; }
          else { evs.push({ at, d: CAMD.push, ease: gsap.parseEase(E.sine), to: aim(ID, f, 1.05, 0.25), kind: "push" }); dir = "in"; }
        }
      }
      evs.sort((a, b) => a.at - b.at);
      this.camEvents = evs;
      hist.push({ acc: !!acc, dir }); if (hist.length > 8) hist.shift();
      this.camLog = evs.map((e) => `${e.kind}@${(e.at - t0).toFixed(2)}`).join(" ") || "hold";
      const ts = [t0, ...this.beats.filter((t) => t > t0 && t < t0 + dur).sort((a, b) => a - b), t0 + dur];
      this.maxGap = Math.max(...ts.slice(1).map((t, i) => t - ts[i]));
      this.el.dataset.cam = this.camLog; this.el.dataset.gap = this.maxGap.toFixed(2);
    }
    camAt(t) {
      let c = this.camBase;
      for (const e of this.camEvents) {
        if (t < e.at) break;
        const p = e.d ? e.ease(Math.min(1, (t - e.at) / e.d)) : 1;
        c = { s: zlerp(c.s, e.to.s, p), tx: c.tx + (e.to.tx - c.tx) * p, ty: c.ty + (e.to.ty - c.ty) * p };
      }
      return c;
    }
    camWrite(t) {
      if (!this.camEvents.length && this.camBase.s === 1) { if (this.camLast !== "id") { this.camLast = "id"; this.cam.style.transform = ""; } return; }
      const c = this.camAt(t), key = `${c.s.toFixed(4)}|${c.tx.toFixed(1)}|${c.ty.toFixed(1)}`;
      if (key === this.camLast) return; this.camLast = key;
      this.cam.style.transform = `translate(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px) scale(${c.s.toFixed(4)})`;
      const far = this.el.firstElementChild; // parallax: the far layer moves at 0.3
      if (far) far.style.transform = `translate(${(c.tx * 0.3).toFixed(2)}px, ${(c.ty * 0.3).toFixed(2)}px) scale(${(1 + (c.s - 1) * 0.3).toFixed(4)})`;
    }

    // ---------- the smooth layer: entrances decay, exits accelerate, text never bounces ----------
    hide(el) { gsap.set(el, { autoAlpha: 0 }); return el; }
    // opacity linear over 4 frames in its own tween + meaningful travel on ease-out-expo
    enter(t, el, { x = 0, y = 26, d = 0.5, ease = E.out } = {}) {
      if (!el) return t;
      gsap.set(el, { autoAlpha: 0 });
      this.tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 * F, ease: "none", immediateRender: false }, t);
      if (x || y) this.tl.fromTo(el, { x, y }, { x: 0, y: 0, duration: d, ease, immediateRender: false }, t);
      this.beat(t); return t + d;
    }
    rise(t, el, d = 0.5, y = 26) { return this.enter(t, el, { y, d }); }
    slideL(t, el, d = 0.5) { return this.enter(t, el, { x: -60, y: 0, d }); }
    slideR(t, el, d = 0.5) { return this.enter(t, el, { x: 60, y: 0, d }); }
    fade(t, el, d = 0.4) {
      if (!el) return t; gsap.set(el, { autoAlpha: 0 });
      this.tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: d, ease: "none", immediateRender: false }, t); this.beat(t); return t + d;
    }
    // cards, chips, stickers: opacity linear, scale + rotation on a spring. Returns the landing (contact) time.
    pop(t, el, { from = 0.6, zeta = 0.55, d = 0.5, rot = 0, origin = null } = {}) {
      if (!el) return t;
      gsap.set(el, { autoAlpha: 0 });
      this.tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 4 * F, ease: "none", immediateRender: false }, t);
      const a = { scale: from, rotation: rot }; if (origin) a.transformOrigin = origin;
      this.tl.fromTo(el, a, { scale: 1, rotation: 0, duration: d, ease: springEase(zeta), immediateRender: false }, t);
      this.beat(t); return t + d * landAt(zeta);
    }
    // a big word or number lands: accelerates into contact, squashes, settles on a cartoon spring. Returns contact.
    slam(t, el, { from = 1.9, rot = -6, to = -2, d = 0.16 } = {}) {
      if (!el) return t;
      gsap.set(el, { autoAlpha: 0 });
      this.tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 * F, ease: "none", immediateRender: false }, t);
      this.tl.fromTo(el, { scale: from, rotation: rot }, { scale: 0.93, rotation: to, duration: d, ease: E.contact, immediateRender: false }, t);
      this.tl.to(el, { scale: 1, duration: 0.45, ease: SPRING.toon }, t + d);
      this.beat(t); this.sfx("slam", t + d + F, 0.8); this.payoff(t + d); return t + d;
    }
    exit(t, el, d = 0.25, to = {}) { this.tl.to(el, Object.assign({ autoAlpha: 0, y: -12, duration: d, ease: E.exit }, to), t); return t + d; }
    to(t, el, vars) { this.tl.to(el, Object.assign({ duration: 0.45, ease: E.ui }, vars), t); return el; }
    set(t, el, vars) { this.tl.set(el, vars, t); return el; }
    stagger(t, els, gap = 0.06, how = "rise") { let last = t; [...els].forEach((e, k) => { last = this[how](t + k * gap, e); }); return last; }
    draw(t, el, d = 0.7, ease = E.move) {
      if (!el) return t;
      const paths = /^(path|line|circle|polyline|rect|ellipse|polygon)$/.test(el.tagName) ? [el] : [...el.querySelectorAll("[data-draw]")];
      paths.forEach((p) => { p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1 1"; p.style.strokeDashoffset = "1"; });
      this.tl.fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease, stagger: d * 0.12, immediateRender: false }, t);
      this.beat(t); return t + d;
    }
    marks(el, t, minT) {
      el.querySelectorAll(".mk,.ul,.st").forEach((m) => {
        const r = this.find(m.textContent, 0, true);
        let at = r ? this.ws[r[1]].e - 0.1 : t; if (minT != null) at = Math.max(at, minT);
        gsap.set(m, { "--sw": 0 });
        this.tl.fromTo(m, { "--sw": 0 }, { "--sw": 1, duration: 0.42, ease: E.soft, immediateRender: false }, at);
      });
    }
    split(el) {
      const spans = [];
      const walk = (node) => [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(" ")); else { const sp = document.createElement("span"); sp.className = "w"; sp.textContent = w; frag.appendChild(sp); spans.push(sp); } });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !/^(svg|code)$/i.test(n.tagName)) walk(n);
        else if (n.nodeType === 1) spans.push(n);
      });
      walk(el); return spans;
    }
    // words appear as they are spoken (if they are in the narration), else a quick stagger from t
    say(el, t, gap = 0.07) {
      const spans = this.split(el), ws = this.ws; let wi = 0, last = t;
      spans.forEach((sp, k) => {
        const n = NORM(sp.textContent); let tt = null;
        for (let j = wi; j < Math.min(ws.length, wi + 6) && n; j++) if (ws[j].n === n) { tt = ws[j].s; wi = j + 1; break; }
        if (tt == null || tt < last - 0.05) tt = Math.max(last + 0.03, t + k * gap * 0.4);
        tt = Math.max(tt, t); last = tt;
        gsap.set(sp, { autoAlpha: 0 });
        this.tl.fromTo(sp, { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 * F, ease: "none", immediateRender: false }, tt - 0.06);
        this.tl.fromTo(sp, { y: 12 }, { y: 0, duration: 0.32, ease: E.out, immediateRender: false }, tt - 0.06);
      });
      this.beat(t); return el;
    }
    words(t, el, gap = 0.06) {
      const spans = this.split(el);
      spans.forEach((sp, k) => { gsap.set(sp, { autoAlpha: 0 }); this.tl.fromTo(sp, { autoAlpha: 0 }, { autoAlpha: 1, duration: 3 * F, ease: "none", immediateRender: false }, t + k * gap); this.tl.fromTo(sp, { y: 16 }, { y: 0, duration: 0.38, ease: E.out, immediateRender: false }, t + k * gap); });
      this.beat(t); return t + spans.length * gap + 0.38;
    }
    type(t, el, text, cps = 38) {
      const s = String(text), d = Math.max(0.15, s.length / cps), o = { n: 0 };
      el.textContent = "";
      this.tl.fromTo(o, { n: 0 }, { n: s.length, duration: d, ease: "none", immediateRender: false, onUpdate: () => (el.textContent = s.slice(0, Math.round(o.n))) }, t);
      this.beat(t); return t + d;
    }
    // counters start on the word that names them, snap to integers or fixed decimals, hold tabular figures
    count(t, el, to, { d = 1.1, decimals = 0, prefix = "", suffix = "", from = 0 } = {}) {
      const o = { v: from }, fmt = (v) => prefix + Number(v).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      el.textContent = fmt(from);
      this.tl.fromTo(o, { v: from }, { v: to, duration: d, ease: E.soft, immediateRender: false, onUpdate: () => (el.textContent = fmt(o.v)) }, t);
      this.beat(t); return t + d;
    }
    // a probability bar: the fill snaps to its value on ease-out (0.5 s); returns the end time
    fill(t, el, value, { d = 0.55, axis = "X" } = {}) {
      gsap.set(el, { [`scale${axis}`]: 0, transformOrigin: axis === "X" ? "0% 50%" : "50% 100%" });
      this.tl.fromTo(el, { [`scale${axis}`]: 0 }, { [`scale${axis}`]: Math.max(0.002, value), duration: d, ease: E.out, immediateRender: false }, t);
      this.beat(t); return t + d;
    }
    // handwritten margin note: {text, at, p:[x%,y%], pp:[portrait], rot}
    note(n) {
      const pos = this.portrait ? (n.pp || n.p || [60, 70]) : (n.p || [70, 18]);
      const y = Math.min(pos[1], this.portrait ? 80 : 77); // never in the caption band
      const el = this.add(`<div class="hnote" style="left:${pos[0]}%;top:${y}%;--rot:${n.rot ?? -4}deg">${esc(n.text)}</div>`, this.el);
      this.pop(this.cue(n.at, 0.5), el, { from: 0.7, zeta: 0.55, d: 0.5, rot: -8 });
    }

    // ---------- the cast (stepped 15 fps timeline) ----------
    // rig: o (position) > c (travel: y, rotation, entrance scale) > s (squash & stretch about the feet) > i (idle) > art
    actor(parent, name, { size = 160, mood = "normal", cls = "", label = null } = {}) {
      const A = window.S1_ART;
      const o = h(`<div class="actor actor-${name} ${cls}"><div class="a-c"><div class="a-s"><div class="a-i">${A.char(name, { size, mood })}</div></div></div>${label ? `<div class="a-tag">${esc(label)}</div>` : ""}</div>`);
      (parent || this.cam).appendChild(o);
      const n = { name, size, o, c: o.querySelector(".a-c"), s: o.querySelector(".a-s"), i: o.querySelector(".a-i"), moods: [[-1e9, mood]], phase: (this.i * 0.37 + (name.length * 0.61)) % 3 };
      // idle: breath (±1.2% over 1.6 s) and a blink every ~3 s, as functions of stepped t
      this.amb((t) => {
        const ts = step(t), b = 1 + 0.012 * Math.sin((2 * Math.PI * (ts + n.phase)) / 1.6);
        n.i.style.transform = `scale(${(2 - b).toFixed(4)}, ${b.toFixed(4)})`;
        let m = n.moods[0][1]; for (const [tm, mm] of n.moods) if (ts >= tm) m = mm;
        if (m !== n.curMood) { n.curMood = m; n.i.innerHTML = A.char(name, { size, mood: m }); n.svg = n.i.firstElementChild; }
        const per = 2.4 + ((n.phase * 7) % 1.2), k = (ts + n.phase) % per, shut = k < 1 / 15 + 1e-3;
        if (n.svg) { const e = n.svg.querySelector(".eyes"), eb = n.svg.querySelector(".eyes-blink"); if (e && eb) { e.style.display = shut ? "none" : ""; eb.style.display = shut ? "" : "none"; } }
      });
      return n;
    }
    mood(n, t, m) { n.moods.push([step(t), m]); n.moods.sort((a, b) => a[0] - b[0]); }
    // entrance hop: crouch 9 f, stretch 4 f, a parabola up and down (quad out / quad in), squash 3 f on contact, toon settle
    hopIn(t, n, { h = 120, from = 160, air = 0.42 } = {}) {
      const c = this.cast;
      gsap.set(n.o, { autoAlpha: 0 }); c.set(n.o, { autoAlpha: 1 }, t);
      c.fromTo(n.c, { y: from }, { y: -h, duration: air * 0.55, ease: "quad.out", immediateRender: false }, t);
      c.to(n.c, { y: 0, duration: air * 0.45, ease: "quad.in" }, t + air * 0.55);
      c.fromTo(n.s, { scaleX: 0.84, scaleY: 1.22 }, { scaleX: 1, scaleY: 1, duration: air * 0.8, ease: "sine.inOut", immediateRender: false }, t);
      const tc = t + air;
      c.to(n.s, { scaleX: 1.22, scaleY: 0.78, duration: 3 * F, ease: "none" }, tc);
      c.to(n.s, { scaleX: 1, scaleY: 1, duration: 0.5, ease: springEase(0.38) }, tc + 3 * F);
      this.beat(t); this.sfx("pop", tc + F, 0.5); return tc;
    }
    // pose to pose: snap in 0.1 s, really hold; a 7% squash on the change settles on a spring (~0.35 s)
    react(t, n, mood, { squash = 0.07 } = {}) {
      if (mood) this.mood(n, t, mood);
      const c = this.cast;
      c.to(n.s, { scaleX: 1 + squash, scaleY: 1 - squash, duration: 0.1, ease: "expo.out" }, t);
      c.to(n.s, { scaleX: 1, scaleY: 1, duration: 0.38, ease: springEase(0.35) }, t + 0.1);
      this.beat(t); return t + 0.48;
    }
    // a small committed hop in place (anticipation crouch first)
    bounce(t, n, { h = 36 } = {}) {
      const c = this.cast;
      c.to(n.s, { scaleX: 1.14, scaleY: 0.86, duration: 6 * F, ease: "sine.out" }, t);
      c.to(n.s, { scaleX: 0.9, scaleY: 1.12, duration: 4 * F, ease: "sine.out" }, t + 6 * F);
      c.to(n.c, { y: -h, duration: 0.16, ease: "quad.out" }, t + 6 * F).to(n.c, { y: 0, duration: 0.14, ease: "quad.in" }, t + 6 * F + 0.16);
      const tc = t + 6 * F + 0.3;
      c.to(n.s, { scaleX: 1.16, scaleY: 0.84, duration: 3 * F, ease: "none" }, tc).to(n.s, { scaleX: 1, scaleY: 1, duration: 0.42, ease: springEase(0.38) }, tc + 3 * F);
      this.beat(t); return tc;
    }
    // slow-thinking sway (Mull): a bounded sine of whole cycles, enveloped to rest
    ponder(t, n, { d = 2, deg = 4 } = {}) {
      const c = this.cast, k = Math.max(1, Math.round(d / 1.0));
      for (let j = 0; j < k; j++) c.to(n.i.parentElement, { rotation: j % 2 ? -deg : deg, duration: 0.5, ease: "sine.inOut" }, t + j * 0.5);
      c.to(n.i.parentElement, { rotation: 0, duration: 0.5, ease: "sine.inOut" }, t + k * 0.5);
      this.beat(t); return t + k * 0.5 + 0.5;
    }
    move(t, n, dx, dy = 0, d = 0.6) { this.cast.to(n.o, { x: `+=${dx}`, y: `+=${dy}`, duration: d, ease: E.move }, t); this.beat(t); return t + d; }
  }

  window.S1 = { Lesson, md, esc, h, NORM };
})();
