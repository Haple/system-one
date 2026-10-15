#!/usr/bin/env python3
"""Collect candidate YouTube talks via yt-dlp search (cached per query) -> sources/candidates.json"""
import json, subprocess, sys, os, time, hashlib
ROOT = os.path.expanduser("~/system-one/sources")
CACHE = os.path.join(ROOT, "search-cache"); os.makedirs(CACHE, exist_ok=True)
QUERIES = [
 "TypeSafe Jev", "Jev decision model", "System One model Jev", "Diogo Almeida TypeSafe", "Diogo Almeida Jev talk", "RLCD calibrated decisions",
 "Jev tutorial python", "Jev demo", "Jev doom demo", "Jev wikiracing", "jev typesafe review", "Jev vs LLM", "Jev latent space",
 "OpenAI Decisions API", "gpt-6-luna decisions api", "OpenAI DevDay 2026 decisions", "Cloudflare Clef decision model", "Strands Decider",
 "decision models explained", "decision model vs llm", "JevBench", "open source Jev", "build your own decision model", "Jev agents routing",
 "Kahneman thinking fast and slow artificial intelligence", "Daniel Kahneman Lex Fridman", "Bengio system 2 deep learning", "Karpathy system 1 system 2 LLM",
 "Kahneman noise decision hygiene", "LLM calibration uncertainty talk", "LLM confidence calibration", "conformal prediction tutorial", "selective prediction abstain machine learning",
 "LLM as a judge evaluation Hamel", "structured outputs LLM Jason Liu", "LLM routing cascade cost", "FrugalGPT", "RouteLLM", "LLM guardrails talk",
 "clinical vs statistical prediction Meehl", "superforecasting calibration Tetlock", "classification with LLMs logprobs", "building effective agents workflows anthropic",
]
def search(q, n=15):
    key = hashlib.md5(q.encode()).hexdigest()[:10]; f = os.path.join(CACHE, key + ".json")
    if os.path.exists(f): return json.load(open(f))
    for attempt in range(3):
        try:
            out = subprocess.run(["yt-dlp", "--no-update", "--flat-playlist", "-J", f"ytsearch{n}:{q}"], capture_output=True, text=True, timeout=180)
            data = json.loads(out.stdout)
            ents = [{k: e.get(k) for k in ("id", "title", "channel", "channel_id", "duration", "view_count", "url")} for e in data.get("entries", []) if e]
            json.dump({"q": q, "entries": ents}, open(f, "w")); return {"q": q, "entries": ents}
        except Exception as ex:
            print("retry", q, ex, file=sys.stderr); time.sleep(5)
    return {"q": q, "entries": []}
cands = {}
for i, q in enumerate(QUERIES):
    r = search(q); print(f"[{i+1}/{len(QUERIES)}] {q}: {len(r['entries'])}", flush=True)
    for rank, e in enumerate(r["entries"]):
        c = cands.setdefault(e["id"], {**e, "queries": []}); c["queries"].append([q, rank])
json.dump(list(cands.values()), open(os.path.join(ROOT, "candidates.json"), "w"), indent=1)
print("candidates", len(cands))
