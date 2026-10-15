# Confidence and thresholds

The answer tells you what; the probability tells you whether to act. Here is the three-path pattern (act, confirm, escalate), why thresholds should differ by action, a one-line formula that turns the cost of mistakes into a threshold, and the one thing thresholds cannot protect you from.

## Key ideas

- Use probability as a second axis: the answer says what to do, the probability says whether to do it now.
- Three paths: act automatically, ask to confirm, or escalate to a person or a slower model.
- Thresholds belong to actions, not to the model: a read-only action can go at 0.6, a money transfer may need 0.85 and a confirmation.
- With calibrated probabilities, act when p exceeds cost of a false action ÷ (cost of a false action + cost of a missed one).
- Confidence can't flag inputs the model doesn't understand at all; check that inputs are in scope before you trust the number.

## Practices for agents

- Gate every automated action on its own threshold, set by the cost of acting wrongly versus missing a true case.
- Keep thresholds as named constants in code with a comment explaining their cost reasoning, and log the probability with each action.
- Send the middle band to confirmation or human review instead of guessing.
- Detect out-of-scope inputs (wrong language, unknown domain) before the decision, because confidence will not catch them.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/confidence-thresholds.md
Video: https://learn-system-one.pages.dev/lessons/confidence-thresholds/
