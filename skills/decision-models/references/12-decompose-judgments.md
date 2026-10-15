# Decompose: many small questions

TypeSafe calls it the most important concept in its guide: break one broad judgment into narrow questions and combine the answers in code. Here is what decomposition buys you (reasons, control, per-signal thresholds), why decision science has recommended it for seventy years, and the case where it made things worse.

## Key ideas

- A broad question hides several judgments behind one number; narrow questions expose them so you can inspect, tune and combine them.
- The broad answer is often right, but only the narrow ones tell you why: which signal fired, which tool argument was wrong.
- Combine in code: weighted sums for factors that trade off, separate hard rules for 'any serious violation'.
- Decision science agrees: simple formulas over separately judged criteria beat holistic judgment (Meehl, Dawes, Kahneman, the Apgar score).
- Decomposition is not magic: it can't turn a System Two problem into System One answers, so validate the combination on labeled data.

## Practices for agents

- Split broad judgments into narrow, independent questions, each a few-second call for an expert; ask them in one request.
- Combine answers in code with explicit weights or rules; keep the raw per-question answers for debugging and explanations.
- Use separate conditions for veto rules instead of letting a weighted sum average a serious violation away.
- Check on labeled data that the decomposed version actually beats the single question before switching.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/decompose-judgments.md
Video: https://learn-system-one.pages.dev/lessons/decompose-judgments/
