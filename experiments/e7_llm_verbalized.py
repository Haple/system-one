"""E7: an LLM asked to pick the BANKING77 intent AND state its confidence (verbalized), same subset as a baseline
for calibration. usage: python3 e7_llm_verbalized.py <openrouter-model> [--n 616] [--jobs 8]"""
import csv, json, sys, os, random, re, time, hashlib, urllib.request, subprocess
from concurrent.futures import ThreadPoolExecutor
args = sys.argv[1:]
def opt(k, d):
    if k in args: i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
    return d
N = int(opt("--n", 616)); JOBS = int(opt("--jobs", 8)); MODEL = args[0]
KEY = os.environ["FAL_KEY"]
rows = list(csv.DictReader(open("data/banking77_test.csv")))
labels = sorted(set(r["category"] for r in rows), key=str.lower)
# stratified subset: 8 per class, fixed seed
rng = random.Random(42); by = {}
for r in rows: by.setdefault(r["category"], []).append(r)
sub = [x for l in labels for x in rng.sample(by[l], N // len(labels))]
SYS = "You are a banking support intent classifier. Choose exactly one intent label from the list for the customer's message, and say how confident you are that your label is correct, as a number from 0 to 100."
LIST = "\n".join(f"- {l}" for l in labels)
def call(text):
    prompt = f"Intent labels:\n{LIST}\n\nCustomer message: {text}\n\nReply with JSON only: {{\"intent\": \"<one label from the list>\", \"confidence\": <0-100>}}"
    key = hashlib.sha1((MODEL + prompt).encode()).hexdigest(); f = f"cache/llm_{key}.json"
    if os.path.exists(f): return json.load(open(f))
    body = json.dumps({"model": MODEL, "system_prompt": SYS, "prompt": prompt, "max_tokens": 60, "temperature": 0}).encode()
    for attempt in range(5):
        try:
            req = urllib.request.Request("https://fal.run/openrouter/router", data=body, headers={"Authorization": f"Key {KEY}", "Content-Type": "application/json", "User-Agent": "system-one-course/1.0"})
            t0 = time.perf_counter()
            with urllib.request.urlopen(req, timeout=120) as r: j = json.loads(r.read())
            j["latency_s"] = time.perf_counter() - t0
            json.dump(j, open(f, "w")); return j
        except Exception as e:
            time.sleep(3 * (attempt + 1)); last = e
    return {"error": str(last)}
def one(r):
    j = call(r["text"]); out = (j.get("output") or "")
    m = re.search(r"\{.*\}", out, re.S)
    try: d = json.loads(m.group(0)); pred = str(d.get("intent", "")).strip(); conf = float(d.get("confidence")) / 100
    except Exception: return {"text": r["text"], "gold": r["category"], "parse_error": out[:200], "lat": j.get("latency_s")}
    return {"text": r["text"], "gold": r["category"], "pred": pred, "valid": pred in labels, "conf": conf, "lat": j.get("latency_s"), "cost": (j.get("usage") or {}).get("cost")}
with ThreadPoolExecutor(JOBS) as ex: res = list(ex.map(one, sub))
os.makedirs("results", exist_ok=True)
name = f"results/e7_{MODEL.replace('/', '_')}_n{len(sub)}.json"; json.dump(res, open(name, "w"))
ok = [x for x in res if "pred" in x]
print(name, "parsed", len(ok), "/", len(res), "valid labels", sum(x["valid"] for x in ok), "acc", round(sum(x["pred"] == x["gold"] for x in ok) / len(res), 3), "cost", round(sum(x.get("cost") or 0 for x in ok), 4))
