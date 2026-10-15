# Evaluate on your own data

The only benchmark that matters is the one you ship. Here is the evaluation loop for decision models: real inputs, careful labels, per-question results, enough examples to trust a difference, and a regression test that pins the model version, with what we measured when Jev went from 1.13 to 1.14.

## Key ideas

- Evaluate on real inputs from your own logs, labeled by people who know the domain; there is no way around labeling some data.
- Thirty examples can reveal your failure modes, but measuring accuracy takes hundreds: at 80% accuracy the margin is about ±14 points with 30 labels and ±4.5 with 300.
- Look per question, not just overall: one weak question can hide inside a good average.
- Test every change, even wording: in one test, more careful wording made agreement and calibration worse.
- Pin the model version; in our tests, Jev 1.14 put 6% fewer answers above 0.99, so the same threshold automated less.

## Practices for agents

- Build the eval set from real, recent inputs (stratified to include rare cases), labeled by domain experts with a written label guide.
- Report accuracy with its margin of error, per question, and include calibration and coverage at your target.
- Pin the exact model version and rerun the eval as a regression test on every change to questions, criteria, state or model.
- Rerun threshold tuning after any model upgrade before switching traffic.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/evaluate-on-your-data.md
Video: https://learn-system-one.pages.dev/lessons/evaluate-on-your-data/
