# Lesson 16: Verify and guard

> Decision models are cheap and fast enough to check everything: every citation an LLM writes, every message going in and out, every extracted field. Here is a citation check, a one-request guardrail screen, why two independent checks beat one, and why none of this is a security boundary.

Course: System One (https://learn-system-one.pages.dev/) · Module 4: Composing judgments · 4 min · Watch: https://learn-system-one.pages.dev/lessons/verification-and-guardrails/

## Key takeaways

- Use decision models as fast judges: check claims against sources, screen messages, sanity-check extracted values.
- One request can screen a message for several hazards plus a severity score, mapped by code to pass, review, block or route.
- Your policy lives in your code, consistent across model versions, instead of in each lab's moving refusal line.
- When code can check something exactly (a verbatim quote, a sum), let code do it.
- A classifier guard reduces risk but is not a security boundary; with private data, untrusted input and outbound access, remove a capability.

## Practices for coding agents

- Check LLM citations with a Choice (supports / partially / contradicts / unrelated) against the source context, and verify verbatim quotes with string matching in code.
- Screen inputs and outputs with one request of narrow hazard questions plus a severity Score; map them to pass, review, block or route in code.
- Combine independent checks (extraction confidence and plausibility) and keep both reasons when both fail.
- Never rely on a decision-model guard alone to stop prompt injection; limit the agent's capabilities instead.

## Lesson transcript


### Intro (0:01)

Language models write. Decision models can check what they wrote, fast and cheap enough to check every single output. This lesson is about judges and guards.

### Check the citation (0:12)

Say an LLM writes: walking seven thousand steps a day cuts hospitalization risk by thirty one percent, the study proved. And it cites a quote. One Choice checks the claim against the quote in the context of the source. The answer: partially, at point nine nine. The number is right, but the source is an observational study that proved nothing.
But notice what we didn't ask the model. Is the quote in the source word for word? We tried, and got point eight six, for a quote that is there exactly. That's a string match, and code gets it right every time. Let the model judge meaning. Let code check text.

```python
def check(claim, quote, source):
    if quote not in source:                    # exact: code's job
        return "misquoted"
    a = decide(state={"claim": claim, "quote": quote, "source": source},
               questions={"support": SUPPORT_CHOICE}).answers
    return a["support"].choice                 # meaning: the model's job
```


### Guard the gate (0:54)

Guardrails work the same way. Screen every message going into your LLM app with one request: a few narrow hazard questions, and a severity score. This message tries a prompt injection and pastes a card number. Injection, point nine nine. Card number, point nine eight. Self harm and harassment, near zero. Severity: must be blocked.
Then code maps the answers to an action. Clean messages pass. Uncertain ones go to review. Clear violations are blocked. And some get routed: a card number gets redacted before the LLM ever sees it.

### Your policy, in your code (1:33)

Why not just rely on the LLM's own refusals? The TypeSafe guardrails cookbook explains: labs teach most LLMs to refuse a set of unsafe requests, but each lab draws that line somewhere else, and each new version of a model moves it again. A separate judge puts your policy in your code.

### Two checks, two reasons (1:53)

For extracted data, use two independent checks. Unsiloed reads a medication list and scores each field, then asks Jev whether each dose is plausible. A coffee stain over one dose fails the reading check, while Jev, seeing only the text, calls it plausible. Ten ibuprofen tablets three times a day reads perfectly, but Jev puts its plausibility at point oh four. Each check flags a review need the other misses.

### Not a security boundary (2:23)

Now the warning. TypeSafe's notes say the state is data, but Jev doesn't treat it as hostile by default, and text written to steer it can move the answer. Our injection test was caught, but don't build on that. If an agent can read private data, see untrusted content, and send data out, Simon Willison's lethal trifecta, no classifier makes it safe. Remove one of the three.

### Quick check (2:48)

**Quiz:** Does the LLM's quote appear in the source word for word? Best check?
A. A Noul: “Is the quote in the source verbatim?”
B. A Score for similarity
C. A string match in code
D. Ask the LLM to double-check itself
Answer: C. Exact text checks are code's job. Use the decision model for meaning: does the quote, in context, support the claim?


### Try it (3:02)

Try it. Have your agent add one judge and one guard to your LLM feature.

```text
For our main LLM feature, add:
1. An input guard: one decision-model request with narrow hazard Nouls
   (injection, PII, abuse, out of scope) + a severity Score, mapped in
   code to pass / review / block / route (e.g. redact PII).
2. An output judge: for each claim with a citation, check the quote
   exists verbatim in code, then ask a Choice whether the quote, in
   context, supports / partially supports / contradicts the claim.
Log every verdict with its probabilities, and test on 30 examples.
```


### Recap (3:08)

So: decision models make cheap, fast judges. Check meaning with the model and text with code. Screen messages with one request and map the answers to actions. Use independent checks. And remember, a guard is not a security boundary. That's module four. Next: decision models inside agents.

## Sources

- TypeSafe AI docs: Double-checking citations. https://docs.typesafe.ai/cookbooks/citation_check
- TypeSafe AI docs: Guardrails for LLMs. https://docs.typesafe.ai/cookbooks/llm_guardrails
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- Unsiloed AI: Document Review With Unsiloed and TypeSafe Jev. https://www.unsiloed.ai/blog/document-review-unsiloed-typesafe-jev
- Simon Willison: The lethal trifecta for AI agents: private data, untrusted content, and external communication. https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- IndyDevDan: 10 Levels of Jev For Agentic Engineers (at 2:20). https://www.youtube.com/watch?v=_U-O5lYhJ7Q&t=140s
- AI Engineer: $1 AI Guardrails: The Unreasonable Effectiveness of Finetuned ModernBERTs – Diego Carpintero. https://www.youtube.com/watch?v=YZHPEkfy2kc
- Hamel Husain: Using LLM-as-a-Judge For Evaluation: A Complete Guide – Hamel’s Blog. https://hamel.dev/blog/posts/llm-judge/

License: CC BY 4.0 · https://github.com/Haple/system-one
