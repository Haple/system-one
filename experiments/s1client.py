"""Tiny System One API client for the course experiments: Jev (TypeSafe), Clef / Clef-flash (Workers AI).
Disk cache keyed by (provider, model, request) so re-runs are free. Records latency per call."""
import json, os, time, hashlib, urllib.request, subprocess, threading
R = os.path.dirname(os.path.abspath(__file__))
CACHE = f"{R}/cache"; os.makedirs(CACHE, exist_ok=True)
_keys = {}
_lock = threading.Lock()
def _secret(name):
    if os.environ.get(name): return os.environ[name]   # your own keys; Doppler is only the course's setup
    with _lock:
        for attempt in range(5):
            if _keys.get(name): break
            _keys[name] = ""  # set the key as an environment variable
            if not _keys[name]: time.sleep(1 + attempt)
        return _keys[name]
def _post(url, headers, body, timeout=120):
    req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "User-Agent": "system-one-course/1.0", **headers})
    t0 = time.perf_counter()
    with urllib.request.urlopen(req, timeout=timeout) as r: j = json.loads(r.read())
    return j, time.perf_counter() - t0
def ask(state, questions, provider="jev", model=None, cache=True, tag=""):
    """Returns {'answers':..., 'usage':..., 'model':..., 'latency_s':..., 'cached':bool}"""
    model = model or {"jev": "jev-1.13.0", "clef": "clef", "clef-flash": "clef-flash", "strands": "strands-decider-2B-qwen3.5-v1-2610"}[provider]
    body = {"model": model, "state": state, "questions": questions}
    key = hashlib.sha1((provider + "|" + tag + "|" + json.dumps(body, sort_keys=True)).encode()).hexdigest()
    f = f"{CACHE}/{key}.json"
    if cache and os.path.exists(f):
        d = json.load(open(f))
        if d.get("answers"): d["cached"] = True; return d
    for attempt in range(6):
        try:
            if provider == "strands":
                j, dt = _post("http://127.0.0.1:4750/v1/systemone", {}, {k: v for k, v in body.items() if k != "model"}, timeout=600)
                out = {"answers": j["answers"], "usage": j.get("usage"), "model": j.get("model"), "latency_s": round(dt, 4)}
            elif provider == "jev":
                j, dt = _post("https://api.typesafe.ai/v1/systemone", {"Authorization": "Bearer " + _secret("JEV_API_KEY")}, body)
                out = {"answers": j["answers"], "usage": j.get("usage"), "model": j.get("model"), "latency_s": round(dt, 4)}
            else:
                acc = _secret("CLOUDFLARE_ACCOUNT_ID")
                j, dt = _post(f"https://api.cloudflare.com/client/v4/accounts/{acc}/ai/run/@cf/cloudflare/{model}", {"Authorization": "Bearer " + _secret("CLOUDFLARE_API_TOKEN")}, body)
                if not j.get("success"): raise RuntimeError(str(j.get("errors"))[:300])
                res = j["result"] or {}
                if not res.get("answers"): raise RuntimeError("empty answers: " + json.dumps(j)[:200])
                out = {"answers": res["answers"], "usage": res.get("usage"), "model": res.get("model"), "latency_s": round(dt, 4)}
            json.dump(out, open(f, "w"))
            out["cached"] = False
            return out
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:300]
            if e.code in (429, 500, 502, 503, 504): time.sleep(2 * (attempt + 1)); continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except Exception as e:
            if attempt == 5: raise
            time.sleep(2 * (attempt + 1))
