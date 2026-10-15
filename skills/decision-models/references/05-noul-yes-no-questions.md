# Noul: the probability of yes

The simplest decision is yes or no. A Noul returns the probability that the answer is yes, and that single number carries both the answer and the doubt. Here is how to read it, where to put thresholds, why 0.5 never means medium, and how to phrase yes/no questions the model can't misread.

## Key ideas

- A Noul returns one number: the probability that the answer is yes. Near 1 is a strong yes, near 0 a strong no, near 0.5 means it can't tell.
- 0.5 is not 'medium'. If you need a degree, use a Score with described levels.
- Thresholds live in your code and depend on the cost of each mistake; values in the middle can go to a person.
- One condition per question, phrased so a high value means yes, with the exact condition spelled out.
- Short, plain questions beat long qualified ones; keep the fine print in your code.

## Practices for agents

- Use a Noul for a clean yes/no condition; use a Score when the answer is a degree.
- Write one condition per Noul and phrase it so a high probability means yes; avoid negations.
- Threshold Noul values in code, with a review band in the middle sized by the cost of errors.
- Add true/false criteria when the boundary is subtle, and keep questions short and literal.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/noul-yes-no-questions.md
Video: https://learn-system-one.pages.dev/lessons/noul-yes-no-questions/
