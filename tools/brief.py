#!/usr/bin/env python3
"""Compact research brief for writing a lesson. usage: brief.py topic[,topic2|all] [--min 2] [--grep REGEX] [--limit N] [--sid ID] [--kind talk,doc]"""
import json, glob, os, re, argparse
R = os.path.expanduser("~/system-one")
ap = argparse.ArgumentParser(); ap.add_argument("topics"); ap.add_argument("--min", type=int, default=2); ap.add_argument("--grep"); ap.add_argument("--limit", type=int, default=80); ap.add_argument("--sid"); ap.add_argument("--kind")
a = ap.parse_args()
cat = json.load(open(f"{R}/research/sources.json"))
topics = set(a.topics.split(",")) if a.topics != "all" else None
kinds = set(a.kind.split(",")) if a.kind else None
rows = []
for f in glob.glob(f"{R}/research/insights/*.json"):
    sid = os.path.basename(f)[:-5]
    if a.sid and a.sid not in sid: continue
    s = cat.get(sid, {})
    if kinds and s.get("kind") not in kinds: continue
    d = json.load(open(f))
    for i, ins in enumerate(d.get("insights", [])):
        if topics and ins.get("topic") not in topics: continue
        if (ins.get("strength") or 1) < a.min: continue
        txt = ins.get("claim", "") + " " + ins.get("quote", "")
        if a.grep and not re.search(a.grep, txt, re.I): continue
        rows.append((ins, sid))
rows.sort(key=lambda r: (-(r[0].get("strength") or 1), r[1]))
def tsec(v):
    if isinstance(v, (int, float)): return int(v)
    m = re.match(r"^\s*(\d+)", str(v or "")); return int(m.group(1)) if m else None
for ins, sid in rows[: a.limit]:
    s = cat.get(sid, {}); t = tsec(ins.get("t")); ok = (ins.get("qscore") or 0) >= 0.9
    print(f"* {ins.get('claim')}\n  Q{'' if ok else '?'}: {ins.get('quote') or ''}\n  - {ins.get('speaker')} | {s.get('kind')} | {str(s.get('title',''))[:60]} | {sid}{('@'+str(t)) if t else ''}")
print(f"\n[{len(rows)} rows, showing {min(len(rows), a.limit)}]")
