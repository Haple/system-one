# Lesson 7: Score: a position on a scale you describe

> A Score places the state on ordered levels you describe and returns a position that can fall between them. Here is how the number is computed, why levels must describe situations rather than degrees, why one Score should measure one thing, and how an extra top level separates the dangerous cases.

Course: System One (https://learn-system-one.pages.dev/) · Module 2: Asking good questions · 4 min · Watch: https://learn-system-one.pages.dev/lessons/score-questions/

## Key takeaways

- A Score returns a position along your levels: each level number times its probability, added up. It can land between levels.
- Describe situations, not degrees: 'workaround exists' gives the model something to match; '1' or 'moderate' doesn't.
- The same score can hide different shapes; read the probabilities and confidence, not just the number.
- One dimension per Score; split compound scales and combine the parts in code.
- Give a rare extreme case its own top level so it doesn't hide inside 'very bad'.

## Practices for coding agents

- Write every Score level as a concrete, self-contained situation; never use bare numbers or relative words like 'worse'.
- Keep each Score to one dimension; normalize scores (divide by the top level) before weighting them together.
- Add a separate top level for rare extremes that need different handling (abuse, outages, safety).
- Use the score to rank or threshold, not to reconstruct an exact quantity between levels.

## Lesson transcript


### Intro (0:01)

Some answers aren't yes or no, or one of a few categories. They're a position on a scale: how severe, how frustrated, how much experience. That's a Score.

### Reading a Score (0:13)

Three levels for bug severity: cosmetic, broken but there's a workaround, and blocking with no workaround. This bug crashes the page in Safari, but works in Chrome, and some customers only use Safari. The model puts point five six on workaround and point four four on blocking, so the position lands at one point four four.
The math is simple. Each level number, times its probability, added up. Zero times zero, plus one times point five six, plus two times point four four. One point four four. And confidence is low, point three four, because the model is torn between two levels.

### Describe situations (0:56)

Rule one: describe situations, not degrees. Each level is judged on its own, so a level called just two, or moderately severe, gives the model nothing to match. For a pixel-misaligned button, levels written as bare numbers scored point seven one, unsure. With described levels: zero point zero, at full confidence.

### One dimension (1:21)

Rule two: one dimension per Score. Rate a contractor on a scale from late, unskilled and rude to punctual, skilled and friendly. One who arrived on time, couldn't answer basic questions, and was very polite gets a confident Mixed. Which tells you nothing. Split it into three Scores, and you get on time, no skill, very polite.
This isn't just a model quirk. Decision researcher Olivier Sibony gives the same advice to human hiring panels: evaluate each criterion separately from the others, so one strong impression doesn't color the rest. Then combine them, which, for us, happens in code.

### Combine in code (2:04)

Before you combine Scores, normalize them. A four level scale runs from zero to three, a three level scale from zero to two. Divide each by its top level, so everything runs from zero to one. Now your weights mean what they say.

```python
a = response.answers
severity    = a["severity"].score / 2       # 3 levels: 0..2
frustration = a["frustration"].score / 2    # 3 levels: 0..2
quality     = a["report_quality"].score / 3 # 4 levels: 0..3

priority = 0.6 * severity + 0.3 * frustration + 0.1 * quality
```


### Room for the extreme (2:20)

Rule three: give the rare extreme its own level. On a calm, annoyed, very angry scale, a customer threatening your support team scores one point eight eight, right next to someone who's merely furious. Add a fourth level, abusive or threatening, and the threat lands at two point eight six, while ordinary anger stays at two.

### What a score is not (2:44)

And one warning from the Jev docs. A score is a position for ranking and thresholds, not a measurement. Don't interpolate it into an exact quantity. One point four four doesn't mean forty four percent of customers lack a workaround.

### Quick check (2:59)

**Quiz:** A 1-to-5 “reply quality” Score keeps landing near 3 with low confidence. Best fix?
A. Add more levels, say 1 to 10
B. Describe each level as a concrete situation, and split quality into separate dimensions
C. Average three runs
D. Switch to a Noul: “Is this reply good?”
Answer: B. Bare numbers give the model nothing to match, and “quality” bundles accuracy, tone and completeness. Describe situations and score each dimension separately.


### Try it (3:17)

Try it. Have your agent rewrite one rating in your product as well-built Scores.

```text
Find one place where we rate something on a scale (priority, quality, severity, risk). Rewrite it as Score questions:
- one dimension per Score; split compound scales
- every level a concrete, self-contained situation (no bare numbers)
- a separate top level for rare extremes that need different handling
Normalize each score by its top level, combine with explicit weights in code, and show 5 real examples with each score and the combined result.
```


### Recap (3:23)

So: a Score is a position, level times probability, added up. Describe situations, not degrees. One dimension per Score. Give the extreme its own level. And use the number to rank, not to measure. Next: the state, what you send the model to judge.

## Sources

- TypeSafe AI docs: Score. https://docs.typesafe.ai/primitives/score
- TypeSafe AI docs: Confidence. https://docs.typesafe.ai/confidence
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- OpenAI docs: Decisions (OpenAI API guide). https://developers.openai.com/api/docs/guides/decisions
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- Hamel Husain: LLM Evals: Common Mistakes (at 13:46). https://www.youtube.com/watch?v=GL0XhAj5LPE&t=826s
- Hamel Husain: Using LLM-as-a-Judge For Evaluation: A Complete Guide – Hamel’s Blog. https://hamel.dev/blog/posts/llm-judge/
- CFA Institute: Olivier Sibony: How can you overcome noise and bias in decision making? (at 14:50). https://www.youtube.com/watch?v=wiYaXOGE_e4&t=890s

License: CC BY 4.0 · https://github.com/Haple/system-one
