# Lesson 3: How a decision model works

> A language model writes its answer one token at a time. A decision model reads your state once and scores every allowed answer in a single pass. Here is the core trick in a few lines of Python, what production models add on top (trained readout heads, shared state, calibration training), and why typed output is not the same as a correct answer.

Course: System One (https://learn-system-one.pages.dev/) · Module 1: The idea · 4 min · Watch: https://learn-system-one.pages.dev/lessons/how-decision-models-work/

## Key takeaways

- An LLM's answer costs one sequential pass per output token; a decision model scores all allowed answers in one pass.
- The core trick: read the model's probability for each allowed option instead of generating text, then normalize.
- Production decision models add a trained readout head, shared state across questions, and training aimed at calibrated probabilities.
- Because it only scores the options you supplied, it can never return a value outside your schema.
- Typed is not the same as correct: a decision model can still be confidently wrong. That is why probabilities and calibration matter.

## Practices for coding agents

- Treat a decision model's output as a probability distribution over your options, not as a fact.
- Never assume 'cannot return an invalid value' means 'cannot be wrong'; gate risky actions on probability and test on your data.
- Keep the set of allowed answers complete, including a none-of-the-above option when inputs can fall outside it.

## Lesson transcript


### Intro (0:01)

What's actually inside a decision model? Less magic than you'd think. In this lesson, you'll see the core trick in a few lines of code, and what the real models add on top.

### Generate vs score (0:13)

Start with a normal language model. It writes its answer one token at a time, and every token is another full pass through the network. A fifty token answer is fifty passes, one after another. A decision model never writes. It reads your state once, and scores every allowed answer in a single pass.

### The core trick (0:34)

Here's the core trick, adapted from a popular post called Jev in twenty five lines of Python. Put the options in the prompt with letters. Run a small open model once. Then, instead of letting it write, read the probability it gives each letter as the next token, and normalize.

```python
labels  = ["A", "B", "C"]
choices = ["Legitimate", "Spam", "Phishing"]
email   = "Payroll asks for your password on a fake page."
prompt  = f"Choose one.\nEmail: {email}\nA. Legitimate\nB. Spam\nC. Phishing"
model.eval(model.tokenize(prompt))
logits = model.scores[-1]
x = [logits[token_id(l)] for l in labels]
p = softmax(x)
```

On a tiny model, that phishing email comes out about eighty nine percent phishing, eight percent spam, and three percent legitimate. A distribution over exactly your options. Nothing to parse, and no way to answer outside the list.

### What real models add (1:07)

Real decision models start from that idea and add three layers. A trained readout head, instead of guessing letter tokens. A shared state, read once, so many questions cost almost nothing extra. And training aimed at one thing: probabilities you can trust.
AWS's open Strands Decider is a good look inside. They take a two billion parameter model, throw away the part that generates words, and add a tiny pointer head of about a million parameters that compares each option to the question. One forward pass, no generation, no decoding loop.

### Three training goals (1:45)

The training goal is where these models differ most from chatbots. Reinforcement learning from human feedback, which made ChatGPT, rewards answers people prefer. Verifiable rewards made reasoning models good at math and code. TypeSafe calls its third path reinforcement learning for calibrated decisions: reward probabilities that match how often the answer turns out right.

### Typed is not correct (2:09)

Now, the big claim at launch was that Jev can't hallucinate. Hacker News pushed back fast. As one commenter put it, it can still forward a billing query to the dev department. Even TypeSafe's founder agreed in the thread: these models are probabilistic, so they can be confidently wrong.
So what you get is a probability, and the real promise is that the probability is honest. When a decision model says point nine, it should be right about nine times out of ten. Whether that holds on your data is something you'll learn to measure in module three.

### Quick check (2:45)

**Quiz:** Why can't a decision model return an answer outside your list?
A. It was fine-tuned on your categories
B. It only scores the options you supplied and returns a distribution over them
C. It regenerates until the output validates
D. A regex filters its output
Answer: B. The model never writes text. It assigns probability only to the answers you defined, so anything else simply doesn't exist for it. It can still pick the wrong one.


### Try it (2:56)

Try it. Ask your coding agent to build the tiny decider from this lesson with any small open model, and compare it with a hosted decision model on twenty of your own examples.

```text
Build tiny_decider.py: given a text and a list of options, put the options in a prompt with letters A, B, C..., run a small open GGUF model (e.g. Qwen3-0.6B via llama-cpp-python) once, and return a probability for each option from the next-token logits (softmax over the letters).
Then run it on 20 real examples from this project and print the probabilities next to the labels we expect.
```


### Recap (3:08)

So: decision models read once and score every allowed answer in one pass. The trick is reading probabilities instead of writing text. Real models add a trained head, shared state, and calibration training. And typed doesn't mean correct. Next: the four decision models you can use today.

## Sources

- Daniel Sam: The Model That Doesn't Talk. https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm
- Duarte O Carmo: Jev in 25 lines of Python - NobodyWho. https://www.nobodywho.ai/posts/jev-in-25-lines/
- Arcturus Labs: Supercharging LLM Classifications with Logprobs (at 1:00). https://www.youtube.com/watch?v=FN7oaLcIlvk&t=60s
- INI Seminar Room 1: Dr. Desi Ivanova | Estimating and Calibrating Uncertainty in LLMs (at 10:44). https://www.youtube.com/watch?v=Kvgy36vIv-0&t=644s
- AWS Strands Labs: strands-decider (README). https://github.com/strands-labs/strands-decider
- Cloudflare: Introducing Clef: our open-source decision models, and new RL fine-tuning platform. https://blog.cloudflare.com/clef-decision-models/
- Cloudflare: cloudflare/clef model card. https://huggingface.co/cloudflare/clef
- Marc Brooker: Strands Decider: Why Not an Encoder?. https://brooker.co.za/blog/2026/10/04/encoders.html
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- The TWIML AI Podcast with Sam Charrington: Asking JEV's Creator the Hard Questions About This Hot New AI Model (at 6:23). https://www.youtube.com/watch?v=9Aato-NfjoU&t=383s
- AI Engineer: Jev CEO: I made ChatGPT, now I'm building what's next (at 16:16). https://www.youtube.com/watch?v=cJ0EOzey--o&t=976s
- Hacker News commenters: Hacker News: Introducing System One Models and Jev. https://news.ycombinator.com/item?id=49717558
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/

License: CC BY 4.0 · https://github.com/Haple/system-one
