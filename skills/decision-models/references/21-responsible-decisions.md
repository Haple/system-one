# Decide responsibly

A decision model makes the same call the same way, millions of times. That removes noise, and it makes any bias systematic. Here is how to audit decisions about people (including the name-swap test we ran), where the reasons come from when the model gives none, and what a responsible deployment logs, samples and leaves to a person.

## Key ideas

- Decision models have little noise, so their mistakes are systematic: the same error, for the same kind of case, every time.
- Bias can hide in a criterion as well as in a model: the Apgar score's skin-color item gives Black newborns lower scores.
- Audit by subgroup and with counterfactual tests; in our name-swap test, answers moved at most 0.06 and no decision flipped, which is one test, not proof of fairness.
- The model gives numbers, not reasons; your decomposed questions and thresholds are the reasons, so log them and turn them into explanations.
- Keep a person accountable: sample automated decisions for review, give people a way to appeal, and be most careful with decisions about jobs, money, housing and health.

## Practices for agents

- Before automating decisions about people, run counterfactual tests (swap names and other attributes that must not matter) and compare outcomes by subgroup on labeled data.
- Log every decision with input reference, model version, every answer, thresholds and the action taken, and generate explanations from that log.
- Sample a share of automated decisions for human review every week, and provide an appeal path to a person.
- Use decision models to assist, not decide alone, for hiring, credit, housing and health, and check the rules that apply where you operate.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/responsible-decisions.md
Video: https://learn-system-one.pages.dev/lessons/responsible-decisions/
