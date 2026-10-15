# Lesson 6: Choice: one answer from a set

> A Choice picks one option from a set you define and returns a probability for every option. Here is how to read the distribution and its confidence, why a none-of-the-above option matters, how contrastive descriptions sharpen close calls, and what reversing the option order did to 3,080 real answers.

Course: System One (https://learn-system-one.pages.dev/) · Module 2: Asking good questions · 4 min · Watch: https://learn-system-one.pages.dev/lessons/choice-questions/

## Key takeaways

- A Choice returns the chosen option, a probability for every option, and a confidence that summarizes how peaked that distribution is.
- A split distribution is information: a ticket that belongs to two teams should look split.
- Always offer a none-of-the-above option when inputs can fall outside your list; otherwise the model must pick something.
- Option names and descriptions are both sent to the model; for close calls, describe what each option covers and what it doesn't.
- Option order can sway uncertain answers: in our test, reversing 77 options changed 4.9% of answers, none above 0.9 probability.

## Practices for coding agents

- Give every Choice the full list of options with short descriptions, plus an explicit other / none option when coverage isn't guaranteed.
- Use contrastive descriptions (what it covers, what it is not for, examples) for options that get confused.
- Treat low-confidence Choice answers as candidates for review, and re-check close calls with the options reordered.

## Lesson transcript


### Intro (0:01)

Most decisions in software pick one thing from a list: which team, which category, which intent. That's a Choice. Let's see what it gives back, and the four habits that make it reliable.

### Reading a Choice (0:14)

Here's a messy ticket. Shoes arrived late and in the wrong size, and there are two charges on the card. Which team should handle it? Returns wins at point six three, but billing gets point three three, because of the double charge. That split is honest. This ticket belongs to two teams.
Confidence turns that shape into one number. Zero means the probability is spread evenly. One means it's all on one option. Here it's point four five. It's computed from the probabilities, so you can always check it, or use your own measure, like the gap between the top two options.

### None of the above (0:52)

Habit one: always offer a way out. Someone writes in to apply for a designer job. Your options are returns, shipping and billing. Without an other option, the model has to pick something: billing, at point five, spread thin. Add other, described as none of the above, and it goes there with all the probability.

### Describe the options (1:14)

Habit two: describe the options. The model reads both the option names and their descriptions. For options that get confused, say what each one covers, what it's not for, and give an example or two. On a borderline question about where a disposable card works, plain names gave point nine. Contrastive descriptions gave a clean one point oh.
In code, it looks like this. Each option gets the same fields, so the model can compare them side by side. You only need this for the pairs that actually get confused. Clear options can keep a one line description, or none at all.

```python
"topic": Choice(
  instructions="Which disposable virtual card topic is the user asking about?",
  criteria={
    "get_card": {"what": "Purpose, eligibility, or setup",
                 "not_for": "Quantity, transaction, or merchant limits",
                 "examples": ["What are disposable cards for?"]},
    "card_limits": {"what": "Quantity, transaction, or merchant limits",
                    "not_for": "Purpose, eligibility, or setup",
                    "examples": ["Where can I use a disposable card?"]},
  })
```


### Give the full list (1:52)

Habit three: give the full list. Jev accepts up to two hundred fifty five options, and each one costs only a few tokens. Don't hand-pick a shortlist; offer every team, every category. For deep taxonomies with thousands of leaves, go level by level, which we'll cover in the composition module.

### Option order (2:14)

Habit four: watch the order. TypeSafe's docs warn that Jev can lean toward the first option. So we reversed the order of all seventy seven intents and reran 3,080 messages. Four point nine percent of answers changed. But look where: thirty six percent of answers under point five flipped, and not a single answer above point nine.
That's the pattern you'll see all through this course. When the model is sure, small changes don't move it. When it isn't, they do, and the probability tells you which case you're in. So route low confidence answers to review, and for close calls you care about, ask again with the options shuffled.

### Quick check (2:56)

**Quiz:** A message fits none of your five departments, and there's no “other” option. What happens?
A. The API returns an error
B. The model returns an empty answer
C. The model must spread probability over your five options and pick one
D. The model invents a sixth department
Answer: C. A Choice only scores the options you give it, so it has to pick one, usually with a flat, low-confidence distribution. Add “other” so it has somewhere honest to go.


### Try it (3:12)

Try it. Have your agent audit every Choice in your code for the four habits.

```text
Review every multiple-choice decision we ask a model to make. For each:
1. Is the option list complete? Add an explicit "other" / none option
   if inputs can fall outside it.
2. Does each option have a one-line description? For options that are
   often confused, add contrastive what / not_for / examples fields.
3. Does code treat low-confidence answers differently?
4. Add a test that re-asks 20 known close calls with the options
   shuffled and reports any answer that changes.
```


### Recap (3:18)

So: a Choice gives you a distribution, and its confidence says how peaked it is. Offer a way out. Describe the options that get confused. Give the full list. And remember that low confidence answers are the fragile ones. Next: the Score.

## Sources

- TypeSafe AI docs: Choice. https://docs.typesafe.ai/primitives/choice
- TypeSafe AI docs: Confidence. https://docs.typesafe.ai/confidence
- TypeSafe AI docs: How to build with TypeSafe. https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- AWS Strands Labs: strands-decider (README). https://github.com/strands-labs/strands-decider
- Amir Rafe amir rafe edu: Calibrated Decisions at Scale: Converting Police Crash Narratives into Probabilistic Crash Variables with…. https://arxiv.org/html/2609.24052
- Pezeshkpour, Hruschka: Large Language Models Sensitivity to The Order of Options in Multiple-Choice Questions. https://arxiv.org/abs/2308.11483
- Zheng et al.: Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena. https://arxiv.org/abs/2306.05685
- Daniel Sam: The Model That Doesn't Talk. https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm

License: CC BY 4.0 · https://github.com/Haple/system-one
