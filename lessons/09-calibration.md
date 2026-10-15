# Lesson 9: Calibration: does 0.9 mean 90%?

> A probability is only useful if it means what it says. Here is what calibration is, how to see it in a reliability diagram, why chat-trained models drift into overconfidence, what independent tests and our own measurements found for decision models, and how a few hundred labels let you measure and fix it.

Course: System One (https://learn-system-one.pages.dev/) · Module 3: Probabilities you can act on · 4 min · Watch: https://learn-system-one.pages.dev/lessons/calibration/

## Key takeaways

- Calibrated means: of all the answers given probability 0.8, about 80% turn out right.
- A reliability diagram plots stated probability against how often the model was right; the diagonal is perfect.
- Post-training for chat tends to make models overconfident; decision models are trained to keep probabilities honest, but that is a claim to test.
- Calibration is a property of each model on each task: in our tests Jev was slightly overconfident at the top, and on fresh news an LLM's stated confidence was better calibrated.
- Measure it on a few hundred of your own labels (ECE, Brier score), and fix systematic bias with simple recalibration such as Platt scaling.

## Practices for coding agents

- Before relying on probabilities, measure calibration on a labeled sample from your own traffic: a reliability table, ECE and Brier score.
- Never assume a vendor's calibration claim holds on your data; re-check after every model version change.
- If probabilities are systematically off, fit a recalibration map (Platt scaling or isotonic regression) on held-out labels; it fixes calibration but cannot add information.
- Prefer native probabilities to numbers a model writes as text, but measure both if you use both.

## Lesson transcript


### Intro (0:01)

Every answer from a decision model comes with probabilities. But a probability is only useful if it means what it says. This lesson is about checking that.

### What calibration means (0:12)

Think of a weather forecaster. On the days they say seventy percent chance of rain, it should rain on about seventy percent of them. That's calibration. It's not about any single day. It's about the group. Of all the answers a model gives at point eight, about eight in ten should be right.

### Seeing it (0:30)

You see calibration in a reliability diagram. Group answers by the probability the model gave, and plot how often each group was right. Perfect calibration is the diagonal. Here's Jev 1.13 on our 3,080 banking messages. Mostly close, but slightly below the line at the top: answers it gave about point nine nine were right ninety two percent of the time. A little overconfident.

### Why chatbots drift (0:57)

Why does this need saying at all? Because chat models are famously badly calibrated. Pretrained models are fairly well calibrated, but post-training for chat, as researcher Desi Ivanova puts it, destroys calibration. People like answers that sound sure, so models learn to sound sure.

### Independent tests (1:17)

Independent testers have checked the decision models directly. Ryan Porter ran 3,600 hard reasoning questions through OpenAI's Decisions API and Jev. Luna said ninety nine percent or more on 2,672 answers, and only sixty eight percent of those were right. Jev said ninety nine percent on 1,667 answers, and was right on ninety eight point nine.

### Model by model (1:44)

But don't turn that into a rule about paradigms. A team that checked Jev against 2,416 human judgments of police crash reports found it wasn't overconfident there at all. It hedged, staying too close to the middle. Their conclusion is the one to remember: calibration turns out to be a property of the individual model, rather than of the paradigm.
We saw the same thing on our fresh news test. Jev 1.14 was more accurate, but its top answers were a bit overconfident. The LLM, asked to write its confidence as a number, was actually better calibrated on this task. Calibration has to be measured, task by task.

### Measuring it (2:28)

Two numbers summarize it. Expected calibration error is the average gap between stated probability and actual accuracy, weighted by how many answers fall in each bin. Zero is perfect. The Brier score is the mean squared error of the probabilities themselves. Always guessing fifty fifty on a yes or no question scores point two five, so you want to be well below that.
You can measure it in a dozen lines. Bin the answers by stated probability, compare each bin's average probability with its accuracy, and weight the gaps. Run it on a few hundred of your own labeled examples, per question, and again whenever the model version changes.

```python
def ece(rows, bins=10):
    # rows: (stated_probability, was_right)
    groups = [[] for _ in range(bins)]
    for p, ok in rows:
        groups[min(int(p * bins), bins - 1)].append((p, ok))
    err = 0.0
    for grp in groups:
        if grp:
            conf = sum(p for p, _ in grp) / len(grp)
            acc = sum(ok for _, ok in grp) / len(grp)
            err += len(grp) / len(rows) * abs(conf - acc)
    return err

brier = sum((p - ok) ** 2 for p, ok in rows) / len(rows)
```


### Fixing it (3:10)

And if it's off in a consistent direction, you can fix it cheaply. Fit a tiny logistic regression from the model's probability to what actually happened, called Platt scaling, on held-out labels. The crash narrative team cut calibration error by a factor of three point three this way. One limit: remapping fixes calibration, but it can't add information the probabilities don't carry.

### Quick check (3:35)

**Quiz:** 500 answers stated at 0.9; 400 were right. What does that tell you?
A. The model is well calibrated
B. It's overconfident at 0.9: those answers are right about 80% of the time
C. It's underconfident
D. Nothing: calibration is about single answers
Answer: B. 400 of 500 is 80%, below the 90% it claimed. Recalibrate, or treat its 0.9 as 0.8 when you set thresholds.


### Try it (3:49)

Try it. Have your agent build a calibration report for one of your decisions.

```text
For one decision we make with a model, collect 200-300 examples with trusted labels from real traffic. Run the model on all of them and log the probability of the chosen answer. Then report: accuracy, a
10-bin reliability table (stated vs actual), ECE and Brier score.
Fit Platt scaling on half the data and report ECE on the other half, before and after. Save the script so we can rerun it on every model version change.
```


### Recap (3:54)

So: calibrated means point eight is right eight times in ten. See it in a reliability diagram, summarize it with ECE and Brier. Chat training drifts toward overconfidence, but every model has to be measured on every task. And a simple recalibration fixes the numbers. Next: turning probabilities into actions with thresholds.

## Sources

- ritvikmath: Probability Calibration : Data Science Concepts (at 0:56). https://www.youtube.com/watch?v=AunotauS5yI&t=56s
- IBM Technology: What Is Jev? The AI Model That Doesn't Generate Text (at 10:15). https://www.youtube.com/watch?v=YGgNBcIgI4s&t=615s
- INI Seminar Room 1: Dr. Desi Ivanova | Estimating and Calibrating Uncertainty in LLMs (at 19:35). https://www.youtube.com/watch?v=Kvgy36vIv-0&t=1175s
- Talks at Google: Thinking, Fast and Slow | Daniel Kahneman | Talks at Google (at 45:35). https://www.youtube.com/watch?v=CjVQJdIrDJ0&t=2735s
- Ryan Porter: The OpenAI Decisions API Needs a Confidence You Can Trust | Anthus. https://anth.us/blog/openai-decisions-api-preview/
- Amir Rafe amir rafe edu: Calibrated Decisions at Scale: Converting Police Crash Narratives into Probabilistic Crash Variables with…. https://arxiv.org/html/2609.24052
- Kevin David Hayes: Pinocchio: Fast Uncertainty Estimates for Black-Box Language Models. https://arxiv.org/html/2609.24881
- OpenAI et al.: GPT-4 Technical Report. https://arxiv.org/abs/2303.08774
- Guo et al.: On Calibration of Modern Neural Networks. https://arxiv.org/abs/1706.04599
- Kadavath et al.: Language Models (Mostly) Know What They Know. https://arxiv.org/abs/2207.05221
- Wikimedia Foundation, Inc.: Brier score - Wikipedia. https://en.wikipedia.org/wiki/Brier_score
- TypeSafe AI docs: AI primer. https://docs.typesafe.ai/introduction/machine-learning-primer
- The TWIML AI Podcast with Sam Charrington: Asking JEV's Creator the Hard Questions About This Hot New AI Model (at 55:53). https://www.youtube.com/watch?v=9Aato-NfjoU&t=3353s

License: CC BY 4.0 · https://github.com/Haple/system-one
