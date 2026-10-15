# Judgments as data

At a fraction of a cent per answer, judgments stop being calls you make and become data you keep: columns you can sort, filter, weight and train on. Here is a study that coded half a million police narratives for $25, a loop that turned tasting notes into features for a classic model, and why cheaper judgment will mean much more of it.

## Key ideas

- Ask once, store the answers, and reuse them: changing a weight or a filter doesn't need another model call.
- Whole corpora are now affordable: a study screened 499,500 police narratives for $25 and coded 195,857 with 27 questions for $30.
- Judgments make great features: questions turned wine notes into 67 numeric columns, and a classic model beat every baseline.
- With labels, let the data choose the questions: an autoresearch loop proposes questions and keeps the ones that cut error.
- Cheaper judgment means more judgment, which is why TypeSafe named Jev after Jevons.

## Practices for agents

- Store raw per-question answers (probabilities, model ID, date) as data, and recompute composites in code when weights change.
- Before coding a large corpus, run a lean screening schema first and the full schema only where it applies.
- When you have labels, use decision-model answers as features for a classic model, and keep only questions that improve held-out error.
- Estimate cost per 1,000 items from measured token counts before launching a big run.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/judgments-as-data.md
Video: https://learn-system-one.pages.dev/lessons/judgments-as-data/
