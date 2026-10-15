"""E1: calibration + selective automation on BANKING77 (3,080 test messages, 77 intents) with one Choice each.
usage: python3 e1_banking77.py <provider> [model] [--n N] [--jobs J] [--order orig|rev|shuf]"""
import csv, json, sys, os, random, time
from concurrent.futures import ThreadPoolExecutor
import s1client as s1
args = sys.argv[1:]
def opt(k, d):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return d
N = int(opt("--n", 0)); JOBS = int(opt("--jobs", 8)); ORDER = opt("--order", "orig")
provider = args[0]; model = args[1] if len(args) > 1 else None
rows = list(csv.DictReader(open("data/banking77_test.csv")))
labels = sorted(set(r["category"] for r in rows), key=str.lower)
if ORDER == "rev": labels = labels[::-1]
if ORDER == "shuf": random.Random(7).shuffle(labels)
criteria = {l: l.replace("_", " ").lower() for l in labels}
if N: random.Random(42).shuffle(rows); rows = rows[:N]
def one(r):
    q = {"intent": {"type": "choice", "instructions": "Which banking support topic is the customer's message about?", "criteria": criteria}}
    try:
        res = s1.ask(r["text"], q, provider=provider, model=model, tag=ORDER)
    except Exception as e:
        return {"text": r["text"], "gold": r["category"], "error": str(e)[:200]}
    try: a = res["answers"]["intent"]; P = a["probabilities"]
    except Exception as e: return {"text": r["text"], "gold": r["category"], "error": "bad answer " + str(res)[:200]}
    return {"text": r["text"], "gold": r["category"], "pred": a["choice"], "conf": a.get("confidence"), "pmax": max(P.values()), "p_gold": P.get(r["category"], 0.0),
            "p2": sorted(P.values())[-2], "lat": res["latency_s"], "cached": res.get("cached"), "tok": (res.get("usage") or {}).get("input_tokens"), "model": res.get("model")}
t0 = time.time()
with ThreadPoolExecutor(JOBS) as ex: out = list(ex.map(one, rows))
name = f"results/e1_{provider}{'_' + model if model else ''}_{ORDER}{'_n' + str(N) if N else ''}.json"
os.makedirs("results", exist_ok=True); json.dump(out, open(name, "w"))
ok = [o for o in out if "pred" in o]
acc = sum(o["pred"] == o["gold"] for o in ok) / max(1, len(ok))
print(f"{name}: {len(ok)}/{len(out)} ok, acc {acc:.3f}, errors {len(out)-len(ok)}, wall {time.time()-t0:.0f}s")
