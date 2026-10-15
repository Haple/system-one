# Automate the sure ones

You don't need a model that is right about everything. You need to know which answers you can trust. Here is the coverage curve that answers 'how much can we automate at 95%?', how to pick thresholds from a few hundred labels, what confidence-ordered review saves on our own data, and how to answer less precisely instead of wrongly.

## Key ideas

- The real question is: what share of decisions can we automate at the accuracy we need?
- A coverage curve answers it: on our banking data, Jev was 80% right overall, but 96% right on the half it was surest about.
- Pick thresholds from 200 to 500 labeled examples by simulating each cutoff; treat the result as an estimate.
- Reviewing the least confident answers first reached 95% system accuracy with 33% human review, versus 75% for random review.
- When unsure, answer less precisely: falling back to a broader category turned 40% right into 70% right in TypeSafe's SEC example.

## Practices for agents

- Build a coverage table (threshold, share automated, accuracy) from labeled examples before choosing a threshold.
- Route the least confident answers to people first, and size the review queue from the coverage table.
- When a taxonomy is hierarchical, return the parent category instead of a guess when confidence is low.
- For rare positive classes, judge thresholds by precision and recall on the flagged items, not overall accuracy.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/selective-automation.md
Video: https://learn-system-one.pages.dev/lessons/selective-automation/
