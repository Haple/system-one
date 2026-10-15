# Choice: one answer from a set

A Choice picks one option from a set you define and returns a probability for every option. Here is how to read the distribution and its confidence, why a none-of-the-above option matters, how contrastive descriptions sharpen close calls, and what reversing the option order did to 3,080 real answers.

## Key ideas

- A Choice returns the chosen option, a probability for every option, and a confidence that summarizes how peaked that distribution is.
- A split distribution is information: a ticket that belongs to two teams should look split.
- Always offer a none-of-the-above option when inputs can fall outside your list; otherwise the model must pick something.
- Option names and descriptions are both sent to the model; for close calls, describe what each option covers and what it doesn't.
- Option order can sway uncertain answers: in our test, reversing 77 options changed 4.9% of answers, none above 0.9 probability.

## Practices for agents

- Give every Choice the full list of options with short descriptions, plus an explicit other / none option when coverage isn't guaranteed.
- Use contrastive descriptions (what it covers, what it is not for, examples) for options that get confused.
- Treat low-confidence Choice answers as candidates for review, and re-check close calls with the options reordered.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/choice-questions.md
Video: https://learn-system-one.pages.dev/lessons/choice-questions/
