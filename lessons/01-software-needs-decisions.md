# Lesson 1: Software needs decisions, not essays

> Language models write beautifully, but most software needs a decision it can branch on. Here is the prompt-and-parse problem, the new shape of a decision model (state and typed questions in, typed answers and probabilities out), and how a whole category of these models appeared in three weeks.

Course: System One (https://learn-system-one.pages.dev/) · Module 1: The idea · 4 min · Watch: https://learn-system-one.pages.dev/lessons/software-needs-decisions/

## Key takeaways

- Most AI calls inside software are really decisions: which team, is it urgent, is this allowed.
- Prompt-and-parse (ask an LLM for JSON, then parse and retry) works, but it is slow, fragile and gives you no trustworthy confidence.
- A decision model takes state plus typed questions and returns typed answers with probabilities. It cannot return a value you did not offer.
- Code keeps control of the workflow; the decision model answers narrow questions; hard cases go to a reasoning model or a person.
- In three weeks of September and October 2026, TypeSafe, OpenAI, Cloudflare and AWS all shipped models of this kind.

## Practices for coding agents

- When an LLM call exists only to produce a label, a yes/no or a rating that code branches on, consider replacing it with a typed question to a decision model.
- Keep control flow, rules and side effects in code; use the model only for the judgment code cannot express.
- Never parse free text to recover a decision when a typed answer with probabilities is available.

## Lesson transcript


### Intro (0:01)

Language models can write an essay about anything. But most software doesn't need an essay. It needs a decision it can act on. This course is about a new kind of model built for exactly that.

### The gap (0:14)

Diogo Almeida helped build the methods behind ChatGPT at OpenAI. When he launched his company, TypeSafe, he opened with one question. Models have been superhuman at chat for years, so where is all the automation?

### Prompt and parse (0:29)

Here's how most apps ask a language model for a decision today. Ask for JSON in the prompt. Parse the reply. Then wrap everything in retries, because sometimes the answer gets cut off, or invents a field, or a team you never offered. And the confidence it writes is just more text.

```python
reply = llm(f"Classify this ticket. Answer as JSON:"
            f" team, refund_requested, confidence.\n{ticket}")
try:
    data = json.loads(reply)
except json.JSONDecodeError:
    data = retry()
if data["team"] not in TEAMS:
    data = retry()
confidence = float(data["confidence"])
```

Developer Daniel Sam put the mismatch in two sentences. Software doesn't want sentences. It wants values it can branch on.

### The new shape (0:57)

A decision model flips the interface. You send state, which is just your data, and a few typed questions: a yes or no, a choice from your options, a score on your scale. Back comes one typed answer per question, each with probabilities. All of them together, in a quarter of a second. Nothing to parse.
Why so fast? A language model writes its answer one token at a time. A decision model reads your data once and scores every allowed answer in parallel. On the same support messages, a small, fast LLM took about one point two seconds per answer. Jev took about a quarter of a second.

### Cheap enough to ask a lot (1:38)

It's also cheap enough to ask a lot. For this course, we sent all 3,080 messages from a public banking support dataset through Jev. It took about a hundred seconds, and the whole run cost twenty two cents.

### A category in three weeks (1:52)

TypeSafe launched Jev on September fifteenth and called it the first System One model. Two weeks later, OpenAI previewed a Decisions API. Cloudflare released Clef with open weights, and AWS released Strands Decider, small enough to run on a laptop. By the time Jev 1.14 shipped on October fourteenth, decision models were a category.

### Who does what (2:16)

This isn't about replacing language models. Your code keeps control of the workflow: the rules, the math, the side effects. The decision model answers narrow questions fast. And when a case is genuinely hard, a reasoning model or a person takes it.
A simple test. If the output is one of a known set of answers that code will act on, it's a decision: route this, is it urgent, does this break a rule, which of these candidates matches. If the output is new text, like a reply, a summary or code, you still want a language model.

### Quick check (2:53)

**Quiz:** Which job is the best fit for a decision model?
A. Draft a polite reply to an angry customer
B. Decide which team should handle a ticket
C. Summarize a 40-page contract
D. Write a SQL query from a question
Answer: B. Routing has a known set of answers that code acts on. The others produce new text, which is a language model's job.


### Try it (3:03)

Try this with your coding agent. Have it find every place your code asks a language model for a decision and parses the answer. That list is your shortlist for the rest of this course.

```text
Find every place in this codebase where we call an LLM and then parse its output into a decision: a label, a yes/no, a score, or one item from a list.
For each one, give file:line, the decision it makes, the allowed answers, and whether it could be a typed question (yes/no, choice or score) to a decision model. Don't change any code yet.
```


### Recap (3:15)

So: software needs decisions, not essays. Prompt and parse is slow and fragile. Decision models take state and typed questions and return typed answers with probabilities. Next, where that idea comes from: System One and System Two.

## Sources

- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Founders You Should Know: Diogo Almeida - TypeSafe AI (at 0:56). https://www.youtube.com/watch?v=LE3bGTaAgOE&t=56s
- a16z: How Jev Turns AI Into Software That Gets Things Done (at 39:59). https://www.youtube.com/watch?v=Ut3LOjKNJaE&t=2399s
- Syntax: Jev Explained: Demos and Use Cases (at 3:51). https://www.youtube.com/watch?v=QbYBRjOaGOo&t=231s
- Daniel Sam: The Model That Doesn't Talk. https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm
- TypeSafe AI docs: Introduction. https://docs.typesafe.ai/introduction
- TypeSafe AI docs: How to build with TypeSafe. https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- OpenAI docs: Decisions (OpenAI API guide). https://developers.openai.com/api/docs/guides/decisions
- Cloudflare docs: Introducing Clef: Cloudflare's first open-source decision models, now on Workers AI. https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/
- Marc Brooker; Mike Chambers; Fabio Nonato de Paula: Introducing Strands Decider 2B: a small, open source, decision model. https://strandsagents.com/blog/introducing-strands-decider/
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- Simon Willison: Jev introduces a new shape of LLM—System One, aka Decision Models. https://simonwillison.net/2026/Sep/21/jev/

License: CC BY 4.0 · https://github.com/Haple/system-one
