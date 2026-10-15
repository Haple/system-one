# Lesson 5: Noul: the probability of yes

> The simplest decision is yes or no. A Noul returns the probability that the answer is yes, and that single number carries both the answer and the doubt. Here is how to read it, where to put thresholds, why 0.5 never means medium, and how to phrase yes/no questions the model can't misread.

Course: System One (https://learn-system-one.pages.dev/) · Module 2: Asking good questions · 4 min · Watch: https://learn-system-one.pages.dev/lessons/noul-yes-no-questions/

## Key takeaways

- A Noul returns one number: the probability that the answer is yes. Near 1 is a strong yes, near 0 a strong no, near 0.5 means it can't tell.
- 0.5 is not 'medium'. If you need a degree, use a Score with described levels.
- Thresholds live in your code and depend on the cost of each mistake; values in the middle can go to a person.
- One condition per question, phrased so a high value means yes, with the exact condition spelled out.
- Short, plain questions beat long qualified ones; keep the fine print in your code.

## Practices for coding agents

- Use a Noul for a clean yes/no condition; use a Score when the answer is a degree.
- Write one condition per Noul and phrase it so a high probability means yes; avoid negations.
- Threshold Noul values in code, with a review band in the middle sized by the cost of errors.
- Add true/false criteria when the boundary is subtle, and keep questions short and literal.

## Lesson transcript


### Intro (0:01)

The simplest decision is yes or no. In Jev it's called a Noul, short for Bernoulli. You ask a yes or no question, and you get back one number. Let's learn to read it, and to write questions it can't misread.

### Reading a Noul (0:16)

Here's one question, is the customer asking for a human agent, asked about six messages. Thanks, that fixed it: point oh three, a strong no. I need this sorted today: point two six, urgent but not asking for a person. Are you a bot: point three six, a hint without a request. And the last one is a clear yes at point nine nine.
So the number is the answer and the certainty at once. That's why a Noul has no separate confidence field. And it means point five is not medium. Point five means the model gives yes and no the same chance. It can't tell.

### Degree needs a Score (0:57)

If you actually want a degree, ask for one. Is the candidate strong in Python climbs from point oh three to point nine two, but the spacing between candidates means nothing you chose. A Score with four described levels puts each candidate on your scale: no experience, some familiarity, regular use, deep expertise.

### Thresholds live in code (1:19)

In code, you turn the probability into behavior with thresholds. A clear yes goes one way, a clear no the other, and anything in the middle goes to a person. The thresholds are yours, and they're one line to change.

```python
p = answers["is_human_escalation"].noul

YES, NO = 0.8, 0.2           # yours to tune
if p >= YES:
    route_to_agent(ticket)   # clear yes
elif p <= NO:
    route_to_bot(ticket)     # clear no
else:
    send_to_review(ticket)   # can't tell
```

Where should the thresholds go? It depends on what a mistake costs. If acting on a false yes is expensive, like issuing a refund or paging someone at night, raise the bar. If missing a true yes is expensive, like a safety report, lower it. And the review band in the middle is your budget for human attention.

### Writing a good Noul (1:55)

Now, writing them. First, one condition per question. Is the customer angry and asking for a refund came back point oh eight for this furious customer. Split it, and you learn more: angry, point nine eight. Refund, point oh four. They want a fix, not their money back.
Three more rules. Phrase it so a high value means yes: does it contain personal data, not is it free of personal data. Your code will read it backwards someday. Avoid negations: AWS found that questions like which does this not fit often get answered as if the not weren't there. And say exactly what you mean: does the user want a human now, if now is what matters.

### Criteria for subtle boundaries (2:43)

When the boundary is subtle, add criteria: a short description of what counts as yes and what counts as no. Here, has the customer contacted us before scores point eight six on its own. With criteria that name prior attempts and tickets, it's a firmer point nine four.

### Keep it short (3:00)

And keep it short. Emil Lindfors tested this in early access. Rewriting his questions into long, carefully qualified instructions lowered agreement and tripled the calibration error, pushing answers toward the middle. His advice: write them the way you'd ask a colleague across the desk.

### Quick check (3:20)

**Quiz:** “Is this bug severe?” returns ≈0.5 on most tickets. Best fix?
A. Lower the threshold to 0.5
B. Average it over three calls
C. Ask about an exact condition, or use a Score with described levels
D. Add more context to the state
Answer: C. “Severe” has no boundary, so the model can't tell. Ask a checkable condition (“Does it block checkout?”) or measure degree with a Score.


### Try it (3:33)

Try it. Have your agent turn the yes or no decisions in your code into Nouls, with exact conditions, and thresholds in code.

```text
Find yes/no decisions we currently ask an LLM to make. For each, write a
Noul question: one condition, phrased so a high probability means yes, no negations, the exact condition spelled out. Add true/false criteria only where the boundary is subtle. Then add YES/NO thresholds in code, with a middle band that goes to human review, and explain each threshold by the cost of a false yes versus a missed yes.
```


### Recap (3:42)

So: a Noul is the probability of yes. Point five means can't tell, not medium. Thresholds live in code and follow the cost of mistakes. And one exact condition per question, phrased so high means yes. Next: when the answer is one of several options, the Choice.

## Sources

- TypeSafe AI docs: Noul. https://docs.typesafe.ai/primitives/noul
- TypeSafe AI docs: Primitives (Questions). https://docs.typesafe.ai/primitives
- Simon Willison: Jev introduces a new shape of LLM—System One, aka Decision Models. https://simonwillison.net/2026/Sep/21/jev/
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- Unsiloed AI: Document Review With Unsiloed and TypeSafe Jev. https://www.unsiloed.ai/blog/document-review-unsiloed-typesafe-jev
- Emil Lindfors: An early-access test of TypeSafe's Jev: calibrated judgments for half a cent. https://lindfors.no/blog/a-first-look-at-typesafes-jev/
- AWS Strands Labs: strands-decider: evaluation. https://github.com/strands-labs/strands-decider/blob/main/evaluation/README.md
- Hacker News commenters: Hacker News: Introducing System One Models and Jev. https://news.ycombinator.com/item?id=49717558
- Hamel Husain: Using LLM-as-a-Judge For Evaluation: A Complete Guide – Hamel’s Blog. https://hamel.dev/blog/posts/llm-judge/
- Hamel Husain: LLM Evals: Common Mistakes (at 12:48). https://www.youtube.com/watch?v=GL0XhAj5LPE&t=768s
- IndyDevDan: 10 Levels of Jev For Agentic Engineers (at 2:20). https://www.youtube.com/watch?v=_U-O5lYhJ7Q&t=140s

License: CC BY 4.0 · https://github.com/Haple/system-one
