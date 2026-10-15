# Lesson 18: Judgments as data

> At a fraction of a cent per answer, judgments stop being calls you make and become data you keep: columns you can sort, filter, weight and train on. Here is a study that coded half a million police narratives for $25, a loop that turned tasting notes into features for a classic model, and why cheaper judgment will mean much more of it.

Course: System One (https://learn-system-one.pages.dev/) · Module 5: Real systems · 4 min · Watch: https://learn-system-one.pages.dev/lessons/judgments-as-data/

## Key takeaways

- Ask once, store the answers, and reuse them: changing a weight or a filter doesn't need another model call.
- Whole corpora are now affordable: a study screened 499,500 police narratives for $25 and coded 195,857 with 27 questions for $30.
- Judgments make great features: questions turned wine notes into 67 numeric columns, and a classic model beat every baseline.
- With labels, let the data choose the questions: an autoresearch loop proposes questions and keeps the ones that cut error.
- Cheaper judgment means more judgment, which is why TypeSafe named Jev after Jevons.

## Practices for coding agents

- Store raw per-question answers (probabilities, model ID, date) as data, and recompute composites in code when weights change.
- Before coding a large corpus, run a lean screening schema first and the full schema only where it applies.
- When you have labels, use decision-model answers as features for a classic model, and keep only questions that improve held-out error.
- Estimate cost per 1,000 items from measured token counts before launching a big run.

## Lesson transcript


### Intro (0:01)

When a judgment costs a fraction of a cent, you stop thinking of it as a call. It becomes data: a column you compute once, store, and use in a hundred ways.

### Ask once, reuse (0:12)

The habit is simple. Store the raw answers: every probability, with the model version and the date. Then your weights, thresholds and filters are just code over a table. Change a weight and the ranking updates instantly, with no new model calls. One tester put it neatly: the judgments are cached, so rewriting the composition rules costs nothing.

```text
-- one row per item, one column per question (raw probabilities)
CREATE TABLE ticket_judgments (
  ticket_id TEXT, model TEXT, judged_at DATE,
  refund_requested REAL, duplicate_charge REAL,
  churn_threat REAL, frustration REAL);

-- change the weights any time: no new model calls
SELECT ticket_id,
  0.5*churn_threat + 0.3*frustration/2 + 0.2*duplicate_charge AS priority
FROM ticket_judgments ORDER BY priority DESC;
```


### Whole corpora (0:36)

That changes what's affordable. Texas has five million police crash narratives that analysts rarely read, because coding them with a frontier model is too expensive. A research team screened half a million of them with ten questions, for twenty five dollars. Then they coded almost two hundred thousand with twenty seven questions, for thirty dollars, with zero failed calls. The whole five million would cost about seven hundred seventy four.
Notice the two stages. A lean screen with ten presence questions runs over everything. The detailed twenty seven question schema only runs where the screen found something to code. The raw probabilities overstated how common things were, but once recalibrated on human labels, the review budget became a number: how many records a person would still need to read.

### Judgments as features (1:27)

Judgments also make great features for classic machine learning. A TypeSafe cookbook predicts a wine critic's score from the tasting note. Predicting the average gives an error of three point oh nine points. Word counts get two point four seven. Asking the decision model for the score directly, two point one five. But thirty eight narrow questions, fed as features to a CatBoost model, got it down to one point seven seven.

### Let the data pick the questions (1:54)

And nobody wrote those thirty eight questions by hand. An LLM proposed them, the decision model answered them for every row, and CatBoost reported which questions helped and which rows it still got wrong. The next round read that report and proposed better questions. Five rounds took the error from one point eight seven to one point seven seven. Trying a change costs no API calls, because the answers are already stored.

### Jevons (2:21)

Which brings us to the name. TypeSafe named Jev after William Stanley Jevons, who noticed in 1865 that more efficient steam engines made Britain burn more coal, not less. Their bet: every order of magnitude drop in the cost of intelligence unlocks orders of magnitude more uses. Whether that holds depends on demand, but it's the right way to think about judgments as data.

### Quick check (2:47)

**Quiz:** 10,000 tickets were scored with 6 questions last week. New priority weights today. What now?
A. Rescore all 10,000 tickets
B. Recompute the priority in code from the stored answers
C. Ask one new question per ticket
D. Retrain the decision model
Answer: B. The judgments didn't change, only how you combine them. If you stored the raw answers, a new weighting is a query, not a model call.


### Try it (3:02)

Try it. Have your agent turn one judgment in your product into a stored, reusable table.

```text
Pick one judgment we make about records (tickets, leads, reviews, documents). Create a table that stores the raw answer for each question (probabilities), the model ID and the date, keyed by record. Backfill
1,000 records in batches and report the measured cost per 1,000. Move the weighting and thresholds into a query or function over that table, and show that changing a weight needs no new model calls.
```


### Recap (3:08)

So: judgments are data. Store the raw answers with the model and date, and compute composites in code. Whole corpora are affordable now, so screen first, then code. Use judgments as features, and let the data pick the questions. That's module five. Next, module six: shipping it, starting with the jagged edges.

## Sources

- Amir Rafe amir rafe edu: Calibrated Decisions at Scale: Converting Police Crash Narratives into Probabilistic Crash Variables with…. https://arxiv.org/html/2609.24052
- TypeSafe AI docs: Autoresearch feature discovery. https://docs.typesafe.ai/cookbooks/autoresearch_feature_discovery
- TypeSafe AI docs: Composite scoring. https://docs.typesafe.ai/patterns/composite-scoring
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
- Emil Lindfors: An early-access test of TypeSafe's Jev: calibrated judgments for half a cent. https://lindfors.no/blog/a-first-look-at-typesafes-jev/
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Wikimedia Foundation, Inc.: Jevons paradox - Wikipedia. https://en.wikipedia.org/wiki/Jevons_paradox
- Mike Ramos: Jev is the 🐠 at the poker table. https://backnotprop.com/blog/jev-poker/
- Hacker News commenters: Hacker News: Introducing System One Models and Jev. https://news.ycombinator.com/item?id=49717558

License: CC BY 4.0 · https://github.com/Haple/system-one
