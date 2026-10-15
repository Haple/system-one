---
name: decision-models
description: How to design, call and ship System One decision models (TypeSafe Jev, OpenAI Decisions API, Cloudflare Clef, AWS Strands Decider), distilled from the free System One course. Use whenever you write or review code that asks a model to classify, route, triage, score, screen, extract a value or answer yes/no, including when replacing an LLM prompt-and-parse call with typed questions, choosing thresholds, or evaluating a decision model on real data.
license: CC-BY-4.0
metadata:
  course: https://learn-system-one.pages.dev
  source: https://github.com/Haple/system-one
---

# Decision models: how to build with them

A decision model reads a **state** and answers **typed questions** (Noul = yes/no probability, Choice = one of N options with probabilities, Score = position on ordered levels) in one forward pass. It never writes text. Use it for judgments an expert could make in a few seconds; use code for anything exact, and an LLM for writing, planning and multi-step reasoning.

## 1. Request shape
- Jev, Clef and Strands: `POST /v1/systemone` with `{"model", "state", "questions": {name: {"type": "noul"|"choice"|"score", "instructions", "criteria"}}}`. OpenAI Decisions: `POST /v1/decisions`, `input` instead of `state`, `predicate` instead of `noul`, a `choices` list and a `levels` list.
- Choice `criteria` is a map of option → description (or null). Score `criteria` is the ordered list of levels. Strands needs string descriptions, never null.
- Pin the exact model version (`jev-1.13.0`), never "latest". Upgrades move probabilities and therefore thresholds.

## 2. Ask good questions
- **One condition per question.** "Angry and asking for a refund?" hides two judgments; ask two Nouls and combine in code.
- **High means yes.** "Contains personal data?", not "Free of personal data?". No negations in instructions; `true` must mean yes.
- **Write the exact condition**, and put boundary cases in criteria. When you catch yourself explaining what you meant, add that to the question.
- **Choice:** describe confusable options contrastively (what it covers, what it's not for, an example). Always offer an `other`/`none` option if inputs can fall outside the list; the model must pick something.
- **Score:** describe each level as a concrete situation, not a number. One dimension per Score. Give rare extremes their own level. Use scores to rank and threshold, never as exact quantities.
- **0.5 means "can't tell"**, not "medium". If answers cluster near 0.5, the question is ambiguous.

## 3. Give it the right state
- A named JSON object: what you'd hand an expert panel, and nothing else. Point questions at fields with backticked paths (`ticket.text`, `order.charges`).
- Name the thing you're asking about; don't make it hunt (asking about item 17 of 40 by index lost 17 of 30 refunds in our test). Send the item on its own.
- Describe your company/domain in the state if a question depends on it. Filter long or noisy state first.
- The state is data, but adversarial text can still move answers. Never rely on a decision model as a security boundary.

## 4. One request, many questions
- Put every question about the same state in **one request**, including speculative ones only some branches need; code ignores the rest. (13 questions: 0.27 s and 1.8k tokens in one request vs 3.3 s and 18.9k tokens as 13 calls.)
- Make a second request only when the next question's state or options depend on an earlier answer (new evidence, new state, new options).

## 5. Compose in code
- Decompose broad judgments into narrow questions; combine with **hard rules for vetoes** and **weights for trade-offs**, in code. Validate the combination on labeled data; decomposition can hurt.
- **Select, don't generate:** find candidates with regex/parsers/search, ask a Choice which candidate is the requested value (plus `none`), copy it verbatim.
- **Dates:** ask month, day and year as separate Choices with `not_stated`; build and compare dates in code.
- **Never ask the model to count, add, compare numbers or compare dates.** For semantic counting, one Noul per item, summed in code.
- Rerank search results with one relevance Noul per candidate; walk deep taxonomies level by level with a small beam.

## 6. Thresholds, routing and review
- Set the action threshold from costs: act when p > C_false / (C_false + C_miss). Put the constants and the reasoning in code.
- Three paths: act, confirm/review, escalate. Send the least confident to people first.
- Pick thresholds from a coverage table on a few hundred labeled examples (share automated vs accuracy). It's an estimate; leave margin.
- Route with one fast decision in front of expensive handlers (code, an LLM, a person). Cascade: accept confident answers, escalate the rest, tuned against a strong model on a sample. Route whole tasks or effort, never switch models mid-session (it kills the prompt cache).
- Confidence can't detect out-of-scope inputs (another language, unknown domain): check scope first.

## 7. Verify and guard
- Model for meaning, code for exact text: check a quote exists verbatim with a string match, then ask a Choice whether it supports the claim (supports / partially / contradicts / unrelated).
- Screen messages with one request of narrow hazard Nouls plus a severity Score; map to pass / review / block / route in code. Redact card numbers and secrets in code before any model sees them.
- In agents: gate tool calls on narrow questions (are the arguments grounded in what the user said? is it premature?) and guide the agent back instead of failing.

## 8. Evaluate and ship
- Evaluate on real, recent inputs labeled by domain experts. 30 labels find failure modes; measuring accuracy needs hundreds (±14 points at 30 labels, ±4.5 at 300, for 80% accuracy).
- Report per question: accuracy with its margin, calibration (ECE / reliability table) and coverage at the target. Make it a regression test that pins the model version.
- Test every change, even wording. Hold out cases before tuning questions.
- Store raw answers (probabilities, model, date) as data; recompute composites in code.
- For decisions about people: run counterfactual tests (swap names and other attributes that must not matter), audit by subgroup, log every decision with its answers, sample automated decisions for review, offer an appeal to a person.

## Examples
- **"Classify these tickets with GPT and parse the JSON."** Replace with one decision-model request: a Choice for category (with `other` and contrastive descriptions), Nouls for each condition the code branches on, all in one request. Thresholds as named constants derived from costs; a review band in the middle.
- **"Extract the invoice total."** Regex every money amount, ask a Choice which candidate is the total (plus `none`), copy the chosen string, parse it in code.
- **"Flag late payments."** Extract the invoice and payment dates as part-Choices, compute the days in code.
- **"Is our classifier good?"** Build a labeled set of ~300 real inputs, report accuracy ± margin per question, calibration and coverage at the target, pinned model, as a test in CI.

## Learn more
- One reference per lesson is in `references/`; read the one that matches the situation.
- The full course, readable by agents: https://learn-system-one.pages.dev/llms.txt
