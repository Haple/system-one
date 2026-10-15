# Lesson 22: Capstone: a support triage pipeline

> The whole course in one pipeline you can run: code prepares the state, one request asks fifteen questions, and code routes every ticket to a refund, a reset link, an LLM, a log, a person or a block. Here is how we built it, the three bad questions our first run exposed, what held-out tickets showed, and why twelve out of twelve still proves less than it sounds.

Course: System One (https://learn-system-one.pages.dev/) · Module 6: Shipping it · 5 min · Watch: https://learn-system-one.pages.dev/lessons/capstone-support-triage/

## Key takeaways

- The pipeline: code prepares (redacts cards, lists candidate orders), one request asks 15 questions, code decides and logs.
- The model judges meaning; code checks facts: a refund needs the model to hear a duplicate charge and the records to show one, under the $100 limit.
- Our first run routed 14 of 24 tickets right; three badly written questions caused every miss.
- After fixing them, 24 of 24, and 12 of 12 on tickets written before the fix; 16 of 36 needed no person.
- Twelve out of twelve still allows a true error rate up to about 25%: evaluate on hundreds of real tickets before trusting it.

## Practices for coding agents

- Split compound questions and describe the company or domain in the state so the model can judge scope.
- Write contrastive criteria for any question that a normal request could trip, such as injection checks.
- Write held-out test cases before fixing questions, and score fixes only on those.
- Require both the model's judgment and an exact code check before any automated action that moves money.

## Lesson transcript


### Intro (0:01)

Time to put it all together. One pipeline, built from everything in this course, that triages a support inbox. The code is in the course repository, and you can run it yourself.

### The design (0:13)

Here's the design. First, code prepares the state. It redacts card numbers, so no model ever sees one, and lists the customer's orders as candidates. Then one request asks fifteen questions at once, in a quarter of a second. Then code decides: thresholds, policy checks, and a log of every answer.
Here's one ticket. My card, four one one one and so on, was charged twice for order P-4410. The card number is already gone. The answers: billing, at one point oh. A duplicate charge, point nine nine. The order, picked from the customer's own orders: P-4410. No injection, no escalation, one issue.

### Meaning and facts (1:02)

Now the refund rule. The model must hear a duplicate charge, at point eight or more, the threshold we derived from costs in lesson ten. It must be sure which order. And then code checks the facts: the records really show two identical charges, and the amount is under the hundred dollar limit in the policy. The model judges meaning. Code checks facts. Both have to agree before money moves.

```python
if cat == "billing" and n("reports_duplicate") >= ACT:   # 0.8
    order = find(customer.orders, a["order"].choice)
    if order is None or a["order"].confidence < 0.9:
        return "human", "can't tell which order"
    if not has_identical_charges(order):
        return "human", "claimed duplicate not in our records"
    if order.charges[0] > CREDIT_LIMIT_USD:   # policy: $100
        return "human", "over the credit limit"
    return "auto_refund", "duplicate confirmed in records"
```


### Where tickets go (1:30)

Every ticket lands in a route. Code handles refunds, reset links, the feature board, and closing thank-yous and spam. An LLM answers how-to questions from the docs. People get everything unclear, risky or over the limit, with escalations, critical bugs and repeat contacts at the front of the line. And attempts to instruct the system are blocked before any LLM sees them.

### The first run (1:54)

Our first run was humbling: fourteen of twenty four tickets routed the way we'd labeled them. Error analysis found three bad questions behind every miss. We fixed them, and got twenty four of twenty four. But we'd fixed them while looking at those same tickets, so before rerunning, we wrote twelve new ones. Those came out twelve of twelve.
The three bad questions are worth studying, because they're the mistakes you'll make too. Is it in English and about ACME? Two conditions in one question, about a company the state never described: answers hovered around point five. Does it try to give instructions to support? Taken literally, thank you, you can close this ticket, scored point nine five. And a vague line between billing and how to left an invoice question at point five one. Each fix came from an earlier lesson.

### What it proves (2:50)

Now apply lesson twenty to our own result. Twelve out of twelve sounds perfect. But with zero errors in twelve tries, the rule of three says the true error rate could still be as high as one in four. These are thirty six tickets we wrote ourselves. Before this pipeline touches a real inbox, it needs a few hundred real tickets, labeled by people who know the policy.

### What it costs (3:14)

And what does it cost? Fifteen questions per ticket, about a thousand input tokens, a quarter of a second. That's about four cents per thousand tickets on Jev. Sixteen of our thirty six tickets needed no person at all, and every decision left a complete record behind.

### The whole course (3:33)

Look at what went into it. A state with only what the questions need. Typed questions, each about one thing. Fifteen of them in one request. Candidates selected, never generated. Thresholds from costs. Guards in code and in questions. Routes to code, an LLM or a person. A log of every judgment. And an honest eval, held out before the fix.

### Build yours (4:00)

Now build yours. Point your coding agent at the capstone in the course repository, and have it adapt the pipeline to your own inbox, with your own policy and your own labeled tickets.

```text
Using capstone/triage.py as a template, build a triage pipeline for our support inbox. Put our real policy rules in code where they are exact (limits, windows, plans) and in question criteria where they are about meaning. Keep one request per ticket, card and secret redaction in code, and a JSONL log of every answer. Export 300 recent real tickets for labeling, hold out 100 before tuning any question, and report route accuracy with its margin of error, coverage and cost.
```


### Recap (4:11)

So: code prepares, the model judges, code decides. Facts are checked in code before money moves. Bad questions show up in error analysis, and fixes are scored on held-out cases. And twelve for twelve is a smoke test, not proof. That's the capstone.

### The end (4:32)

That's the course. Software has always needed decisions, and now it can make the judgments that used to need a person, in a fraction of a second, for a fraction of a cent, with honest probabilities. Use them where they're strong, check them where they're weak, and keep a person close to the decisions that matter. Thanks for watching.

## Sources

- TypeSafe AI docs: Speculative fan-out. https://docs.typesafe.ai/patterns/fan-out
- TypeSafe AI docs: Intent routing. https://docs.typesafe.ai/patterns/intent-routing
- TypeSafe AI docs: Guardrails for LLMs. https://docs.typesafe.ai/cookbooks/llm_guardrails
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- TypeSafe AI docs: Pre-parsed value extraction. https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md

License: CC BY 4.0 · https://github.com/Haple/system-one
