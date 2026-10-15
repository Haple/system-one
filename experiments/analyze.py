"""Calibration + selective-automation analysis for E1/E7 result files. usage: python3 analyze.py results/*.json [--subset]"""
import json, sys, statistics as st, csv, random
def subset_texts():
    rows = list(csv.DictReader(open("data/banking77_test.csv")))
    labels = sorted(set(r["category"] for r in rows), key=str.lower)
    rng = random.Random(42); by = {}
    for r in rows: by.setdefault(r["category"], []).append(r)
    return set(x["text"] for l in labels for x in rng.sample(by[l], 8))
def bins(xs, key, nb=10):
    B = [[] for _ in range(nb)]
    for x in xs: B[min(nb - 1, int(x[key] * nb))].append(x)
    out = []
    for i, b in enumerate(B):
        if b: out.append({"lo": i / nb, "hi": (i + 1) / nb, "n": len(b), "conf": st.mean(x[key] for x in b), "acc": st.mean(x["pred"] == x["gold"] for x in b)})
    return out
def ece(xs, key, nb=10):
    return sum(b["n"] * abs(b["conf"] - b["acc"]) for b in bins(xs, key, nb)) / len(xs)
def selective(xs, key, ths=(0, .5, .7, .8, .9, .95, .99, 1.0)):
    out = []
    for t in ths:
        kept = [x for x in xs if x[key] >= t]
        out.append({"t": t, "coverage": len(kept) / len(xs), "acc": (sum(x["pred"] == x["gold"] for x in kept) / len(kept)) if kept else None})
    return out
def coverage_at(xs, key, target):
    s = sorted(xs, key=lambda x: -x[key]); best = 0; right = 0
    for i, x in enumerate(s, 1):
        right += x["pred"] == x["gold"]
        if right / i >= target: best = i
    return best / len(xs)
def report(f, sub=None):
    d = [x for x in json.load(open(f)) if "pred" in x]
    if sub: d = [x for x in d if x["text"] in sub]
    key = "pmax" if "pmax" in d[0] else "conf"
    acc = st.mean(x["pred"] == x["gold"] for x in d)
    r = {"file": f, "n": len(d), "acc": round(acc, 4), "conf_key": key, "mean_conf": round(st.mean(x[key] for x in d), 4), "ece": round(ece(d, key), 4),
         "share_conf_ge_099": round(st.mean(x[key] >= 0.99 for x in d), 3), "acc_when_conf_ge_099": round(st.mean(x["pred"] == x["gold"] for x in d if x[key] >= 0.99) if any(x[key] >= 0.99 for x in d) else 0, 3),
         "coverage_at_95": round(coverage_at(d, key, 0.95), 3), "coverage_at_98": round(coverage_at(d, key, 0.98), 3),
         "selective": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in s.items()} for s in selective(d, key)],
         "bins": [{k: (round(v, 3) if isinstance(v, float) else v) for k, v in b.items()} for b in bins(d, key)]}
    if "lat" in d[0] and d[0]["lat"]: lats = sorted(x["lat"] for x in d if x.get("lat") and not x.get("cached")) or sorted(x["lat"] for x in d if x.get("lat")); r["lat_median"] = round(lats[len(lats) // 2], 3); r["lat_p95"] = round(lats[int(len(lats) * .95)], 3)
    if "p_gold" in d[0]:
        r["brier_top"] = round(st.mean((x["pmax"] - (x["pred"] == x["gold"])) ** 2 for x in d), 4)
    return r
if __name__ == "__main__":
    files = [a for a in sys.argv[1:] if a.endswith(".json")]
    sub = subset_texts() if "--subset" in sys.argv else None
    for f in files:
        r = report(f, sub)
        print(f"\n== {f}  n={r['n']} acc={r['acc']} {r['conf_key']}: mean={r['mean_conf']} ECE={r['ece']} | conf>=.99: {r['share_conf_ge_099']} of items, acc {r['acc_when_conf_ge_099']} | coverage@95%acc={r['coverage_at_95']} @98%={r['coverage_at_98']} | lat med {r.get('lat_median')} p95 {r.get('lat_p95')}")
        print("   selective:", " ".join(f"≥{s['t']}: cov {s['coverage']} acc {s['acc']}" for s in r["selective"]))
        print("   bins:", " ".join(f"[{b['lo']:.1f}) n{b['n']} c{b['conf']:.2f} a{b['acc']:.2f}" for b in r["bins"]))
