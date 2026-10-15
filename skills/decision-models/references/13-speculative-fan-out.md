# Ask everything at once

Questions about the same state belong in one request: they are evaluated in parallel and independently, so extra questions add a few tokens and almost no time. Here is what we measured with 13 questions, why you should ask speculative questions you might not need, and the few cases where a second request is genuinely warranted.

## Key ideas

- Every question in a request sees the same state and is evaluated independently and in parallel.
- In our test, 13 questions in one request took 0.27 seconds and 1,828 tokens; 13 separate requests took 3.3 seconds and 18,940 tokens, with the same answers.
- Ask speculative questions: everything your code might need, including ones that only matter on some branches, and let code ignore the rest.
- A second request is warranted only when an earlier answer changes the state or the options of the next question.
- Coding agents tend to write one question per call; check their integrations for this.

## Practices for agents

- Batch every question about the same state into one request, including speculative ones for later branches.
- Split into a second request only when the next question's state or options depend on an earlier answer.
- Review agent-written integrations for one-question-per-call loops and merge them.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/speculative-fan-out.md
Video: https://learn-system-one.pages.dev/lessons/speculative-fan-out/
