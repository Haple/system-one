#!/usr/bin/env python3
"""Assemble research/sources.json: one entry per source with id, kind, title, url, who, date, path (clean text)."""
import json, os, re, glob
R = os.path.expanduser("~/system-one")
cat = {}
def add(sid, **kw):
    kw["id"] = sid
    p = kw.get("path")
    kw["chars"] = os.path.getsize(p) if p and os.path.exists(p) else 0
    cat[sid] = kw

# 1. TypeSafe docs
for f in sorted(glob.glob(f"{R}/sources/docs/clean/*.md")):
    slug = os.path.basename(f)[:-3]
    t = open(f).read(); m = re.search(r"^# (.+)$", t, re.M)
    path = slug.replace("__", "/")
    add("ts-docs-" + slug.replace("__", "-"), kind="doc", org="TypeSafe AI", title=(m.group(1).strip() if m else slug), url=f"https://docs.typesafe.ai/{path}", who="TypeSafe AI docs", date="2026-10", path=f)

# 2. TypeSafe blog + manifesto
blog = {
 "introducing-system-one-models-and-jev": ("Introducing System One Models & Jev", "Diogo Almeida", "2026-09-15"),
 "antibenchmaxxing": ("Lies, Damned Lies, and Benchmarks", "TypeSafe AI", "2026-09-11"),
 "bitterest-lesson": ("The Bitterest Lesson", "Diogo Almeida", "2026-09-10"),
 "jev-1-14": ("Jev: For the builders AND dreamers", "TypeSafe AI", "2026-10-14"),
 "series-ai": ("TypeSafe A raises Series AI", "TypeSafe AI", "2026-10-09"),
}
for slug, (title, who, date) in blog.items():
    add("ts-blog-" + slug, kind="article", org="TypeSafe AI", title=title, url=f"https://typesafe.ai/blog/{slug}", who=who, date=date, path=f"{R}/sources/web/blog/{slug}.txt")
add("ts-manifesto", kind="article", org="TypeSafe AI", title="Composable AI: Build Prod, Not God (manifesto)", url="https://typesafe.ai/manifesto", who="TypeSafe AI", date="2026-09", path=f"{R}/sources/web/manifesto.txt")

# 3. earlier extracted pages (sources/text)
T = f"{R}/sources/text"
early = {
 "latent-space-jev": ("www.latent.space_p_jev.md", "podcast", "Jev: System One models for Prod, not God (Latent Space podcast)", "https://www.latent.space/p/jev", "Diogo Almeida with swyx", "2026-09-21"),
 "latent-space-devday": ("www.latent.space_p_devday-2026.md", "article", "Why Dwarkesh is Wrong about Computer Use + How OpenAI shipped its Jev competitor in 1 Week", "https://www.latent.space/p/devday-2026", "Latent Space", "2026-09-30"),
 "newstack-typesafe": ("thenewstack.io_typesafe-jev-system-one_.md", "article", "TypeSafe launched Jev because sequential LLMs are \"totally useless for computers\"", "https://thenewstack.io/typesafe-jev-system-one/", "The New Stack", "2026-09-21"),
 "infoq-jev": ("www.infoq.com_news_2026_10_typesafe-ai-jev-released_.md", "article", "TypeSafe AI Releases Jev: a Decision-Only Model That Returns Typed Probabilities", "https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/", "InfoQ", "2026-10-01"),
 "openai-decisions-guide": ("developers.openai.com_api_docs_guides_decisions.md", "doc", "Decisions (OpenAI API guide)", "https://developers.openai.com/api/docs/guides/decisions", "OpenAI docs", "2026-10"),
 "cf-clef-blog": ("blog.cloudflare.com_clef-decision-models_.md", "article", "Introducing Clef: our open-source decision models, and new RL fine-tuning platform", "https://blog.cloudflare.com/clef-decision-models/", "Cloudflare", "2026-10-01"),
 "cf-clef-changelog": ("developers.cloudflare.com_changelog_post_2026-10-01-clef-workers-ai_.md", "doc", "Introducing Clef: Cloudflare's first open-source decision models, now on Workers AI", "https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/", "Cloudflare docs", "2026-10-01"),
 "hf-clef-card": ("huggingface.co_cloudflare_clef.md", "doc", "cloudflare/clef model card", "https://huggingface.co/cloudflare/clef", "Cloudflare", "2026-10-05"),
 "strands-readme": ("github.com_strands-labs_strands-decider.md", "repo", "strands-decider (README)", "https://github.com/strands-labs/strands-decider", "AWS Strands Labs", "2026-10"),
 "hf-strands-card": ("huggingface.co_StrandsAgents_strands-decider-2B-hobson-v19.md", "doc", "strands-decider-2B model card", "https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19", "AWS Strands Labs", "2026-10"),
 "newstack-aws-strands": ("thenewstack.io_aws-strands-decider-model_.md", "article", "AWS launches a local answer to TypeSafe's Jev decision model", "https://thenewstack.io/aws-strands-decider-model/", "The New Stack", "2026-10-01"),
 "jevbench-heaven-v1": ("benchmarkheaven.com_jev-models_v1.md", "article", "Jev-class models — JevBench v1.0", "https://benchmarkheaven.com/jev-models/v1", "Benchmark Heaven", "2026-09-19"),
 "devto-model-doesnt-talk": ("dev.to_danielsamfdo_the-model-that-doesnt-talk-5adm.md", "article", "The Model That Doesn't Talk", "https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm", "Daniel Sam", "2026-10-07"),
 "arxiv-crash-abs": ("arxiv.org_abs_2609.24052.md", "paper", "Calibrated Decisions at Scale: police crash narratives with a System One model (abstract)", "https://arxiv.org/abs/2609.24052", "arXiv", "2026-09-21"),
}
for sid, (fn, kind, title, url, who, date) in early.items():
    add(sid, kind=kind, title=title, url=url, who=who, date=date, path=f"{T}/{fn}")

# 4. GitHub docs
G = f"{R}/sources/gh"
for fn, title in [("strands-decider__docs_architecture.md", "strands-decider: architecture"), ("strands-decider__docs_inference.md", "strands-decider: inference"), ("strands-decider__docs_vision.md", "strands-decider: vision"), ("strands-decider__evaluation_README.md", "strands-decider: evaluation"), ("strands-decider__evaluation_results.md", "strands-decider: results"), ("strands-decider__evaluation_jevbench.md", "strands-decider: JevBench notes"), ("strands-decider__examples_strands_README.md", "strands-decider: agent example")]:
    p = fn.split("__")[1].replace("_", "/", 1)
    add("strands-" + fn.split("__")[1].replace(".md", "").replace("_", "-").lower(), kind="repo", title=title, url=f"https://github.com/strands-labs/strands-decider/blob/main/{p}", who="AWS Strands Labs", date="2026-10", path=f"{G}/{fn}")
add("jevbench-repo", kind="repo", title="JevBench v1 (benchmark for Jev-class typed decision models)", url="https://github.com/doxanocap/jevbench", who="JevBench authors", date="2026-09", path=f"{G}/jevbench__README.md")
add("jevbench-heaven-repo", kind="repo", title="JevBench by Benchmark Heaven", url="https://github.com/fstandhartinger/jevbench", who="Benchmark Heaven", date="2026-10", path=f"{G}/jevbench-heaven__README.md")

# 5. fetched list
meta = json.load(open(f"{R}/sources/fetched/_meta.json"))
import csv
for r in csv.DictReader(open(f"{R}/research/fetch_list.tsv"), delimiter="\t"):
    m = meta.get(r["id"], {})
    p = f"{R}/sources/fetched/{r['id']}.md"
    if not os.path.exists(p) or os.path.getsize(p) < 1500: continue
    add(r["id"], kind=r["kind"], title=m.get("title") or r["id"], url=r["url"], who=m.get("author") or m.get("sitename") or "", date=(m.get("date") or "")[:10], path=p)

json.dump(cat, open(f"{R}/research/sources.json", "w"), indent=1)
from collections import Counter
print(len(cat), Counter(v["kind"] for v in cat.values()), sum(v["chars"] for v in cat.values()), "chars")
