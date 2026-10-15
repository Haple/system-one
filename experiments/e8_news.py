"""E8: fresh data (Guardian stories published days before the run, after every model's release) - 8-way section Choice.
Truth = the section feed(s) the publisher put the story in (any of them counts). usage: python3 e8_news.py <provider> [model] [--jobs J]"""
import json, sys, time
from concurrent.futures import ThreadPoolExecutor
import s1client as s1
args = sys.argv[1:]; JOBS = 8
if "--jobs" in args: i = args.index("--jobs"); JOBS = int(args[i + 1]); del args[i:i + 2]
provider = args[0]; model = args[1] if len(args) > 1 else None
D = json.load(open("data/news_2026-10-15.json"))
DESC = {"technology": "Technology", "business": "Business and the economy", "politics": "UK politics", "world": "World news", "science": "Science", "sport": "Sport", "culture": "Culture and the arts", "environment": "Environment and climate"}
criteria = {s: DESC[s] for s in D["sections"]}
def one(r):
    q = {"section": {"type": "choice", "instructions": "Which section of a newspaper does this story belong in?", "criteria": criteria}}
    try: res = s1.ask({"headline": r["title"], "standfirst": r["text"]}, q, provider=provider, model=model, tag="news")
    except Exception as e: return {"title": r["title"], "gold": r["sections"], "error": str(e)[:200]}
    try: a = res["answers"]["section"]; P = a["probabilities"]
    except Exception: return {"title": r["title"], "gold": r["sections"], "error": "bad answer"}
    return {"text": r["title"], "gold": r["sections"][0] if a["choice"] not in r["sections"] else a["choice"], "golds": r["sections"], "pred": a["choice"], "conf": a.get("confidence"), "pmax": max(P.values()), "lat": res["latency_s"], "cached": res.get("cached"), "tok": (res.get("usage") or {}).get("input_tokens"), "model": res.get("model")}
t0 = time.time()
with ThreadPoolExecutor(JOBS) as ex: out = list(ex.map(one, D["items"]))
name = f"results/e8_{provider}{'_' + model if model else ''}.json"; json.dump(out, open(name, "w"))
ok = [o for o in out if "pred" in o]
print(f"{name}: {len(ok)}/{len(out)} ok, acc {sum(o['pred'] in o['golds'] for o in ok)/max(1,len(ok)):.3f}, wall {time.time()-t0:.0f}s")
