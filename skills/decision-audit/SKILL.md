---
name: decision-audit
description: Audit a codebase for model-made decisions, from the free System One course. Finds LLM prompt-and-parse calls that should be typed decision-model questions (classification, routing, yes/no checks, scoring, extraction), and reviews existing decision-model integrations (Jev, OpenAI Decisions, Clef, Strands) against the course's checklist. Use when the user asks to audit LLM usage, find classification or routing prompts, review a decision-model integration, or says "audit our LLM decisions".
license: CC-BY-4.0
metadata:
  course: https://learn-system-one.pages.dev
---

# Decision audit

Produce a short, prioritized report. Read code; don't change it unless the user asks. Don't call any model API during the audit.

## 1. Find the decisions
Search for places where code asks a model for a judgment and branches on it:
- LLM calls whose output is parsed into a label, boolean, number or one item from a list (`json.loads` on a completion, `.lower() == "yes"`, regexes over model output, "respond with JSON", "answer yes or no", "rate from 1 to 10", "confidence" fields in prompts).
- Existing decision-model calls: `/v1/systemone`, `/v1/decisions`, `@cf/cloudflare/clef`, `typesafe_sdk`, `Noul(`, `Choice(`, `Score(`.
For each, note the file and line, what is decided, what the code does with it, and how often it runs.

## 2. Classify each one
- **Decision model**: a judgment an expert could make in seconds from the given data, with a known set of answers. Candidate to convert.
- **Code**: anything exact (counting, sums, comparing numbers or dates, string matching, lookups). The model shouldn't be doing it at all.
- **LLM**: open-ended writing, planning or multi-step reasoning. Leave it, or put a decision model in front as a router.

## 3. Review existing integrations against the checklist
- One condition per question; high means yes; no negations; exact condition written out.
- Choice options described contrastively, with an `other`/`none` option when inputs can fall outside.
- Score levels described as situations, one dimension per Score, used to rank or threshold.
- State is a named object with only what the questions need; questions point at fields; no "item 17 of 40" indirection.
- All questions about the same state in one request (look for loops sending one question per call).
- No counting, arithmetic or date comparison asked of the model; values selected from code-found candidates, not generated.
- Thresholds are named constants in code, justified by costs, with a review band; the model version is pinned.
- Exact checks in code (verbatim quotes, card numbers, limits) before any action that moves money or data.
- A labeled eval set exists (real inputs, a few hundred), with per-question accuracy, calibration and coverage, run as a regression test.
- Decisions about people: counterfactual tests, subgroup audit, decision logs with answers, human review sample, appeal path.

## 4. Report
Group findings as **Convert** (prompt-and-parse calls to replace, with a sketch of the typed questions), **Fix** (integration issues from the checklist, most severe first) and **Move to code** (exact work the model is doing). For each, give the file and line, the problem, the fix, and the expected effect (latency, cost, reliability). End with the single highest-value change.

## Example
- **`triage.py:42` asks GPT to "return JSON with category, urgent (true/false) and confidence".** Convert: one request with a Choice for category (contrastive descriptions + `other`) and a Noul for urgency; drop the self-reported confidence and use the returned probabilities; route below 0.6 to a person. Expected: one call instead of a generation, no parse failures, probabilities you can threshold.
