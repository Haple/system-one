# Lesson 11: Automate the sure ones

> You don't need a model that is right about everything. You need to know which answers you can trust. Here is the coverage curve that answers 'how much can we automate at 95%?', how to pick thresholds from a few hundred labels, what confidence-ordered review saves on our own data, and how to answer less precisely instead of wrongly.

Course: System One (https://learn-system-one.pages.dev/) · Module 3: Probabilities you can act on · 4 min · Watch: https://learn-system-one.pages.dev/lessons/selective-automation/

## Key takeaways

- The real question is: what share of decisions can we automate at the accuracy we need?
- A coverage curve answers it: on our banking data, Jev was 80% right overall, but 96% right on the half it was surest about.
- Pick thresholds from 200 to 500 labeled examples by simulating each cutoff; treat the result as an estimate.
- Reviewing the least confident answers first reached 95% system accuracy with 33% human review, versus 75% for random review.
- When unsure, answer less precisely: falling back to a broader category turned 40% right into 70% right in TypeSafe's SEC example.

## Practices for coding agents

- Build a coverage table (threshold, share automated, accuracy) from labeled examples before choosing a threshold.
- Route the least confident answers to people first, and size the review queue from the coverage table.
- When a taxonomy is hierarchical, return the parent category instead of a guess when confidence is low.
- For rare positive classes, judge thresholds by precision and recall on the flagged items, not overall accuracy.

## Lesson transcript


### Intro (0:01)

No model is right about everything. But you don't need that. You need to know which of its answers you can trust, and send the rest somewhere else. That's selective automation.

### The real question (0:13)

On launch day, a Hacker News commenter asked the question that matters. Set a confidence threshold, trust the decisions above it, reject the rest. Then ask: what percent of decisions can we automate, and still hit ninety percent accuracy?

### The coverage curve (0:29)

Here's that answer for Jev on our 3,080 banking messages. Automate everything, and it's eighty percent right. Only automate answers above point nine, and you handle sixty nine percent of messages at ninety two percent. Above point nine nine: half of all messages, at ninety six percent. To hit ninety five, you can automate about fifty seven percent.

### Picking a threshold (0:53)

How do you find your curve? Shreya Shankar, who researches LLM pipelines, uses a simple recipe. Take a sample of real examples; she uses five hundred. Label them. Run the model and record its probabilities. Then simulate every cutoff, and pick the one that meets your accuracy target with the most automation. It's an estimate from a sample, so leave some margin.

### Review the doubtful first (1:18)

Probabilities also tell people where to look. Suppose reviewers fix every answer they check. To get the whole system to ninety five percent, reviewing a random sample means checking three out of every four messages. Reviewing the least confident first, it's one in three.

### Ranking beats accuracy (1:36)

Which means the property that matters most isn't raw accuracy. It's whether wrong answers come with low probability. One independent test on the same banking set found a fine tuned model whose accuracy moved by under a point, while the share it could handle on its own jumped from sixty four to ninety two in a hundred.

### Answer less precisely (1:57)

There's another option besides asking a person: answer less precisely. TypeSafe classified sixty company filings into seventy five industry groups. Where the model was sure, it was right twenty seven times out of thirty. Where it wasn't, only twelve. But reporting those uncertain ones at the broader division level took them to seventy percent. Same request, no second call.

### Honest uncertainty (2:21)

This is the deeper point of the whole module. The TypeSafe docs put it plainly: if an intelligent system, whether human or machine, cannot express honest uncertainty, the system cannot be trusted. I don't know is a feature. Build paths for it.

### Rare cases (2:39)

One trap. When the thing you're looking for is rare, accuracy lies. If one percent of messages report fraud, a rule that never flags anything is ninety nine percent accurate, and useless. For rare classes, judge thresholds by precision and recall on the flagged items, and count how many a person must read.

### Quick check (3:02)

**Quiz:** ≥ 0.95 covers 60% of traffic at 97%. Target is 95%. The other 40%?
A. Automate them too; the average is still fine
B. Route them to review, least confident first, or answer them less precisely
C. Drop them
D. Lower the threshold until everything is automated
Answer: B. Automate the sure 60%. Send the rest to people (least confident first) or to a coarser answer, and re-measure as traffic changes.


### Try it (3:20)

Try it. Have your agent build a coverage table for one of your decisions, and turn it into a threshold and a review budget.

```text
Using 300 labeled examples of one decision, run the model and record the probability of its answer. For thresholds 0, 0.5, 0.7, 0.8, 0.9, 0.95,
0.99, print: share automated, accuracy on the automated share, and how many items per day would go to review at our current volume. Recommend the threshold that meets a 95% target with the most automation, and explain the margin you left. If there's a parent category, also report accuracy when unsure answers fall back to it.
```


### Recap (3:28)

So: ask how much you can automate at the accuracy you need, and read it off a coverage curve built from your own labels. Review the doubtful first. Answer less precisely when you can. And watch out for rare classes. That's module three. Next: composing many small judgments.

## Sources

- Hacker News commenters: Hacker News: Introducing System One Models and Jev. https://news.ycombinator.com/item?id=49717558
- TypeSafe AI docs: Classification using confidence. https://docs.typesafe.ai/cookbooks/classification_using_confidence
- TypeSafe AI docs: Confidence. https://docs.typesafe.ai/confidence
- Hamel Husain: How to Cut Your LLM Classification Costs by 90% (at 9:40). https://www.youtube.com/watch?v=FWFjLF_VoVI&t=580s
- Model Fatigue: We tested JevBench's top three against Jev on 3,080 bank messages (at 6:49). https://www.youtube.com/watch?v=nyl9IQbk5Zk&t=409s
- jaredpalmer/kev: jaredpalmer/kev: Jev-like family of decision models built on top of Qwen3.5/3.8 you can train and run on…. https://github.com/jaredpalmer/kev
- Geifman, El-Yaniv: Selective Classification for Deep Neural Networks. https://arxiv.org/abs/1705.08500
- Kevin David Hayes: Pinocchio: Fast Uncertainty Estimates for Black-Box Language Models. https://arxiv.org/html/2609.24881
- Amir Rafe amir rafe edu: Calibrated Decisions at Scale: Converting Police Crash Narratives into Probabilistic Crash Variables with…. https://arxiv.org/html/2609.24052
- Emil Lindfors: An early-access test of TypeSafe's Jev: calibrated judgments for half a cent. https://lindfors.no/blog/a-first-look-at-typesafes-jev/

License: CC BY 4.0 · https://github.com/Haple/system-one
