// The cast and the icon set. Snap is System One (amber, quick, decisive); Mull is System Two (teal, slow, writes
// essays); Curly is your code (ink, owns the control flow); You are the developer (blue). All share one viewBox
// (0 0 120 132, feet at y=128) so the rig in engine.js can squash them about the feet. Outlines carry class "boil"
// so the line boil (3 displacement takes, 8 per second) gives them a hand-drawn tremor; faces never boil.
(function () {
  "use strict";
  const INK = "var(--ink)";
  const eyesSnap = {
    normal: '<ellipse cx="44" cy="70" rx="11" ry="12.5" fill="#fff"/><ellipse cx="76" cy="70" rx="11" ry="12.5" fill="#fff"/><circle class="pup" cx="46" cy="72" r="6" fill="#1D1C1A"/><circle class="pup" cx="78" cy="72" r="6" fill="#1D1C1A"/><circle cx="48.5" cy="69" r="2" fill="#fff"/><circle cx="80.5" cy="69" r="2" fill="#fff"/>',
    happy: '<path d="M33 73 Q44 59 55 73" fill="none" stroke="#1D1C1A" stroke-width="5" stroke-linecap="round"/><path d="M65 73 Q76 59 87 73" fill="none" stroke="#1D1C1A" stroke-width="5" stroke-linecap="round"/>',
    sure: '<ellipse cx="44" cy="71" rx="11" ry="9" fill="#fff"/><ellipse cx="76" cy="71" rx="11" ry="9" fill="#fff"/><circle cx="46" cy="72" r="5.5" fill="#1D1C1A"/><circle cx="78" cy="72" r="5.5" fill="#1D1C1A"/><path d="M32 60 L56 63 M64 63 L88 60" stroke="#1D1C1A" stroke-width="4.5" stroke-linecap="round"/>',
    unsure: '<ellipse cx="44" cy="71" rx="10" ry="11" fill="#fff"/><ellipse cx="76" cy="70" rx="11.5" ry="13" fill="#fff"/><circle cx="43" cy="73" r="5" fill="#1D1C1A"/><circle cx="75" cy="72" r="5.5" fill="#1D1C1A"/><path d="M34 57 Q44 54 54 58" fill="none" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/><path d="M66 52 Q77 46 88 52" fill="none" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>',
    wow: '<circle cx="44" cy="69" r="13" fill="#fff"/><circle cx="76" cy="69" r="13" fill="#fff"/><circle cx="44" cy="69" r="5" fill="#1D1C1A"/><circle cx="76" cy="69" r="5" fill="#1D1C1A"/>',
    blink: '<path d="M34 72 L55 72 M65 72 L86 72" stroke="#1D1C1A" stroke-width="5" stroke-linecap="round"/>',
  };
  const mouthSnap = { normal: "M50 96 Q60 105 70 96", happy: "M46 93 Q60 110 74 93", sure: "M51 98 L69 97", unsure: "M51 99 Q57 95 63 99 Q66 101 69 98", wow: "M55 98 Q60 108 65 98 Q60 92 55 98", blink: "M50 96 Q60 105 70 96" };
  function snap({ size = 160, mood = "normal" } = {}) {
    const m = eyesSnap[mood] ? mood : "normal";
    return `<svg class="ch snap mood-${m}" viewBox="0 0 120 132" width="${size}" height="${Math.round(size * 1.1)}" aria-hidden="true">
      <g class="boil"><path d="M59 26 L66 9 L61 11 L67 -2" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="45" cy="126" rx="11" ry="5" fill="#1D1C1A"/><ellipse cx="75" cy="126" rx="11" ry="5" fill="#1D1C1A"/>
      <path class="body" d="M60 25 C93 25 111 47 111 77 C111 105 91 125 60 125 C29 125 9 105 9 77 C9 47 27 25 60 25 Z" fill="var(--s1)" stroke="${INK}" stroke-width="4.5"/></g>
      <ellipse cx="29" cy="90" rx="7" ry="4.5" fill="#FF8A3D" opacity=".45"/><ellipse cx="91" cy="90" rx="7" ry="4.5" fill="#FF8A3D" opacity=".45"/>
      <g class="eyes">${eyesSnap[m]}</g><g class="eyes-blink" style="display:none">${eyesSnap.blink}</g>
      <path class="mouth" d="${mouthSnap[m]}" fill="${m === "wow" ? "#1D1C1A" : "none"}" stroke="#1D1C1A" stroke-width="4.5" stroke-linecap="round"/>
    </svg>`;
  }
  const eyesMull = {
    normal: '<circle cx="47" cy="56" r="4.5" fill="#1D1C1A"/><circle cx="75" cy="56" r="4.5" fill="#1D1C1A"/>',
    think: '<circle cx="49" cy="51" r="4.5" fill="#1D1C1A"/><circle cx="77" cy="51" r="4.5" fill="#1D1C1A"/>',
    tired: '<path d="M38 57 L54 57 M66 57 L82 57" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>',
    happy: '<path d="M38 59 Q46 50 54 59 M66 59 Q74 50 82 59" fill="none" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>',
    blink: '<path d="M38 57 L54 57 M66 57 L82 57" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>',
  };
  const mouthMull = { normal: "M52 90 Q60 95 68 90", think: "M53 92 L67 91", tired: "M53 93 Q60 89 67 93", happy: "M49 88 Q60 100 71 88", blink: "M52 90 Q60 95 68 90" };
  function mull({ size = 170, mood = "normal" } = {}) {
    const m = eyesMull[mood] ? mood : "normal";
    return `<svg class="ch mull mood-${m}" viewBox="0 0 120 132" width="${size}" height="${Math.round(size * 1.1)}" aria-hidden="true">
      <g class="boil"><path d="M48 14 Q52 2 60 9 Q66 0 72 12" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
      <rect x="44" y="122" width="12" height="7" rx="3" fill="#1D1C1A"/><rect x="66" y="122" width="12" height="7" rx="3" fill="#1D1C1A"/>
      <rect class="body" x="17" y="13" width="86" height="112" rx="38" fill="var(--s2)" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="47" cy="56" r="13" fill="#F4FBF9" stroke="${INK}" stroke-width="4"/><circle cx="75" cy="56" r="13" fill="#F4FBF9" stroke="${INK}" stroke-width="4"/><path d="M60 55 L62 55" stroke="${INK}" stroke-width="4"/></g>
      <g class="eyes">${eyesMull[m]}</g><g class="eyes-blink" style="display:none">${eyesMull.blink}</g>
      <path class="mouth" d="${mouthMull[m]}" fill="none" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 104 Q60 116 90 104" fill="none" stroke="#1D6F66" stroke-width="5" stroke-linecap="round" opacity=".55"/>
    </svg>`;
  }
  function curly({ size = 150, mood = "normal" } = {}) {
    const eyes = mood === "happy" ? '<path d="M40 76 Q48 66 56 76 M64 76 Q72 66 80 76" fill="none" stroke="#FFC21A" stroke-width="5" stroke-linecap="round"/>'
      : '<text x="40" y="84" font-family="JetBrains Mono, monospace" font-weight="700" font-size="34" fill="#FFC21A">{</text><text x="66" y="84" font-family="JetBrains Mono, monospace" font-weight="700" font-size="34" fill="#FFC21A">}</text>';
    return `<svg class="ch curly mood-${mood}" viewBox="0 0 120 132" width="${size}" height="${Math.round(size * 1.1)}" aria-hidden="true">
      <g class="boil"><line x1="60" y1="30" x2="60" y2="14" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><circle cx="60" cy="12" r="6" fill="var(--good)" stroke="${INK}" stroke-width="3.5"/>
      <rect x="40" y="122" width="14" height="7" rx="3" fill="#1D1C1A"/><rect x="66" y="122" width="14" height="7" rx="3" fill="#1D1C1A"/>
      <rect class="body" x="14" y="30" width="92" height="94" rx="20" fill="#1D1C1A" stroke="${INK}" stroke-width="4.5"/></g>
      <g class="eyes">${eyes}</g>
      <path class="mouth" d="M50 104 Q60 110 70 104" fill="none" stroke="#FFC21A" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
  }
  function you({ size = 150, mood = "normal" } = {}) {
    const face = mood === "happy" ? '<path d="M44 40 Q51 32 58 40 M62 40 Q69 32 76 40" fill="none" stroke="#1D1C1A" stroke-width="4" stroke-linecap="round"/>'
      : mood === "think" ? '<circle cx="53" cy="37" r="3.8" fill="#1D1C1A"/><circle cx="71" cy="37" r="3.8" fill="#1D1C1A"/><path d="M60 22 Q66 18 72 22" fill="none" stroke="#1D1C1A" stroke-width="3" stroke-linecap="round"/>'
      : '<circle cx="51" cy="39" r="3.8" fill="#1D1C1A"/><circle cx="69" cy="39" r="3.8" fill="#1D1C1A"/>';
    return `<svg class="ch you mood-${mood}" viewBox="0 0 120 132" width="${size}" height="${Math.round(size * 1.1)}" aria-hidden="true">
      <g class="boil"><path d="M16 128 C16 94 35 78 60 78 C85 78 104 94 104 128 Z" fill="var(--human)" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <circle class="body" cx="60" cy="42" r="27" fill="var(--human)" stroke="${INK}" stroke-width="4.5"/></g>
      <g class="eyes">${face}</g>
      <path class="mouth" d="${mood === "happy" ? "M48 50 Q60 62 72 50" : "M52 52 Q60 58 68 52"}" fill="none" stroke="#1D1C1A" stroke-width="3.6" stroke-linecap="round"/>
    </svg>`;
  }
  const CHARS = { snap, mull, curly, you };
  function char(name, opts = {}) { return (CHARS[name] || snap)(opts); }

  // 24x24 stroke icons
  const P = {
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>',
    check: '<path d="M4 12.5l5 5L20 6.5"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    branch: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M18 10c0 5-6 4-11 8"/>',
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a3 3 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    loop: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
    plan: '<path d="M9 5h11M9 12h11M9 19h11"/><path d="M4 5h.01M4 12h.01M4 19h.01"/>',
    code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14 4c4-1 6 1 6 1s2 2 1 6l-7 7-7-7z"/><circle cx="15" cy="9" r="1.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16 14.5c3.5 0 6 1.8 6 5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3"/>',
    gauge: '<path d="M4 18a9 9 0 1 1 16 0"/><path d="M12 13l4-5"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M15 9a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2A3.5 3.5 0 0 1 9 15M12 6v2M12 16v2"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    pen: '<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 10 6 10 9s-10 4-10 9M17 3c0 5-10 6-10 9s10 4 10 9"/>',
    scale: '<path d="M12 4v16M6 20h12M4 8h16"/><path d="M4 8l-2 6a3 3 0 0 0 6 0zM20 8l-2 6a3 3 0 0 0 6 0z"/>',
    dice: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.2"/><circle cx="15" cy="15" r="1.2"/><circle cx="15" cy="9" r="1.2"/><circle cx="9" cy="15" r="1.2"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    hash: '<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>',
    gate: '<path d="M4 20V8M20 20V8M4 8l8-4 8 4M8 20v-8h8v8"/>',
    fork: '<path d="M12 21v-7M12 14L5 7M12 14l7-7M5 7V3M19 7V3M5 3l-2 2M5 3l2 2M19 3l-2 2M19 3l2 2"/>',
    chart: '<path d="M4 20V4M4 20h16"/><rect x="7" y="12" width="3" height="6"/><rect x="12" y="8" width="3" height="10"/><rect x="17" y="5" width="3" height="13"/>',
    coin: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17v.5"/>',
    stack: '<rect x="4" y="4" width="16" height="5" rx="1.5"/><rect x="4" y="10" width="16" height="5" rx="1.5"/><rect x="4" y="16" width="16" height="4" rx="1.5"/>',
    puzzle: '<path d="M10 3h4v3a2 2 0 1 0 4 0V3h3v7h-3a2 2 0 1 0 0 4h3v7h-7v-3a2 2 0 1 0-4 0v3H3v-7h3a2 2 0 1 0 0-4H3V3z"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="4"/><path d="M12 8V4M9 13v1M15 13v1"/>',
    merge: '<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v10M6 9c0 6 12 4 12 8"/>',
  };
  function icon(name, size = 32, cls = "") {
    const d = P[name] || P.spark;
    return `<svg class="ico ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  }
  window.S1_ART = { char, icon, ICONS: Object.keys(P), CHARS: Object.keys(CHARS) };
})();
