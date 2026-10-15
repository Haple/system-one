# Lesson 21: Decide responsibly

> A decision model makes the same call the same way, millions of times. That removes noise, and it makes any bias systematic. Here is how to audit decisions about people (including the name-swap test we ran), where the reasons come from when the model gives none, and what a responsible deployment logs, samples and leaves to a person.

Course: System One (https://learn-system-one.pages.dev/) · Module 6: Shipping it · 4 min · Watch: https://learn-system-one.pages.dev/lessons/responsible-decisions/

## Key takeaways

- Decision models have little noise, so their mistakes are systematic: the same error, for the same kind of case, every time.
- Bias can hide in a criterion as well as in a model: the Apgar score's skin-color item gives Black newborns lower scores.
- Audit by subgroup and with counterfactual tests; in our name-swap test, answers moved at most 0.06 and no decision flipped, which is one test, not proof of fairness.
- The model gives numbers, not reasons; your decomposed questions and thresholds are the reasons, so log them and turn them into explanations.
- Keep a person accountable: sample automated decisions for review, give people a way to appeal, and be most careful with decisions about jobs, money, housing and health.

## Practices for coding agents

- Before automating decisions about people, run counterfactual tests (swap names and other attributes that must not matter) and compare outcomes by subgroup on labeled data.
- Log every decision with input reference, model version, every answer, thresholds and the action taken, and generate explanations from that log.
- Sample a share of automated decisions for human review every week, and provide an appeal path to a person.
- Use decision models to assist, not decide alone, for hiring, credit, housing and health, and check the rules that apply where you operate.

## Lesson transcript


### Intro (0:01)

A decision model will make the same call the same way, a million times a day. That's its strength. It's also why some of those calls deserve extra care.

### Noise and bias (0:12)

Olivier Sibony and Daniel Kahneman separate two kinds of error. Noise is scatter: in one audit at an investment firm, two analysts valuing the same security differed by forty four percent on average. Bias is a shared, predictable error. Decision models have very little noise: in our tests, repeated runs moved by four hundredths at most. So whatever errors they have are systematic. The same mistake, for the same kind of case, every time.

### Decisions about people (0:43)

That matters most when the decision is about a person. Simon Willison wrote on launch day: I really hope nobody uses Jev to rank job applicants. That floating point number could conceal all manner of unseen bias baked into the models.

### Bias in the criteria (0:59)

And bias doesn't only live inside models. It can live in your criteria. Remember the Apgar score from lesson twelve? One of its five items is skin color. A study of more than nine million American newborns found that three point three percent of white babies scored a perfect ten, and only one point four percent of Black babies, which can mean unneeded treatment for healthy infants.

### Test it (1:24)

So test it, with counterfactuals. Change only what must not matter, and see if the answer moves. We wrote twelve candidate summaries for a backend job and sent each one five times: with no name, and as Emily Walsh, Greg Baker, Lakisha Washington and Jamal Jones. The average chance of an interview barely moved. No single answer moved by more than point oh six, and no decision flipped.
That's reassuring, and it proves very little. It's one test, of one attribute, on twelve made-up people. Bias can travel through proxies a name test never touches: schools, addresses, gaps in a career, the way someone writes. As Willison's advice goes, a model like this needs more evals, not fewer. Test by subgroup on real, labeled cases too.

### Where the reasons come from (2:18)

People also ask for reasons. Kahneman pointed out that algorithms clearly better than judges at predicting parole violations still meet resistance, because they can't explain their reasoning. A decision model gives you numbers, not reasons. But your design has them. Unsiloed put it simply: the explanations come from our application. Jev returns the typed answers.
So log the reasons you designed. Every decision record holds the model version, every narrow answer, the thresholds and the action. That's an audit trail. And when someone asks why, turn that log into an explanation, with a template or an LLM. The decision stays in your code; only the wording is generated.

```python
log.write({
  "case": ticket.id, "model": "jev-1.13.0", "at": now(),
  "answers": {"duplicate_charge": 0.98, "policy_allows": 0.99},
  "rule": "refund if both > 0.80", "action": "auto_refund",
  "review_sample": random() < 0.02,             # a person checks 2%
})
explain = explain_from(log)   # a template or an LLM: wording only
```


### Keep a person accountable (3:04)

And keep a person accountable. Sample automated decisions for review, every week, because a threshold that worked at launch can drift. Give people a way to appeal to a human. Audit outcomes by subgroup. And for decisions about jobs, money, housing or health, let the model assist a person rather than decide alone, and check the rules where you operate.

### Quick check (3:29)

**Quiz:** A name-swap test changes no decisions. What can you conclude?
A. The model is fair; ship it
B. Names alone didn't move these cases; proxies and real subgroups still need testing
C. The test was broken
D. Bias only matters for LLMs
Answer: B. A counterfactual test checks one path for bias. Proxies like schools or addresses, and outcomes on real labeled cases by subgroup, still need checking.


### Try it (3:40)

Try it. Have your agent add a decision log and a counterfactual test to one decision that touches people.

```text
For one decision in our product that affects a person (approvals, refunds, moderation, screening):
1. Log every decision: input reference, model version, every answer,
   thresholds, action, and a flag that sends 2% to human review.
2. Generate a plain-language explanation from that log.
3. Write a counterfactual test: for 20 real cases, swap attributes that
   must not matter (names, pronouns, locations) and report the largest
   change in each answer and any decision that flips.
```


### Recap (3:47)

So: decision models trade noise for systematic error. Bias can sit in models and in criteria, so test with counterfactuals and by subgroup, and don't treat one pass as proof. Your questions are the reasons: log them. And keep a person accountable. Next, the capstone: putting the whole course together.

## Sources

- Simon Willison: Jev introduces a new shape of LLM—System One, aka Decision Models. https://simonwillison.net/2026/Sep/21/jev/
- Sebastien Dubois: Jev and System One models - a semantic if statement for your code. https://www.dsebastien.net/jev-and-system-one-models-a-semantic-if-statement-for-your-code/
- CFA Institute: Olivier Sibony: How can you overcome noise and bias in decision making? (at 8:44). https://www.youtube.com/watch?v=wiYaXOGE_e4&t=524s
- Robinson's Podcast Clips: Decision Hygiene for Reducing Bias and Noise in Judgment | Daniel Kahneman & Robinson Erhardt (at 5:27). https://www.youtube.com/watch?v=zt2cFBC8hdw&t=327s
- Authority control databases International GND FAST National United States Israel Other Yale LUX: Apgar score - Wikipedia. https://en.wikipedia.org/wiki/Apgar_score
- Lex Fridman: Daniel Kahneman: Thinking Fast and Slow, Deep Learning, and AI | Lex Fridman Podcast #65 (at 37:22). https://www.youtube.com/watch?v=UwwBG-MbniY&t=2242s
- IBM Technology: Building Decision Agents with LLMs & Machine Learning Models (at 19:50). https://www.youtube.com/watch?v=mRkJTXDromw&t=1190s
- Unsiloed AI: Document Review With Unsiloed and TypeSafe Jev. https://www.unsiloed.ai/blog/document-review-unsiloed-typesafe-jev
- Hamel Husain: LLM Evals: Common Mistakes (at 26:26). https://www.youtube.com/watch?v=GL0XhAj5LPE&t=1586s
- TypeSafe AI docs: Parallel questions. https://docs.typesafe.ai/cookbooks/parallel_questions

License: CC BY 4.0 · https://github.com/Haple/system-one
