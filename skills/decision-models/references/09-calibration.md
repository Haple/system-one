# Calibration: does 0.9 mean 90%?

A probability is only useful if it means what it says. Here is what calibration is, how to see it in a reliability diagram, why chat-trained models drift into overconfidence, what independent tests and our own measurements found for decision models, and how a few hundred labels let you measure and fix it.

## Key ideas

- Calibrated means: of all the answers given probability 0.8, about 80% turn out right.
- A reliability diagram plots stated probability against how often the model was right; the diagonal is perfect.
- Post-training for chat tends to make models overconfident; decision models are trained to keep probabilities honest, but that is a claim to test.
- Calibration is a property of each model on each task: in our tests Jev was slightly overconfident at the top, and on fresh news an LLM's stated confidence was better calibrated.
- Measure it on a few hundred of your own labels (ECE, Brier score), and fix systematic bias with simple recalibration such as Platt scaling.

## Practices for agents

- Before relying on probabilities, measure calibration on a labeled sample from your own traffic: a reliability table, ECE and Brier score.
- Never assume a vendor's calibration claim holds on your data; re-check after every model version change.
- If probabilities are systematically off, fit a recalibration map (Platt scaling or isotonic regression) on held-out labels; it fixes calibration but cannot add information.
- Prefer native probabilities to numbers a model writes as text, but measure both if you use both.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/calibration.md
Video: https://learn-system-one.pages.dev/lessons/calibration/
