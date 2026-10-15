#!/usr/bin/env python3
"""Supadata transcript JSON -> timestamped paragraph text + catalog entries (kind=talk)."""
import json, os, glob
R = os.path.expanduser("~/system-one")
cands = {c["id"]: c for c in json.load(open(f"{R}/sources/candidates.json"))}
cat = json.load(open(f"{R}/research/sources.json"))
def fmt(s):
    s = int(s); h, m, x = s // 3600, (s % 3600) // 60, s % 60
    return f"{h}:{m:02d}:{x:02d}" if h else f"{m:02d}:{x:02d}"
n = 0
for f in sorted(glob.glob(f"{R}/sources/transcripts/*.json")):
    vid = os.path.basename(f)[:-5]
    if vid == "cFx9Z3ZXca0": continue  # Latent Space: the edited transcript (latent-space-jev) is used instead
    d = json.load(open(f))
    paras, cur, t0 = [], [], None
    for c in d.get("chunks") or []:
        off = (c.get("offset") or 0) / 1000
        if t0 is None: t0 = off
        cur.append(c["text"].strip())
        if off - t0 >= 25: paras.append((t0, " ".join(cur))); cur, t0 = [], None
    if cur: paras.append((t0 or 0, " ".join(cur)))
    out = f"{R}/sources/transcripts/{vid}.txt"
    open(out, "w").write("\n\n".join(f"[{fmt(t)}] {p}" for t, p in paras))
    c = cands.get(vid, {})
    cat[vid] = {"id": vid, "kind": "talk", "title": c.get("title", vid), "url": f"https://www.youtube.com/watch?v={vid}", "who": c.get("channel", ""), "channel": c.get("channel", ""), "duration": c.get("duration"), "views": c.get("view_count"), "date": "", "path": out, "chars": os.path.getsize(out)}
    n += 1
# the Latent Space transcript links to its YouTube upload (timestamps match the episode)
if "latent-space-jev" in cat: cat["latent-space-jev"]["youtube"] = "https://www.youtube.com/watch?v=cFx9Z3ZXca0"
json.dump(cat, open(f"{R}/research/sources.json", "w"), indent=1)
print("talks added", n, "catalog", len(cat))
