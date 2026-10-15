# Lesson 13: Ask everything at once

> Questions about the same state belong in one request: they are evaluated in parallel and independently, so extra questions add a few tokens and almost no time. Here is what we measured with 13 questions, why you should ask speculative questions you might not need, and the few cases where a second request is genuinely warranted.

Course: System One (https://learn-system-one.pages.dev/) · Module 4: Composing judgments · 3 min · Watch: https://learn-system-one.pages.dev/lessons/speculative-fan-out/

## Key takeaways

- Every question in a request sees the same state and is evaluated independently and in parallel.
- In our test, 13 questions in one request took 0.27 seconds and 1,828 tokens; 13 separate requests took 3.3 seconds and 18,940 tokens, with the same answers.
- Ask speculative questions: everything your code might need, including ones that only matter on some branches, and let code ignore the rest.
- A second request is warranted only when an earlier answer changes the state or the options of the next question.
- Coding agents tend to write one question per call; check their integrations for this.

## Practices for coding agents

- Batch every question about the same state into one request, including speculative ones for later branches.
- Split into a second request only when the next question's state or options depend on an earlier answer.
- Review agent-written integrations for one-question-per-call loops and merge them.

## Lesson transcript


### Intro (0:01)

Once you're asking many small questions, the next question is how to send them. The answer is: all at once. Let's see why, with numbers.

### Parallel and independent (0:11)

In one request, every question sees the same state, and each is evaluated on its own, in parallel. One answer is never hidden context for another. So adding a question costs a few tokens for its text, and almost no time.

### What we measured (0:27)

We tested it. One support ticket, the customer's record, and a seven hundred word policy, about eighteen hundred tokens of state. Thirteen questions: the category, a refund request, a duplicate charge, whether policy allows it, a login problem, a repeat contact, a churn threat, and more. All thirteen came back together.
In one request, thirteen questions took a quarter of a second and eighteen hundred tokens. As thirteen separate requests, one after another, they took three point three seconds and almost nineteen thousand tokens, because the state was sent thirteen times. Firing the thirteen in parallel fixes the time, but not the bill. And the answers? The same, within point oh four.

### Speculative questions (1:16)

So ask speculatively. Include every question your code might need, even ones that only matter on some branches. Bug severity only matters if it's a bug report. A refund question only matters for billing. Ask them all anyway, and let the code use what applies.

```python
questions = {
    "category": Choice(...),          # always needed
    "bug_severity": Score(...),       # only if category == bug
    "has_repro_steps": Noul(...),    # only if category == bug
    "refund_requested": Noul(...),   # only if category == billing
    "frustration": Score(...),       # always useful
}
a = client.system_one(state=ticket, questions=questions).answers
if a["category"].choice == "bug" and a["bug_severity"].score > 1.5:
    escalate(ticket)                  # the speculative answers were ready
```


### When a second request is right (1:34)

When is a second request justified? Only when an earlier answer changes what you'd send next. TypeSafe's cookbooks have three real cases. Skill suggestion ranks a hundred eighty two skills, then fetches the full text of the top three and judges them again. Structure recovery first decides which line breaks split sentences, then classifies the paragraphs that didn't exist before. And hierarchical classification uses each level's answer to pick the next level's options.

### Watch your agent (2:04)

One warning from the TypeSafe docs: coding agents fall into the one question per call habit more than people do. If an agent writes your integration, look for a loop that sends one question at a time, and merge it.

### Quick check (2:19)

**Quiz:** You need the category, and if billing, whether a refund was asked for. Best approach?
A. Ask the category, then send a second request for billing tickets
B. Ask both in one request; ignore the refund answer for non-billing tickets
C. Ask one combined question: is this a billing refund request?
D. Ask an LLM to write both answers as JSON
Answer: B. The refund question doesn't depend on the category answer; it can be asked of any ticket. Ask it speculatively in the same request and let code decide whether to use it.


### Try it (2:33)

Try it. Have your agent find and merge your one question per call loops, and measure the difference.

```text
Find every place we call a decision model (or an LLM classifier) more than once about the same input. Merge the questions into one request, adding speculative questions that later branches might need. Keep a second request only where the next question's state or options depend on an earlier answer, and add a comment explaining why. Measure latency and input tokens before and after on 20 real inputs.
```


### Recap (2:39)

So: questions about the same state go in one request. They're evaluated in parallel and independently, so extra questions are nearly free. Ask speculatively, and only make a second request when the next question depends on the first. Next: routing requests to the right handler.

## Sources

- TypeSafe AI docs: Speculative fan-out. https://docs.typesafe.ai/patterns/fan-out
- TypeSafe AI docs: Primitives (Questions). https://docs.typesafe.ai/primitives
- TypeSafe AI docs: Parallel questions. https://docs.typesafe.ai/cookbooks/parallel_questions
- TypeSafe AI docs: Skill suggestion. https://docs.typesafe.ai/cookbooks/skill_suggestion
- TypeSafe AI docs: Structure recovery. https://docs.typesafe.ai/cookbooks/autoformat
- TypeSafe AI docs: Hierarchical classification. https://docs.typesafe.ai/cookbooks/hierarchical_classification
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- AWS Strands Labs: strands-decider: inference. https://github.com/strands-labs/strands-decider/blob/main/docs/inference.md
- Marc Brooker: Strands Decider: Why Not an Encoder?. https://brooker.co.za/blog/2026/10/04/encoders.html
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md

License: CC BY 4.0 · https://github.com/Haple/system-one
