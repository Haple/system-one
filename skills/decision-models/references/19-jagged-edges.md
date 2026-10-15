# Know the jagged edges

Decision models are strong at semantic judgment and unreliable at things a calculator does. Here are the failure modes we reproduced (counting, arithmetic, dates), TypeSafe's own list of nine, the cases where the model is wrong without sounding unsure, and the rule that fixes most of them: reason in code, decide with the model.

## Key ideas

- Decision models are jagged: excellent at meaning, unreliable at counting, arithmetic and date comparison.
- In our tests, one counting question got 5 fruits instead of 6; twelve per-item Nouls summed in code got it right.
- On a wrong invoice total and a late payment, the model hedged at 0.43 and 0.47: honest, but code answers exactly.
- Typed output can't be malformed, but it can still be wrong, sometimes with confidence.
- Don't ask for counts, sums, date math, forecasts of real-world outcomes, or long reasoning chains; reason in code and decide with the model.

## Practices for agents

- Never ask a decision model to count, add, compare numbers or compare dates; extract the parts and compute in code.
- For semantic counting, ask one Noul per item and sum in code.
- Write the exact condition in the instructions; when you find yourself explaining what you meant, add that to the question.
- Test each new question on known hard cases (negations, look-alike options, adversarial text) before shipping.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/jagged-edges.md
Video: https://learn-system-one.pages.dev/lessons/jagged-edges/
