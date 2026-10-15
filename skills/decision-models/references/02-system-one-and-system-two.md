# System One and System Two

The name comes from Daniel Kahneman: fast, automatic judgment versus slow, effortful reasoning. Here is what the metaphor gets right about decision models, where it breaks, and the rule of thumb it gives you: if an expert could answer in a few seconds, it is a System One question.

## Key ideas

- Kahneman's System 1 is fast, automatic and effortless; System 2 is slow, serial and effortful. Decision models aim at the first kind of judgment.
- Rule of thumb: if a knowledgeable person could answer in a few seconds with the right context, it is a System One question.
- Tasks that need several steps of reasoning, new text or planning are System Two work: send them to a reasoning model, a person, or decompose them.
- The useful architecture is a layer cake: code is exact, the decision model judges, the language model thinks.
- The two systems are a metaphor, and fast does not have to mean sloppy: what makes fast judgments usable is honest uncertainty.

## Practices for agents

- Before calling a decision model, check that each question is a few-second judgment for an expert given the state; if not, split it or route it to a reasoning model.
- Keep exact computation (math, dates, counting, lookups) in code, never in a fast judgment.
- Escalate System Two work (multi-step reasoning, writing, planning) to an LLM or a person instead of forcing it into one question.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/system-one-and-system-two.md
Video: https://learn-system-one.pages.dev/lessons/system-one-and-system-two/
