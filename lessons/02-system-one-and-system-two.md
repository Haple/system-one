# Lesson 2: System One and System Two

> The name comes from Daniel Kahneman: fast, automatic judgment versus slow, effortful reasoning. Here is what the metaphor gets right about decision models, where it breaks, and the rule of thumb it gives you: if an expert could answer in a few seconds, it is a System One question.

Course: System One (https://learn-system-one.pages.dev/) · Module 1: The idea · 3 min · Watch: https://learn-system-one.pages.dev/lessons/system-one-and-system-two/

## Key takeaways

- Kahneman's System 1 is fast, automatic and effortless; System 2 is slow, serial and effortful. Decision models aim at the first kind of judgment.
- Rule of thumb: if a knowledgeable person could answer in a few seconds with the right context, it is a System One question.
- Tasks that need several steps of reasoning, new text or planning are System Two work: send them to a reasoning model, a person, or decompose them.
- The useful architecture is a layer cake: code is exact, the decision model judges, the language model thinks.
- The two systems are a metaphor, and fast does not have to mean sloppy: what makes fast judgments usable is honest uncertainty.

## Practices for coding agents

- Before calling a decision model, check that each question is a few-second judgment for an expert given the state; if not, split it or route it to a reasoning model.
- Keep exact computation (math, dates, counting, lookups) in code, never in a fast judgment.
- Escalate System Two work (multi-step reasoning, writing, planning) to an LLM or a person instead of forcing it into one question.

## Lesson transcript


### Intro (0:01)

Why call a model System One? The name comes from psychology, and it hands you the most useful rule in this course: which questions belong to a fast model, and which don't.

### Two ways to think (0:13)

Try this. What's two plus two? The answer just appears. Now, what's seventeen times twenty four? You can feel yourself start to work. Daniel Kahneman, who won a Nobel prize for his work on judgment and decision making, called these System 1 and System 2.
In his Nobel lecture he described them like this. System 1 is fast, automatic, effortless and associative. System 2 is slower, serial, effortful and deliberately controlled.

### Fast is not dumb (0:46)

And System 1 isn't the dumb one. Kahneman's point is that this is where skill lives. A chess master's strong moves come to mind instantly. System 2 just checks them.

### Models on the spectrum (0:58)

Models sit on the same spectrum. A decision model reads the state once and answers in a single pass, in a fraction of a second. Reasoning models do the opposite: they spend tokens thinking, step by step, and trade time for accuracy.

### The rule of thumb (1:15)

So here's the rule of thumb, straight from the TypeSafe docs. Make each question a gut check: the kind of judgment a knowledgeable person could make in a few seconds, given the right context.
Is this customer asking for a refund? Which team should handle it? How severe is this bug? An expert answers those at a glance. But should we make an exception for this customer, given three years of history? Write the apology? Plan the rollout? Those need System Two.

### The layer cake (1:46)

Developer Daniel Sam summed up the architecture in one line: put a decision layer between your rules and your reasoner. Let code be exact, let the model judge, let the LLM think.

### Where the metaphor breaks (1:59)

One caution. Kahneman himself called the two systems fictitious characters, a way to talk, not two boxes in the brain. And System 1 thinking is famous for its biases. A fast model can be confidently wrong too. What makes fast judgments usable in software is honest uncertainty, which is module three of this course.

### Quick check (2:22)

**Quiz:** Which of these is a System One question?
A. Given this contract and our policy history, should we waive the penalty?
B. Does this message mention a delivery problem?
C. Write a migration plan for this database
D. How many invoices in this list are overdue?
Answer: B. An expert spots a delivery problem at a glance. Waiving a penalty and planning a migration need reasoning or writing, and counting overdue invoices is exact work for code.


### Try it (2:31)

Try it. Take the list of hidden decisions from the last lesson and have your agent sort them into System One questions and System Two work.

```text
For each LLM decision we found in this codebase, classify it:
- System One: an expert could answer it in a few seconds from the given data
- System Two: it needs multi-step reasoning, new text, or planning
- Code: it is exact (math, dates, counting, lookups)
For every System Two item, propose how to split it into narrow questions plus code, or say why it should stay with an LLM.
```


### Recap (2:41)

So: System One is fast, automatic judgment, and that's what decision models aim for. If an expert could answer in seconds, it's a System One question. Code stays exact, and System Two takes the hard cases. Next: what's actually inside a decision model.

## Sources

- kahneman-nobel. https://www.nobelprize.org/uploads/2018/06/kahnemann-lecture.pdf
- Lex Fridman: Daniel Kahneman: Thinking Fast and Slow, Deep Learning, and AI | Lex Fridman Podcast #65 (at 9:09, 14:49). https://www.youtube.com/watch?v=UwwBG-MbniY&t=549s
- Talks at Google: Thinking, Fast and Slow | Daniel Kahneman | Talks at Google (at 16:40, 20:41). https://www.youtube.com/watch?v=CjVQJdIrDJ0&t=1000s
- Preserve Knowledge: Yoshua Bengio | From System 1 Deep Learning to System 2 Deep Learning | NeurIPS 2019 (at 4:00). https://www.youtube.com/watch?v=FtUbMG3rlFs&t=240s
- Andrej Karpathy: [1hr Talk] Intro to Large Language Models (at 36:00). https://www.youtube.com/watch?v=zjkBMFhNj_g&t=2160s
- TypeSafe AI docs: Introduction. https://docs.typesafe.ai/introduction
- Sam Witteveen: Using Jev In Your Agent Harness (at 0:07). https://www.youtube.com/watch?v=zaLQ0AnY9dI&t=7s
- Daniel Sam: The Model That Doesn't Talk. https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm
- Modal: jev: on | Diogo Almeida founder of Typesafe AI, Runtime 2026 (at 6:53). https://www.youtube.com/watch?v=ip7Qej0ONoE&t=413s
- Diogo Almeida with swyx: Jev: System One models for Prod, not God (Latent Space podcast) (at 81:23). https://www.youtube.com/watch?v=cFx9Z3ZXca0&t=4883s
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Wikimedia Foundation, Inc.: Dual process theory - Wikipedia. https://en.wikipedia.org/wiki/Dual_process_theory

License: CC BY 4.0 · https://github.com/Haple/system-one
