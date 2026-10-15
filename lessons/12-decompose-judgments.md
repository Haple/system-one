# Lesson 12: Decompose: many small questions

> TypeSafe calls it the most important concept in its guide: break one broad judgment into narrow questions and combine the answers in code. Here is what decomposition buys you (reasons, control, per-signal thresholds), why decision science has recommended it for seventy years, and the case where it made things worse.

Course: System One (https://learn-system-one.pages.dev/) · Module 4: Composing judgments · 4 min · Watch: https://learn-system-one.pages.dev/lessons/decompose-judgments/

## Key takeaways

- A broad question hides several judgments behind one number; narrow questions expose them so you can inspect, tune and combine them.
- The broad answer is often right, but only the narrow ones tell you why: which signal fired, which tool argument was wrong.
- Combine in code: weighted sums for factors that trade off, separate hard rules for 'any serious violation'.
- Decision science agrees: simple formulas over separately judged criteria beat holistic judgment (Meehl, Dawes, Kahneman, the Apgar score).
- Decomposition is not magic: it can't turn a System Two problem into System One answers, so validate the combination on labeled data.

## Practices for coding agents

- Split broad judgments into narrow, independent questions, each a few-second call for an expert; ask them in one request.
- Combine answers in code with explicit weights or rules; keep the raw per-question answers for debugging and explanations.
- Use separate conditions for veto rules instead of letting a weighted sum average a serious violation away.
- Check on labeled data that the decomposed version actually beats the single question before switching.

## Lesson transcript


### Intro (0:01)

If you remember one technique from this course, make it this one. Don't ask one big question. Ask several small ones, and combine the answers in code.

### Small questions (0:12)

Take spam. You could ask one question: is this message spam? Point nine seven. Fine, but why? Split it into narrow questions instead. Does it ask for a password? Point nine nine. Does it promise an unexpected reward? Point nine seven. Does it pressure you to act fast? Point nine eight. Does the sender's name clash with their domain? Point seven two. Now combine them in code, with weights you control.
The TypeSafe guide is blunt about it. This is probably the most important concept in this guide. Broad questions hide several judgments behind one answer. Atomic questions expose those judgments, so you can inspect, tune, and combine them in code.

### Reasons, not just verdicts (0:59)

Here's where it pays off. An agent was asked for tomorrow's weather in Seattle, in Fahrenheit. Ask the broad question, are these tool calls correct, and you get point one. Something's wrong, but what? Ask six narrow questions, and five come back near one. One doesn't: does the unit match the request? Point oh two. The agent asked for Celsius.
Simon Willison worried, when Jev launched, that it's a black box. If it marks something as spam, which signals tipped it off? Decomposition is the answer. Each narrow question is a reason you can log, show to a reviewer, and test on its own.

### Combine in code (1:40)

Then combine them in code. For factors that trade off against each other, use a weighted sum. But don't let a weighted sum average away a serious violation. If a message asks for credentials, that should block it on its own, whatever else is true. Rules and weights both live in your code.

```python
a = {k: v.noul for k, v in response.answers.items()}

if a["requests_credentials"] > 0.9:      # a veto, not a weight
    return quarantine(msg, reason="asks for credentials")

risk = (0.45 * a["offers_unexpected_reward"]
        + 0.30 * a["sender_identity_mismatch"]
        + 0.25 * a["creates_time_pressure"])
if risk > 0.6:
    return quarantine(msg, reason=top_signals(a))
```


### Seventy years of evidence (2:00)

This isn't new. Since Paul Meehl's work in the 1950s, study after study has found that simple mechanical rules beat expert intuition at many prediction tasks. As decision researcher Olivier Sibony puts it: even the simplest rule will typically make fewer mistakes than the humans who think they are much smarter than the simple rule.
The classic example is the Apgar score, from 1952. Instead of a doctor's overall impression of a newborn, five quick judgments: appearance, pulse, grimace, activity, breathing. Each zero to two, added up. Seven or more is normal. Three or below means act now. Narrow judgments, a sum, and bands for action. That's the pattern.

### Where it fails (2:48)

But decomposition is not magic. Mike Ramos tested Jev on poker decisions, where the right move depends on game theory. Six narrow judgments instead of one question changed forty seven actions. Twelve got better. Twenty one got worse. Poker strategy is a System Two problem, and splitting it into fast judgments didn't change that.

### Quick check (3:12)

**Quiz:** Policy: any threat of violence means removal. How do you encode it?
A. As one weight in a weighted risk score
B. As its own Noul with a hard rule in code that removes on its own
C. Ask one broad question: does this break the policy?
D. Average three runs of the broad question
Answer: B. A veto shouldn't be averaged away by other factors. Ask it as its own narrow question and enforce it with a separate rule in code.


### Try it (3:27)

Try it. Have your agent decompose one broad judgment in your code, and compare it with the original on labeled data.

```text
Pick one broad judgment we ask a model to make (spam, risk, quality, policy violation). Split it into 4-8 narrow questions, each a few-second judgment for an expert, asked in ONE request. Combine them in code: hard rules for vetoes, weights for factors that trade off. Then run both versions on 100 labeled examples and report accuracy, plus 5
examples where the narrow answers explain a decision the broad one got wrong (or right).
```


### Recap (3:35)

So: ask many small questions and combine them in code. You get reasons, not just verdicts, and control over weights and vetoes. Decision science has backed this for seventy years. But it's not magic: validate it on your data. Next: asking all those questions at once.

## Sources

- TypeSafe AI docs: How to build with TypeSafe. https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- TypeSafe AI docs: Composite scoring. https://docs.typesafe.ai/patterns/composite-scoring
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
- Simon Willison: Jev introduces a new shape of LLM—System One, aka Decision Models. https://simonwillison.net/2026/Sep/21/jev/
- CFA Institute: Olivier Sibony: How can you overcome noise and bias in decision making? (at 11:20, 9:44). https://www.youtube.com/watch?v=wiYaXOGE_e4&t=680s
- Talks at Google: Thinking, Fast and Slow | Daniel Kahneman | Talks at Google (at 18:35). https://www.youtube.com/watch?v=CjVQJdIrDJ0&t=1115s
- DailyData: Statistical Prediction Rules (SPRs) vs. Clinical experts (at 1:53). https://www.youtube.com/watch?v=7IgUcZBq1ec&t=113s
- Authority control databases International GND FAST National United States Israel Other Yale LUX: Apgar score - Wikipedia. https://en.wikipedia.org/wiki/Apgar_score
- Mike Ramos: Jev is the 🐠 at the poker table. https://backnotprop.com/blog/jev-poker/
- Sam Witteveen: Jev - The Ultimate Classification Model? (at 4:26). https://www.youtube.com/watch?v=X117w2Rark8&t=266s
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev

License: CC BY 4.0 · https://github.com/Haple/system-one
