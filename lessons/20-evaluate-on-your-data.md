# Lesson 20: Evaluate on your own data

> The only benchmark that matters is the one you ship. Here is the evaluation loop for decision models: real inputs, careful labels, per-question results, enough examples to trust a difference, and a regression test that pins the model version, with what we measured when Jev went from 1.13 to 1.14.

Course: System One (https://learn-system-one.pages.dev/) · Module 6: Shipping it · 4 min · Watch: https://learn-system-one.pages.dev/lessons/evaluate-on-your-data/

## Key takeaways

- Evaluate on real inputs from your own logs, labeled by people who know the domain; there is no way around labeling some data.
- Thirty examples can reveal your failure modes, but measuring accuracy takes hundreds: at 80% accuracy the margin is about ±14 points with 30 labels and ±4.5 with 300.
- Look per question, not just overall: one weak question can hide inside a good average.
- Test every change, even wording: in one test, more careful wording made agreement and calibration worse.
- Pin the model version; in our tests, Jev 1.14 put 6% fewer answers above 0.99, so the same threshold automated less.

## Practices for coding agents

- Build the eval set from real, recent inputs (stratified to include rare cases), labeled by domain experts with a written label guide.
- Report accuracy with its margin of error, per question, and include calibration and coverage at your target.
- Pin the exact model version and rerun the eval as a regression test on every change to questions, criteria, state or model.
- Rerun threshold tuning after any model upgrade before switching traffic.

## Lesson transcript


### Intro (0:01)

Every number in this course came from someone else's data, or ours. None of them is your data. This lesson is about getting the only numbers that count.

### Label some data (0:12)

Hamel Husain, who consults on AI evals, sees teams resist one step more than any other. There is no getting out of it: you have to label some data. It's the only way to build trust.

### The loop (0:26)

Here's the loop. Sample real inputs from your logs, not examples you made up, and include the rare cases on purpose. Have people who know the domain label them, with a written guide, and where two experts disagree, fix the guide first. Run the model and keep every probability. Then measure, fix the biggest failure, and run it again.

### How many labels? (0:49)

How many labels? Husain finds that around thirty examples is often when you stop discovering new kinds of failure. But thirty is far too few to measure accuracy. At eighty percent, the margin of error with thirty labels is plus or minus fourteen points. With three hundred, four and a half. With a thousand, two and a half.

### Per question (1:12)

Look at each question separately. A Better Stack test compared Jev and Clef on five questions about comments, against a Claude referee. Overall, Jev agreed eighty six percent of the time, Clef eighty three. But Clef won three of the five questions. The whole gap came from one question about tone, where Clef scored forty nine percent. It loves calling things neutral.

### Test every change (1:37)

Test every change, even wording. Emil Lindfors had Jev read Norwegian consultation letters about a salmon tax, first with short draft questions, then with careful ones, full of qualifiers about passing mentions and quotes. The careful version was worse. Agreement went down, and calibration error almost tripled, as answers drifted toward the middle. His advice: ask the way you'd ask a colleague across the desk, and keep the fine print in your code.

### Pin the version (2:09)

And pin the model version. When Jev one point fourteen came out, we reran both of our tests. Accuracy held, and calibration improved. But on the banking test, the share of answers at point nine nine or above fell from fifty to forty four percent. If your code auto-approves above point nine nine, the upgrade quietly sends six percent more of your traffic to people. Better model, different thresholds.

### Make it a test (2:36)

So make your eval a test. Pin the exact model. Keep a few hundred labeled, real inputs in the repository. And fail the build if accuracy, calibration or coverage at your target drops. Run it whenever a question, a criterion, the state or the model changes.

```python
MODEL = "jev-1.13.0"                 # pinned: never "latest"

def test_refund_decision():
    rows = load_jsonl("evals/refund_300.jsonl")   # real, expert-labeled
    res = run_decisions(MODEL, rows)             # keeps every probability
    assert accuracy(res) >= 0.90
    assert ece(res) <= 0.08
    assert coverage(res, target=0.95) >= 0.55     # share we can automate
```


### Quick check (2:55)

**Quiz:** On 30 labeled examples, model A scores 87%, model B 83%. Conclusion?
A. Model A is better; switch to it
B. Almost nothing: that's one example, inside a ±13-point margin
C. Model B is better calibrated
D. Average the two models
Answer: B. The difference is a single example. Thirty labels are good for finding failure modes, not for ranking models: label a few hundred, and compare per question.


### Try it (3:10)

Try it. Have your agent turn one of your decisions into a pinned regression eval.

```text
For our most important decision-model question, build a regression eval:
1. Sample 300 recent real inputs from logs (stratify so rare classes
   appear) and export them for expert labeling with a short label guide.
2. Pin the exact model version in one constant.
3. Write a test that reports accuracy with its 95% margin, per-question
   results, calibration error and coverage at our target, and fails if
   any drops below the current baseline.
4. Run it in CI on every change to questions, criteria, state or model.
```


### Recap (3:16)

So: label some data, from real inputs, with experts. Thirty labels find failures, hundreds measure them. Look per question. Test every change, even wording. And pin the version, because a better model can still move your thresholds. Next: deciding responsibly.

## Sources

- Hamel Husain: LLM Evals: Common Mistakes (at 5:53). https://www.youtube.com/watch?v=GL0XhAj5LPE&t=353s
- Lenny's Podcast: Why AI evals are the hottest new skill for product builders | Hamel Husain & Shreya Shankar. https://www.youtube.com/watch?v=BsWxPI9UM4c
- Emil Lindfors: An early-access test of TypeSafe's Jev: calibrated judgments for half a cent. https://lindfors.no/blog/a-first-look-at-typesafes-jev/
- Better Stack: Cloudflare Just Challenged Jev, So I Tested Their New Model (Clef) (at 4:21). https://www.youtube.com/watch?v=Uihz1NkhFM0&t=261s
- Ryan Porter: The OpenAI Decisions API Needs a Confidence You Can Trust | Anthus. https://anth.us/blog/openai-decisions-api-preview/
- IndyDevDan: 10 Levels of Jev For Agentic Engineers (at 28:30). https://www.youtube.com/watch?v=_U-O5lYhJ7Q&t=1710s
- TypeSafe AI: Lies, Damned Lies, and Benchmarks. https://typesafe.ai/blog/antibenchmaxxing
- JevBench authors: JevBench v1 (benchmark for Jev-class typed decision models). https://github.com/doxanocap/jevbench
- Connor Frank: An Independent Evaluation of TypeSafe's Jev | Vals AI. https://www.vals.ai/blogs/independent-evaluation-of-jev
- Amir Rafe amir rafe edu: Calibrated Decisions at Scale: Converting Police Crash Narratives into Probabilistic Crash Variables with…. https://arxiv.org/html/2609.24052
- Hamel Husain: Using LLM-as-a-Judge For Evaluation: A Complete Guide – Hamel’s Blog. https://hamel.dev/blog/posts/llm-judge/

License: CC BY 4.0 · https://github.com/Haple/system-one
