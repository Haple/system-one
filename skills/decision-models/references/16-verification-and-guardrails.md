# Verify and guard

Decision models are cheap and fast enough to check everything: every citation an LLM writes, every message going in and out, every extracted field. Here is a citation check, a one-request guardrail screen, why two independent checks beat one, and why none of this is a security boundary.

## Key ideas

- Use decision models as fast judges: check claims against sources, screen messages, sanity-check extracted values.
- One request can screen a message for several hazards plus a severity score, mapped by code to pass, review, block or route.
- Your policy lives in your code, consistent across model versions, instead of in each lab's moving refusal line.
- When code can check something exactly (a verbatim quote, a sum), let code do it.
- A classifier guard reduces risk but is not a security boundary; with private data, untrusted input and outbound access, remove a capability.

## Practices for agents

- Check LLM citations with a Choice (supports / partially / contradicts / unrelated) against the source context, and verify verbatim quotes with string matching in code.
- Screen inputs and outputs with one request of narrow hazard questions plus a severity Score; map them to pass, review, block or route in code.
- Combine independent checks (extraction confidence and plausibility) and keep both reasons when both fail.
- Never rely on a decision-model guard alone to stop prompt injection; limit the agent's capabilities instead.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/verification-and-guardrails.md
Video: https://learn-system-one.pages.dev/lessons/verification-and-guardrails/
