// Motion tokens for the System One course (Motion Lab numbers, as applied in Lantern v2.2).
// Adjectives are where the default look lives: every curve here is a number, and templates use only these.
// Laws: entrances decay (E.out), exits accelerate and take half the time (E.exit), moves ease both ends (E.move),
// springs are named by damping ratio, position and size may bounce, opacity and colour never do.
(function () {
  "use strict";
  const CE = window.CustomEase;
  if (CE && window.gsap) gsap.registerPlugin(CE);
  const mk = (name, bez, fallback) => { if (!CE) return fallback; CE.create("s1-" + name, bez); return "s1-" + name; };
  const E = {
    out: mk("out", ".16,1,.3,1", "expo.out"),          // arrivals, reveals (ease-out-expo)
    soft: mk("soft", ".22,1,.36,1", "power3.out"),     // premium entrances (ease-out-quint)
    move: mk("move", ".76,0,.24,1", "power3.inOut"),   // across the screen (ease-in-out-quart)
    exit: mk("exit", ".7,0,.84,0", "power3.in"),       // leaving: fastest on the last frame (ease-in-expo)
    contact: mk("contact", ".55,0,.9,.55", "power2.in"),// accelerating into an impact
    long: mk("long", ".33,0,.2,1", "power2.out"),      // camera pull-backs land softly
    ui: mk("ui", ".4,0,.2,1", "power2.out"),           // small state changes
    sine: "sine.inOut",                                // camera pushes, breath
  };
  const F = 1 / 60; // timings are written in frames at 60 fps
  // analytic spring: progress at time t (no simulation, so any frame renders on its own)
  function spring(t, zeta = 0.7, f = 2) {
    if (t <= 0) return 0;
    const w = 2 * Math.PI * f;
    if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const wd = w * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
  }
  const cache = {};
  // a GSAP ease that is that spring, settled (envelope < 0.3%) by the end of the tween
  function springEase(zeta = 0.55) {
    const k = zeta.toFixed(2);
    if (cache[k]) return cache[k];
    const wT = Math.log(400) / zeta, f = wT / (2 * Math.PI);
    return (cache[k] = (p) => (p >= 1 ? 1 : spring(p, zeta, f)));
  }
  // calm 0.8 (~1.5% overshoot, props), play 0.55 (~12%, cards and stickers), toon 0.32 (~30%, the cast's comedy beats)
  const SPRING = { calm: springEase(0.8), play: springEase(0.55), toon: springEase(0.32), wobble: springEase(0.22) };
  // the fraction of a spring tween at which it first reaches its target: the contact frame (sound goes 1 frame later)
  function landAt(zeta = 0.55) { const e = springEase(zeta); for (let p = 0; p <= 1; p += 0.0025) if (e(p) >= 1) return p; return 1; }
  // two frame rates: the cast is drawn on 4s (15 fps, an even 4/8 refreshes at 60/120 Hz); camera and UI stay smooth
  const CAST_FPS = 15;
  const step = (t, fps = CAST_FPS) => Math.floor(t * fps + 1e-3) / fps; // GSAP times land a hair under the boundary
  const zlerp = (a, b, e) => a * Math.pow(b / a, e); // zoom by ratio, never linearly
  const springHz = (t, f = 2.5, decay = 9) => (t <= 0 ? 0 : 1 - Math.exp(-decay * t) * Math.cos(2 * Math.PI * f * t));
  const readFor = (text) => 0.5 + 0.3 * String(text || "").split(/\s+/).filter(Boolean).length; // text holds
  const exitDur = (enter) => +(enter * 0.5).toFixed(3);
  const CAMD = { push: 0.9, pull: 1.1, punch: 0.28 };
  const PAYOFF_HOLD = 0.9; // a payoff (a number, a verdict) gets this much air before the next move
  window.S1M = { E, F, spring, springEase, SPRING, landAt, CAST_FPS, step, zlerp, springHz, readFor, exitDur, CAMD, PAYOFF_HOLD };
})();
