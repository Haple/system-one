# Score: a position on a scale you describe

A Score places the state on ordered levels you describe and returns a position that can fall between them. Here is how the number is computed, why levels must describe situations rather than degrees, why one Score should measure one thing, and how an extra top level separates the dangerous cases.

## Key ideas

- A Score returns a position along your levels: each level number times its probability, added up. It can land between levels.
- Describe situations, not degrees: 'workaround exists' gives the model something to match; '1' or 'moderate' doesn't.
- The same score can hide different shapes; read the probabilities and confidence, not just the number.
- One dimension per Score; split compound scales and combine the parts in code.
- Give a rare extreme case its own top level so it doesn't hide inside 'very bad'.

## Practices for agents

- Write every Score level as a concrete, self-contained situation; never use bare numbers or relative words like 'worse'.
- Keep each Score to one dimension; normalize scores (divide by the top level) before weighting them together.
- Add a separate top level for rare extremes that need different handling (abuse, outages, safety).
- Use the score to rank or threshold, not to reconstruct an exact quantity between levels.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/score-questions.md
Video: https://learn-system-one.pages.dev/lessons/score-questions/
