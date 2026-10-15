# How a decision model works

A language model writes its answer one token at a time. A decision model reads your state once and scores every allowed answer in a single pass. Here is the core trick in a few lines of Python, what production models add on top (trained readout heads, shared state, calibration training), and why typed output is not the same as a correct answer.

## Key ideas

- An LLM's answer costs one sequential pass per output token; a decision model scores all allowed answers in one pass.
- The core trick: read the model's probability for each allowed option instead of generating text, then normalize.
- Production decision models add a trained readout head, shared state across questions, and training aimed at calibrated probabilities.
- Because it only scores the options you supplied, it can never return a value outside your schema.
- Typed is not the same as correct: a decision model can still be confidently wrong. That is why probabilities and calibration matter.

## Practices for agents

- Treat a decision model's output as a probability distribution over your options, not as a fact.
- Never assume 'cannot return an invalid value' means 'cannot be wrong'; gate risky actions on probability and test on your data.
- Keep the set of allowed answers complete, including a none-of-the-above option when inputs can fall outside it.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/how-decision-models-work.md
Video: https://learn-system-one.pages.dev/lessons/how-decision-models-work/
