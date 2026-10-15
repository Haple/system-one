# Software needs decisions, not essays

Language models write beautifully, but most software needs a decision it can branch on. Here is the prompt-and-parse problem, the new shape of a decision model (state and typed questions in, typed answers and probabilities out), and how a whole category of these models appeared in three weeks.

## Key ideas

- Most AI calls inside software are really decisions: which team, is it urgent, is this allowed.
- Prompt-and-parse (ask an LLM for JSON, then parse and retry) works, but it is slow, fragile and gives you no trustworthy confidence.
- A decision model takes state plus typed questions and returns typed answers with probabilities. It cannot return a value you did not offer.
- Code keeps control of the workflow; the decision model answers narrow questions; hard cases go to a reasoning model or a person.
- In three weeks of September and October 2026, TypeSafe, OpenAI, Cloudflare and AWS all shipped models of this kind.

## Practices for agents

- When an LLM call exists only to produce a label, a yes/no or a rating that code branches on, consider replacing it with a typed question to a decision model.
- Keep control flow, rules and side effects in code; use the model only for the judgment code cannot express.
- Never parse free text to recover a decision when a typed answer with probabilities is available.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/software-needs-decisions.md
Video: https://learn-system-one.pages.dev/lessons/software-needs-decisions/
