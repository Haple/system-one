# Lesson 19: Know the jagged edges

> Decision models are strong at semantic judgment and unreliable at things a calculator does. Here are the failure modes we reproduced (counting, arithmetic, dates), TypeSafe's own list of nine, the cases where the model is wrong without sounding unsure, and the rule that fixes most of them: reason in code, decide with the model.

Course: System One (https://learn-system-one.pages.dev/) · Module 6: Shipping it · 4 min · Watch: https://learn-system-one.pages.dev/lessons/jagged-edges/

## Key takeaways

- Decision models are jagged: excellent at meaning, unreliable at counting, arithmetic and date comparison.
- In our tests, one counting question got 5 fruits instead of 6; twelve per-item Nouls summed in code got it right.
- On a wrong invoice total and a late payment, the model hedged at 0.43 and 0.47: honest, but code answers exactly.
- Typed output can't be malformed, but it can still be wrong, sometimes with confidence.
- Don't ask for counts, sums, date math, forecasts of real-world outcomes, or long reasoning chains; reason in code and decide with the model.

## Practices for coding agents

- Never ask a decision model to count, add, compare numbers or compare dates; extract the parts and compute in code.
- For semantic counting, ask one Noul per item and sum in code.
- Write the exact condition in the instructions; when you find yourself explaining what you meant, add that to the question.
- Test each new question on known hard cases (negations, look-alike options, adversarial text) before shipping.

## Lesson transcript


### Intro (0:01)

Every model has edges where it suddenly gets worse. For decision models, those edges are sharp, and easy to predict. Let's walk right up to them.

### Jagged (0:11)

TypeSafe's CEO doesn't hide it. Our model cannot count R's in strawberry, he says. Luckily, that is not what real world work looks like. Most work is semantic judgment. But you need to know exactly where the edges are.

### Counting (0:27)

We checked. Twelve words, six of them fruits. Asked as one question, how many are fruits, the model said five, at fifty two percent. Wrong. Now ask twelve small Nouls, one per word: is this a fruit? Every one came back right, and code adds them up. Six.

### Arithmetic (0:47)

Arithmetic. An insurance claim lists four costs adding up to three thousand two hundred fifty, but claims three thousand one fifty. Do the costs add up? The model said point four three. That's honest, it really doesn't know, but it's useless. One line of code knows for sure.

### Dates (1:08)

Dates. An invoice from February tenth, due in thirty days, was paid on March fourteenth. Was it on time? Point four seven, a shrug. TypeSafe's docs explain why: the model reads dates as text, not as quantities. Extract the parts, as in lesson fifteen, and let code count the days.

### The full list (1:29)

TypeSafe publishes the full list for Jev one point thirteen, nine failure modes, each with a fix. Literal reading. Math. Date comparison. Indirection. Large, noisy state. Adversarial content. Instructions that contradict the criteria. Option order. And generation, which it simply doesn't do. Several of these you've already met in this course.

### Wrong, and not unsure (1:55)

Now the uncomfortable part. Low confidence won't always warn you. A poker player tested Jev on a spot every regular knows: you hold the best possible hand, so you check and let the other player bet. The solver checks every time. Jev went all in, sixteen runs out of sixteen.
That's why the claim that a decision model can't hallucinate needs care. It can't return an invalid type or an option that doesn't exist. But as TypeSafe's CEO wrote on launch day, it's also possible to be confidently wrong, and all future models will still have that possibility.

### What not to ask (2:34)

So here's what not to ask a decision model. Don't ask it to count, add, or compare numbers and dates. Don't ask it to write anything. Don't ask it to predict the real world: one tester asked Clef which thumbnails would beat a channel's average, and its picks did exactly as well as the average, a coin flip. And don't ask for long chains of reasoning in one judgment: an independent test found OpenAI's Decisions confidence no better than chance five reasoning steps deep.

### The rule (3:06)

Which leaves one rule, best put in the README of the open model Jeff. Reason in code, decide with the model. Code does the counting, the sums, the dates and the steps. The model makes the judgment that code can't.

### Quick check (3:22)

**Quiz:** Flag orders where the customer was charged more than the quote. Which design?
A. A Noul: “Was the customer overcharged?”
B. Select both amounts from candidates, then compare them in code
C. A Score for how overcharged they were
D. A Choice between “overcharged” and “fine”, plus “unsure”
Answer: B. Comparing numbers is code's job. Use the model to pick which amount is the quote and which is the charge, then compare them exactly.


### Try it (3:34)

Try it. Have your agent audit your questions for jagged edges.

```text
Audit every decision-model question in this codebase against the known failure modes: counting, arithmetic, number or date comparison, indirection (questions that point at one item in a long list), large irrelevant state, adversarial input, criteria that contradict the instruction, option order, and anything that asks for generation. For each hit, rewrite it so code does the computing and the model only judges meaning, and add a test with a known answer for each rewrite.
```


### Recap (3:39)

So: decision models are jagged. Strong on meaning, weak on counting, arithmetic and dates. Typed output can still be wrong, sometimes confidently. Know the nine failure modes, and reason in code, decide with the model. Next: proving it works, on your own data.

## Sources

- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- The TWIML AI Podcast with Sam Charrington: Asking JEV's Creator the Hard Questions About This Hot New AI Model (at 34:30). https://www.youtube.com/watch?v=9Aato-NfjoU&t=2070s
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- Mike Ramos: Jev is the 🐠 at the poker table. https://backnotprop.com/blog/jev-poker/
- Hacker News commenters: Hacker News: Introducing System One Models and Jev. https://news.ycombinator.com/item?id=49717558
- firelex/jeff: firelex/jeff: Millisecond decisions, any domain: a 0.8B open "System 1" model that picks between your…. https://github.com/firelex/jeff
- Theo - t3․gg: Jev is incredible (at 13:33). https://www.youtube.com/watch?v=F3YXg7AaKWE&t=813s
- Better Stack: Cloudflare Just Challenged Jev, So I Tested Their New Model (Clef) (at 5:55). https://www.youtube.com/watch?v=Uihz1NkhFM0&t=355s
- Ryan Porter: The OpenAI Decisions API Needs a Confidence You Can Trust | Anthus. https://anth.us/blog/openai-decisions-api-preview/
- InfoQ: TypeSafe AI Releases Jev: a Decision-Only Model That Returns Typed Probabilities. https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/
- Sebastien Dubois: Jev and System One models - a semantic if statement for your code. https://www.dsebastien.net/jev-and-system-one-models-a-semantic-if-statement-for-your-code/

License: CC BY 4.0 · https://github.com/Haple/system-one
