#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["json-repair"]
# ///
"""Per-source insight extraction (Sonnet 5.5 via fal's OpenRouter router), quotes verified against the source text.
research/sources.json -> research/insights/<id>.json.  usage: FAL_KEY=... uv run tools/extract_insights.py [ids...] [--jobs 6]"""
import json, os, re, sys, time, difflib, urllib.request
from concurrent.futures import ThreadPoolExecutor
R = os.path.expanduser("~/system-one")
CAT = json.load(open(f"{R}/research/sources.json"))
OUT = f"{R}/research/insights"; os.makedirs(OUT, exist_ok=True)
SKIP = re.compile(r"ts-docs-(legal|sdk-javascript-api|sdk-python-api|sdk-javascript-changelog|sdk-python-changelog|sdk|demos)$")
TOPICS = """why-decision-models: LLMs generate text for humans; software needs decisions; prompt-and-parse fragility; machine-native intelligence; automation gap; "prod not god"
system1-system2: Kahneman's fast vs slow thinking; where a fast judgment fits vs reasoning models vs plain code; hybrid systems
how-it-works: architecture of decision models (one forward pass, prefill + scoring options, pointer heads, logprobs over options, no generation), training (RLCD, Brier loss, distillation), why fast/cheap
landscape: the models and vendors (Jev, OpenAI Decisions/gpt-6-luna, Cloudflare Clef, Strands Decider, open rebuilds), API compatibility, prices, latency, choosing one
noul: yes/no probability questions; thresholds; phrasing; criteria
choice: one-of-N questions; option descriptions; other/none options; many options; contrastive criteria
score: ordered levels; describing levels; expected value; normalization; one dimension per score
state: what to put in the state; structure; JSON paths; only relevant context; context rot; long context
question-design: writing instructions and criteria; atomic questions; literal reading; structured criteria; examples; phrasing so high means yes
calibration: what calibrated probability means; reliability diagrams, Brier, ECE; RLHF and overconfidence; verbalized vs native probabilities
confidence-thresholds: confidence formulas; choosing thresholds by risk and cost; act/confirm/escalate; human review; abstaining; coverage vs accuracy
composition: ask many questions in one request (fan-out); independence; composite scoring with weights in code; judgments as features for classical ML
routing-cascades: intent routing to code/LLM/human; model routing; cascades (cheap first, escalate uncertain); cost savings
extraction-selection: select instead of generate; regex/parsers produce candidates and the model picks; dates; hierarchical classification; reranking; search
verification-guardrails: checking citations/claims; guardrails on LLM inputs/outputs; tool-call argument checks; agent gates; prompt injection; adversarial content
agents: decision models inside agents; skill/tool selection; hybrid agents; workflows vs agents; coding agents
evaluation: evals on your own data; labeled sets; error analysis; self-consistency; option order tests; benchmark critique; JevBench; version pinning
limits: known failure modes (math, counting, dates, indirection, large state, adversarial, generation); what not to use decision models for
cost-latency-scale: pricing models; batching; tokens; latency; concurrency; real-time uses; map-reduce over data; Jevons paradox
ethics-risk: bias, black boxes, explainability, decisions about people, accountability, refusals
use-cases: concrete applications, demos and results (support, moderation, games, document review, research datasets)
decision-science: human judgment research: Meehl/Dawes mechanical prediction, noise, decision hygiene, checklists/Apgar, forecasting and Brier scores, cost-sensitive thresholds
future: predictions, fine-tuning, open models, multimodal, where the category goes
other: anything important that fits nowhere else"""
SYSTEM = f"""You are a meticulous research assistant building a free course on SYSTEM ONE DECISION MODELS: models such as TypeSafe's Jev, OpenAI's Decisions API, Cloudflare's Clef and AWS's Strands Decider, which take a state plus typed questions and return typed answers with probabilities instead of generated text, and on how to build reliable software with them (plus the decision-science and ML-calibration background behind them). You extract the most useful, specific, citable insights from ONE source.

TOPIC KEYS (use exactly these):
{TOPICS}

Rules:
- Prefer concrete practices, specific numbers and measured results (with their conditions), memorable framings, surprising claims, failure stories, clear definitions, and caveats/counterpoints over generic statements. Skip marketing fluff, navigation text, ads.
- "quote" MUST be copied VERBATIM from the source text (same words, same order; you may trim the start/end, max 45 words). Never paraphrase inside "quote". If no clean quotable sentence exists, use "".
- "t": for podcast transcripts with [hh:mm:ss] markers, the timestamp of the paragraph containing the quote in seconds (integer); otherwise null.
- "speaker": who says/writes it (e.g. "Diogo Almeida (TypeSafe AI CEO)", "Simon Willison", "Cloudflare", "TypeSafe docs").
- "strength": 3 = essential / course-defining, 2 = solid supporting point, 1 = minor.
- Capture disagreements, limitations and caveats too (type "warning" or "counterpoint"). Vendor claims are claims: say who claims them.
- 8-40 insights depending on length/density.

Return ONLY JSON (no markdown fence):
{{"source":{{"speakers":[{{"name":"","role":""}}],"summary":"2-4 sentences: what this source is and its main argument or content","perspective":"e.g. vendor docs / independent benchmark / skeptic blogger / academic paper"}},
 "insights":[{{"topic":"<key>","type":"practice|principle|definition|stat|result|anecdote|warning|counterpoint|prediction|tool|example","claim":"1-2 sentence paraphrase, specific","quote":"verbatim","t":null,"speaker":"","strength":2}}]}}"""

def norm(s): return re.sub(r"[^a-z0-9 ]+", "", re.sub(r"\s+", " ", s.lower().replace("’", "'"))).strip()
def verify(quote, full):
    if not quote: return 0.0
    q = norm(quote)
    if q and q in full: return 1.0
    words = full.split(" "); n = max(1, len(q.split(" ")))
    best = 0.0
    for i in range(0, max(1, len(words) - n), max(1, n // 3)):
        r = difflib.SequenceMatcher(None, q, " ".join(words[i:i + n + 3])).ratio()
        if r > best: best = r
    return round(best, 3)
def call(system, prompt, max_tokens=16000):
    body = json.dumps({"model": "anthropic/claude-sonnet-5.5", "system_prompt": system, "prompt": prompt, "max_tokens": max_tokens, "temperature": 0.2, "reasoning": True}).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request("https://fal.run/openrouter/router", data=body, headers={"Authorization": f"Key {os.environ['FAL_KEY']}", "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) system-one-course/1.0"})
            with urllib.request.urlopen(req, timeout=900) as r: j = json.loads(r.read())
            if j.get("error"): raise RuntimeError(j["error"])
            return j
        except Exception as e:
            print("  retry", attempt, str(e)[:200], file=sys.stderr, flush=True); time.sleep(10 * (attempt + 1))
    raise RuntimeError("llm failed")
def run(sid):
    out = f"{OUT}/{sid}.json"
    if os.path.exists(out): return f"skip {sid}"
    s = CAT[sid]; text = open(s["path"], errors="ignore").read()
    if len(text) < 800: return f"tiny {sid}"
    body = text[:190000]
    prompt = f"SOURCE ({s['kind']}): \"{s['title']}\" — {s.get('who','')} — {s['url']} — {s.get('date','')}\n\nTEXT:\n{body}\n\nExtract the insights now. JSON only."
    j = call(SYSTEM, prompt)
    raw = j["output"].strip(); raw = re.sub(r"^```(json)?|```$", "", raw).strip(); raw = raw[raw.find("{"): raw.rfind("}") + 1]
    try: data = json.loads(raw)
    except Exception:
        from json_repair import repair_json
        data = json.loads(repair_json(raw))
    full = norm(text)
    for ins in data.get("insights", []): ins["qscore"] = verify(ins.get("quote", ""), full)
    data["meta"] = {k: s.get(k) for k in ("id", "kind", "title", "url", "who", "date")}
    data["usage"] = j.get("usage")
    json.dump(data, open(out, "w"), indent=1)
    ins = data.get("insights", []); bad = sum(1 for i in ins if i.get("quote") and i["qscore"] < 0.85)
    return f"ok {sid}: {len(ins)} insights, {bad} weak quotes, cost {(j.get('usage') or {}).get('cost')}"
def safe(i):
    try: return run(i)
    except Exception as e: return f"FAIL {i}: {e}"
if __name__ == "__main__":
    argv = sys.argv[1:]
    jobs = 6
    if "--jobs" in argv: k = argv.index("--jobs"); jobs = int(argv[k + 1]); del argv[k:k + 2]
    args = [a for a in argv if not a.startswith("--")]
    ids = args or [k for k in CAT if not SKIP.match(k)]
    print(len(ids), "sources", flush=True)
    with ThreadPoolExecutor(jobs) as ex:
        for r in ex.map(lambda i: safe(i), ids):
            print(r, flush=True)
    print("DONE_EXIT_0")
