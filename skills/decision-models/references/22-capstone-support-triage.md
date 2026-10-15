# Capstone: a support triage pipeline

The whole course in one pipeline you can run: code prepares the state, one request asks fifteen questions, and code routes every ticket to a refund, a reset link, an LLM, a log, a person or a block. Here is how we built it, the three bad questions our first run exposed, what held-out tickets showed, and why twelve out of twelve still proves less than it sounds.

## Key ideas

- The pipeline: code prepares (redacts cards, lists candidate orders), one request asks 15 questions, code decides and logs.
- The model judges meaning; code checks facts: a refund needs the model to hear a duplicate charge and the records to show one, under the $100 limit.
- Our first run routed 14 of 24 tickets right; three badly written questions caused every miss.
- After fixing them, 24 of 24, and 12 of 12 on tickets written before the fix; 16 of 36 needed no person.
- Twelve out of twelve still allows a true error rate up to about 25%: evaluate on hundreds of real tickets before trusting it.

## Practices for agents

- Split compound questions and describe the company or domain in the state so the model can judge scope.
- Write contrastive criteria for any question that a normal request could trip, such as injection checks.
- Write held-out test cases before fixing questions, and score fixes only on those.
- Require both the model's judgment and an exact code check before any automated action that moves money.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/capstone-support-triage.md
Video: https://learn-system-one.pages.dev/lessons/capstone-support-triage/
