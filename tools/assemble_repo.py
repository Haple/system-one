#!/usr/bin/env python3
"""Assemble the public GitHub repo at ~/system-one-public from the working project.
Raw source texts, API caches and third-party article text are left out; everything else needed to
rebuild the course, rerun the experiments and install the skills goes in."""
import json, os, re, shutil, glob
W = os.path.expanduser("~/system-one"); P = os.path.expanduser("~/system-one-public")
course = json.load(open(f"{W}/course/course.json"))
SITE = course["site"]; REPO = course["repo"]; SLUG = REPO.replace("https://github.com/", "")
cat = json.load(open(f"{W}/research/sources.json"))
facts = json.load(open(f"{W}/experiments/results/facts.json"))
os.makedirs(P, exist_ok=True)

def copytree(src, dst, ignore=None):
    if os.path.exists(dst): shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=ignore)

# --- site source (no build output, no narration audio) ---
copytree(f"{W}/site/static", f"{P}/site/static", ignore=shutil.ignore_patterns("audio", "media"))
shutil.copy(f"{W}/site/build.mjs", f"{P}/site/build.mjs")
copytree(f"{W}/site/dev", f"{P}/site/dev")
if os.path.isdir(f"{W}/docs"): copytree(f"{W}/docs", f"{P}/docs")
# --- course sources ---
copytree(f"{W}/course", f"{P}/course", ignore=shutil.ignore_patterns("test"))
os.makedirs(f"{P}/research", exist_ok=True)
shutil.copy(f"{W}/research/sources.json", f"{P}/research/sources.json")
# public catalog: drop local paths
pub = {k: {kk: vv for kk, vv in v.items() if kk not in ("path", "chars")} for k, v in cat.items()}
json.dump(pub, open(f"{P}/research/sources.json", "w"), indent=1, ensure_ascii=False)
# --- tools ---
os.makedirs(f"{P}/tools", exist_ok=True)
for f in ["voice.mjs", "voice_batch.sh", "stills.mjs", "motion_qa.mjs", "qa_batch.sh", "qa_portrait.sh", "og.mjs", "capture.mjs", "clip.mjs", "fake_timing.mjs",
          "brief.py", "extract_insights.py", "build_catalog.py", "fetch_sources.py", "clean_docs.py", "extract_html.py", "search_videos.py",
          "fetch_transcripts.sh", "transcripts_to_text.py", "assemble_repo.py"]:
    if os.path.exists(f"{W}/tools/{f}"): shutil.copy(f"{W}/tools/{f}", f"{P}/tools/{f}")
# --- experiments: code + results; no API cache; news reduced to links + labels ---
E = f"{P}/experiments"; copytree(f"{W}/experiments", E, ignore=shutil.ignore_patterns("cache", "__pycache__", "news", "news_*.json"))
news = json.load(open(f"{W}/experiments/data/news_2026-10-15.json"))
json.dump({"fetched": news["fetched"], "sections": news["sections"], "note": "Guardian stories from the public section RSS feeds; titles and standfirsts are not redistributed, follow the links.",
           "items": [{"link": it["link"], "sections": it["sections"]} for it in news["items"]]}, open(f"{E}/data/news_2026-10-15.links.json", "w"), indent=1)
title2link = {it["title"]: it["link"] for it in news["items"]}
for f in glob.glob(f"{E}/results/e8_*.json"):
    rows = json.load(open(f))
    for r in rows:
        t = r.pop("text", None) or r.pop("title", None)
        r["link"] = title2link.get(t, "")
    json.dump(rows, open(f, "w"))
for f in glob.glob(f"{E}/results/e7_*.json"):
    pass  # BANKING77 text (CC BY 4.0, PolyAI) is fine to keep
open(f"{E}/README.md", "w").write(f"""# Experiments

Everything the course shows as "measured" comes from these scripts. Results are in `results/`; the summary the site uses is `results/facts.json`.
Measured {facts['measured']} from {facts['where']}.

| Script | What it measures |
|---|---|
| `e1_banking77.py` | BANKING77 test set (3,080 messages, 77 intents), one Choice per message: accuracy, calibration, coverage, latency, cost; also with the options reversed |
| `e2_fanout.py` | 13 questions in one request vs 13 requests (sequential and parallel) |
| `e4_jagged.py` | Known failure modes: counting, arithmetic, dates, inverted questions, injection |
| `e7_llm_verbalized.py` | An LLM asked for JSON with a stated confidence, as a baseline |
| `e8_news.py` | Fresh news stories (after every model's release), 8-way section Choice |
| `e9_distractor.py` | State design: ticket alone, plus 6k unrelated tokens, or buried among 40 tickets |
| `e10_counterfactual.py` | Name-swap audit on 12 synthetic candidate summaries |
| `demos.py` | The individual requests whose real answers appear in the lessons |
| `analyze.py` | Builds `results/facts.json` |

`s1client.py` talks to Jev (`JEV_API_KEY`), Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) and a local Strands Decider server. It reads keys with Doppler; replace `_secret()` with environment variables to use your own.

Data: BANKING77 (Casanueva et al., 2020, CC BY 4.0, PolyAI). The news test set is published as links and labels only (`data/news_2026-10-15.links.json`).
""")
# keys come from the environment in the public copy
def sub(path, a, b):
    f = f"{P}/{path}"
    if os.path.exists(f): t = open(f).read(); open(f, "w").write(t.replace(a, b))
sub("tools/voice_batch.sh", "export FAL_KEY=${FAL_KEY:-$(doppler secrets get FALAI_API_KEY -p default -c prd --plain)}", ': "${FAL_KEY:?set FAL_KEY (fal.ai key) first}"')
sub("experiments/e7_llm_verbalized.py", 'KEY = subprocess.run(["doppler", "secrets", "get", "FALAI_API_KEY", "-p", "default", "-c", "prd", "--plain"], capture_output=True, text=True).stdout.strip()', 'KEY = os.environ["FAL_KEY"]')
sub("experiments/s1client.py", '_keys[name] = subprocess.run(["doppler", "secrets", "get", name, "-p", "default", "-c", "prd", "--plain"], capture_output=True, text=True).stdout.strip()', '_keys[name] = ""  # set the key as an environment variable')
# portable tool paths in the public copy: puppeteer-core from npm, Chrome from CHROME_BIN or the puppeteer cache
for t in glob.glob(f"{P}/tools/*.mjs"):
    src = open(t).read()
    src = src.replace('import puppeteer from "/home/agent/.local/lib/node_modules/hyperframes/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js";', 'import puppeteer from "puppeteer-core"; // npm i puppeteer-core')
    src = re.sub(r'const base = "/home/agent/\.cache/puppeteer/chrome-headless-shell/"; const exe = `\$\{base\}\$\{readdirSync\(base\)\[0\]\}/chrome-headless-shell-linux64/chrome-headless-shell`;',
                 'const base = `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell/`; const exe = process.env.CHROME_BIN || `${base}${readdirSync(base)[0]}/chrome-headless-shell-linux64/chrome-headless-shell`;', src)
    open(t, "w").write(src)
sub("tools/fetch_transcripts.sh", "doppler run --project default --config prd -- uv run ~/.claude/skills/kb-pipeline/scripts/supadata.py", "uv run supadata.py  # a Supadata API client; set SUPADATA_API_KEY")
# --- capstone ---
copytree(f"{W}/capstone", f"{P}/capstone", ignore=shutil.ignore_patterns("__pycache__"))
# --- lessons markdown (from the built site) ---
os.makedirs(f"{P}/lessons", exist_ok=True)
lessons = []
for m in course["modules"]:
    for l in m["lessons"]:
        lessons.append({**l, "module": m["title"]})
for i, l in enumerate(lessons, 1):
    src = f"{W}/site/dist/lessons/{l['slug']}.md"
    if os.path.exists(src): shutil.copy(src, f"{P}/lessons/{i:02d}-{l['slug']}.md")
# --- skills + plugin ---
copytree(f"{W}/agent/skills", f"{P}/skills")
refdir = f"{P}/skills/decision-models/references"; os.makedirs(refdir, exist_ok=True)
strip = lambda s: re.sub(r"\*\*(.+?)\*\*|\*(.+?)\*", lambda m: m.group(1) or m.group(2), s)
for i, l in enumerate(lessons, 1):
    a = json.load(open(f"{W}/course/lessons/{l['id']}.json"))
    lines = [f"# {a['title']}", "", strip(a["summary"]), "", "## Key ideas", ""] + [f"- {strip(x)}" for x in a.get("takeaways", [])]
    lines += ["", "## Practices for agents", ""] + [f"- {strip(x)}" for x in a.get("practices", [])]
    lines += ["", f"Full lesson (Markdown): {SITE}/lessons/{l['slug']}.md", f"Video: {SITE}/lessons/{l['slug']}/", ""]
    open(f"{refdir}/{i:02d}-{l['slug']}.md", "w").write("\n".join(lines))
os.makedirs(f"{P}/.claude-plugin", exist_ok=True)
json.dump({"name": "system-one", "description": "The System One course as skills: practices for building with decision models (Jev, OpenAI Decisions, Clef, Strands), an interactive tutor for the 22-lesson course, and an audit of LLM decisions in your codebase.", "version": "1.0.0", "author": {"name": "System One course", "url": REPO}, "homepage": SITE, "repository": REPO, "license": "CC-BY-4.0", "keywords": ["decision-models", "system-one", "jev", "classification", "skills", "course"]}, open(f"{P}/.claude-plugin/plugin.json", "w"), indent=2)
json.dump({"name": "system-one", "owner": {"name": "System One course", "url": REPO}, "metadata": {"description": "Free course on building software with decision models, packaged as skills.", "version": "1.0.0"}, "plugins": [{"name": "system-one", "source": "./", "description": "Decision-model practices + interactive course tutor + LLM-decision audit, from the free System One course.", "version": "1.0.0", "category": "development", "homepage": SITE}]}, open(f"{P}/.claude-plugin/marketplace.json", "w"), indent=2)
# --- README ---
data = {}
for l in lessons:
    f = f"{W}/site/static/data/{l['id']}.json"
    if os.path.exists(f): data[l["id"]] = json.load(open(f))
total_min = round(sum(d["total"] for d in data.values()) / 60)
n_calls = len(os.listdir(f"{W}/experiments/cache")) if os.path.isdir(f"{W}/experiments/cache") else 0
rows = []
n = 0
for mi, m in enumerate(course["modules"], 1):
    rows.append(f"\n### Module {mi} · {m['title']}\n\n{m['blurb']}\n\n| # | Lesson | Watch | Read | Length |\n|---|---|---|---|---|")
    for l in m["lessons"]:
        n += 1; d = data.get(l["id"]); mins = f"{round(d['total']/60)} min" if d else "–"
        title = json.load(open(f"{W}/course/lessons/{l['id']}.json"))["title"]
        rows.append(f"| {n:02d} | **{title}** | [▶ watch]({SITE}/lessons/{l['slug']}/) | [markdown](lessons/{n:02d}-{l['slug']}.md) | {mins} |")
B = facts["experiments"]["banking77"]["jev-1.13.0"]; F = facts["experiments"]["fanout"]
preview = '<p align="center"><a href="' + SITE + '"><img src="docs/course-preview.gif" alt="System One: a preview of the animated lessons" width="760"></a></p>\n\n' if os.path.exists(f"{W}/docs/course-preview.gif") else ""
readme = f"""{preview}<h1 align="center">System One</h1>
<p align="center"><b>A free, animated course on decision models: typed judgments, calibrated probabilities, and software that decides.</b><br>
TypeSafe Jev · OpenAI Decisions API · Cloudflare Clef · AWS Strands Decider.<br>
{len(lessons)} short lessons · ~{total_min} minutes · {len(cat)} sources · {n_calls:,} API calls we ran ourselves · every claim linked to its source.</p>

<p align="center">
<a href="{SITE}/lessons/{lessons[0]['slug']}/"><b>▶ Start lesson 1</b></a> ·
<a href="#lessons">All lessons</a> ·
<a href="#your-agent-can-take-this-course-too">For your agent</a> ·
<a href="{SITE}/measured/">What we measured</a> ·
<a href="{SITE}/llms.txt">llms.txt</a>
</p>

---

In September 2026 a new kind of model appeared: **System One models**, or decision models. They don't write. They read your data (the *state*) and answer typed questions with probabilities: a yes or no (**Noul**), one of your options (**Choice**), or a position on your scale (**Score**), in a single forward pass, in a fraction of a second, for a fraction of a cent. TypeSafe's Jev came first; OpenAI, Cloudflare and AWS followed within three weeks.

This course teaches you to build with them well: what to ask, which numbers to trust, how to compose small judgments in code, how to evaluate on your own data, and where they break. It's built from the vendors' docs and cookbooks, {sum(1 for s in cat.values() if s['kind'] in ('talk', 'podcast'))} talks and podcasts, {sum(1 for s in cat.values() if s['kind'] == 'paper')} papers, independent tests, and our own measurements. Not affiliated with or endorsed by TypeSafe, OpenAI, Cloudflare or AWS.

## What you'll learn

- **The idea**: why software needs decisions, System One vs System Two, how a decision model works, and the four you can use today
- **Asking good questions**: Noul, Choice and Score, and the state they read
- **Probabilities you can act on**: calibration, confidence, thresholds from costs, and how much you can safely automate
- **Composing judgments**: decomposition, asking everything at once, routing and cascades, select don't generate, verification and guardrails
- **Real systems**: decision models inside agents, and judgments as data
- **Shipping it**: the jagged edges, evaluating on your own data, deciding responsibly, and a capstone triage pipeline you can run

Each lesson is a 3–5 minute animated video, a full transcript, a quiz, a "try it with your agent" prompt, and cited sources.

## Measured for this course

Vendor numbers are upper bounds, so we ran our own tests ([details]({SITE}/measured/), [code](experiments/)). On BANKING77 (3,080 real banking messages, 77 intents), Jev 1.13 was {B['acc']*100:.1f}% right overall and {B['acc_ge_099']*100:.1f}% right on the {B['share_ge_099']*100:.0f}% of answers it gave at 0.99 or more, at about ${B['usd_per_1000_decisions']:.2f} per thousand decisions. Thirteen questions in one request took {F['batched']['median_latency_s']:.2f} s and {F['batched']['input_tokens']:,} tokens; as thirteen separate requests, {F['sequential']['median_latency_s']:.1f} s and {F['sequential']['input_tokens']:,} tokens.

## Your agent can take this course too

The course ships as **agent skills**:

```bash
npx skills add {SLUG}
```

In Claude Code you can also add it as a plugin marketplace:

```
/plugin marketplace add {SLUG}
/plugin install system-one@system-one
```

| Skill | What it does |
|---|---|
| `decision-models` | Practices your agent applies whenever it writes a decision-model call: typed questions, one request, thresholds from costs, select don't generate, code for arithmetic, evaluation |
| `system-one-tutor` | Teaches you the course interactively. Try: `teach me lesson 1 of system one` |
| `decision-audit` | Finds prompt-and-parse LLM calls that should be decisions, and reviews existing integrations. Try: `audit our LLM decisions` |

Or point any agent at [`llms.txt`]({SITE}/llms.txt) / [`llms-full.txt`]({SITE}/llms-full.txt).

<a id="lessons"></a>
## Lessons
{chr(10).join(rows)}

## The capstone

[`capstone/triage.py`](capstone/triage.py) is a complete support-triage pipeline built from the course: code prepares the state, one request asks 15 questions, code routes each ticket and logs every answer. Run it with your own key:

```bash
cd capstone && SYSTEM_ONE_KEY=... python3 triage.py
```

## How it's made

Lessons are scene lists (`course/lessons/*.json`) rendered live in the browser by a small GSAP engine (`site/static/js`), synced word by word to an AI narration. `site/build.mjs` builds the static site, per-lesson Markdown, `llms.txt` and `api/course.json`. Sources were distilled into quote-checked insights (`tools/extract_insights.py`); experiments are in `experiments/`. The narration audio isn't in the repo; it's served from the site.

```bash
node site/build.mjs            # build site/dist (needs the audio files to play lessons)
node tools/stills.mjs /data/<lesson>.json qa/<lesson>   # QA stills (serve site/static with dev/ and data/)
```

## License

Course content (lessons, transcripts, scene files) is [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Code (engine, build, tools, experiments, capstone) is MIT. Quotes belong to their authors and link to the original sources.
"""
open(f"{P}/README.md", "w").write(readme)
open(f"{P}/LICENSE", "w").write("""Course content (lessons, transcripts, scene files, skills text) is licensed under
Creative Commons Attribution 4.0 International (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

Code (site/, tools/, experiments/, capstone/) is licensed under the MIT License:

Copyright (c) 2026 System One course contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
""")
open(f"{P}/AGENTS.md", "w").write(f"""# AGENTS.md

This repo is the System One course: animated lessons on decision models, its static site, the experiments behind its numbers, and agent skills.

- Lessons: `course/lessons/*.json` (scene lists). Narration text lives in each scene's `narration`; `params` drive the animation templates in `site/static/js/templates*.js`.
- Every number or quote in a lesson must come from a source in `research/sources.json` or from `experiments/results/`. Don't invent figures.
- Build: `node site/build.mjs`. QA: `tools/stills.mjs` and `tools/motion_qa.mjs` against a static server rooted at a folder that links `dev/`, `data/`, `js/`, `css/`, `fonts/`, `img/`, `audio/`.
- Skills: `skills/*/SKILL.md`; per-lesson references are generated by `tools/assemble_repo.py`.
""")
print("assembled", P, "lessons md:", len(glob.glob(f"{P}/lessons/*.md")))
