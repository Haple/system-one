# Lesson 4: Jev, Decisions, Clef, Strands: the landscape

> Four decision models you can use today, one request shape they almost share, and what they cost. Then what we measured ourselves: accuracy on a public benchmark and on fresh news published after every model's release, latency from a real server, and why you should trust your own evals over anyone's leaderboard.

Course: System One (https://learn-system-one.pages.dev/) · Module 1: The idea · 4 min · Watch: https://learn-system-one.pages.dev/lessons/decision-models-compared/

## Key takeaways

- Jev (TypeSafe, hosted), OpenAI's Decisions API (hosted), Clef (Cloudflare, open weights) and Strands Decider (AWS, open, runs locally) share one shape: state plus typed questions in, probabilities out.
- Jev, Clef and Strands speak the same System One request format; OpenAI's is the same idea with different field names.
- Pricing is per input token with free output: a thousand decisions typically cost cents.
- Public benchmarks can leak into training data and leaderboards move; vendor latency is model time, not your round trip.
- Choose on your constraints (data residency, images, latency from your region, price, fine-tuning) and then measure on your own data.

## Practices for coding agents

- Hide the vendor behind a small adapter so you can swap decision models and compare them on the same questions.
- Pin a versioned model ID in production and log it with every decision.
- Measure latency from where your code runs, and accuracy and calibration on your own labeled examples, before choosing a model.

## Lesson transcript


### Intro (0:01)

You can use a decision model today from at least four places. They share one shape, but they differ in where they run, what they cost and how fast they answer from where you are. Let's lay them out, and then look at what we measured ourselves.

### The four (0:16)

Jev, from TypeSafe, is a hosted API at four point two cents per million input tokens. OpenAI's Decisions API runs on GPT-6 Luna at ten cents. Cloudflare's Clef comes in two sizes on Workers AI, and you can download the weights. And AWS's Strands Decider is a two billion parameter model you run yourself, even on a laptop. All four charge nothing for output.

### One shape (0:43)

And they speak nearly the same language. Jev's request format became a de facto standard: Clef and Strands accept it as is, so switching is a change of endpoint. OpenAI uses the same idea with different names: input instead of state, predicate instead of noul.

### What we measured (1:01)

We ran all 3,080 messages of BANKING77, a public dataset of bank support questions with seventy seven intents, through each model we could reach. Jev 1.13 and 1.14 both got about eighty percent right. A fast LLM asked for its answer as JSON got seventy six. And Clef flash got ninety six percent.
Before you crown a winner, notice something. BANKING77 has been public since 2020, and it's one of the benchmarks Cloudflare reports for Clef. Public test sets can end up in training data. So we built a fresh test: 279 news stories published after every one of these models was released. There, Jev 1.14 got eighty two percent, and the LLM eighty.

### Latency is local (1:51)

Latency tells a similar story. Vendors quote model time, often under a tenth of a second. From our server in Brazil, the full round trip told the truth: Jev answered in a quarter of a second, Clef flash in eight tenths, and the LLM in one point two.

### Cents per thousand (2:09)

And the bill? With seventy seven options in every question, about seventeen hundred tokens each, a thousand decisions cost about seven cents on Jev or on Clef flash. Even the LLM was only about eleven cents. At these prices, the question is never can we afford to ask. It's what else should we ask.

### How to choose (2:30)

So how do you choose? Start from your constraints. If data can't leave your servers, run open weights: Strands Decider, or Clef yourself. If you need images, OpenAI and Clef read them today. Pick the region closest to your code. Compare the price per thousand of your decisions, not per token. And if you'll want to fine tune, Cloudflare offers that for Clef.
And whatever you pick, take TypeSafe's own advice from their essay on benchmarks: run your own private evals, treat public ones with a grain of salt, and don't amplify every number or plot you see. That includes ours.

### Quick check (3:08)

**Quiz:** Your data can't leave your servers. Which option fits?
A. Jev's hosted API with long context turned on
B. OpenAI's Decisions API
C. Strands Decider, or Clef's open weights, run on your hardware
D. Whichever topped the latest leaderboard
Answer: C. Strands Decider and Clef publish their weights, so you can run them where your data lives. Then measure them on your own data.


### Try it (3:20)

Try it. Have your agent write one small adapter that can call any of these models with the same questions, and log the model, latency and probabilities, so every later lesson can compare them on your data.

```text
Write decide.py with one function: decide(state, questions, provider).
questions use the System One shape (noul / choice / score). Support:
- jev: POST https://api.typesafe.ai/v1/systemone (TYPESAFE_API_KEY)
- clef: Cloudflare Workers AI @cf/cloudflare/clef-flash (same body)
- openai: POST /v1/decisions (map state->input, noul->predicate,
  criteria->choices/levels; model gpt-6-luna)
Return the same shape for all. Log provider, model id, latency and probabilities to decisions.jsonl. Add a test that runs one question through every provider that has a key set.
```


### Recap (3:33)

So: four decision models, one shape, cents per thousand decisions. Public benchmarks are upper bounds, latency is local, and the only score that counts is the one on your data. That's module one. Next, how to ask good questions, starting with the simplest: the Noul.

## Sources

- TypeSafe AI docs: Models. https://docs.typesafe.ai/models
- OpenAI docs: Decisions (OpenAI API guide). https://developers.openai.com/api/docs/guides/decisions
- Cloudflare docs: Introducing Clef: Cloudflare's first open-source decision models, now on Workers AI. https://developers.cloudflare.com/changelog/post/2026-10-01-clef-workers-ai/
- Cloudflare: Introducing Clef: our open-source decision models, and new RL fine-tuning platform. https://blog.cloudflare.com/clef-decision-models/
- Cloudflare: cloudflare/clef model card. https://huggingface.co/cloudflare/clef
- AWS Strands Labs: strands-decider (README). https://github.com/strands-labs/strands-decider
- The New Stack: AWS launches a local answer to TypeSafe's Jev decision model. https://thenewstack.io/aws-strands-decider-model/
- Frederic Lardinois: OpenAI answers TypeSafe's Jev with a Decision API built on Luna. https://thenewstack.io/openai-decision-api-luna/
- jaredpalmer/kev: jaredpalmer/kev: Jev-like family of decision models built on top of Qwen3.5/3.8 you can train and run on…. https://github.com/jaredpalmer/kev
- JevBench authors: JevBench v1 (benchmark for Jev-class typed decision models). https://github.com/doxanocap/jevbench
- Benchmark Heaven: Jev-class models — JevBench v1.0. https://benchmarkheaven.com/jev-models/v1
- TypeSafe AI: Lies, Damned Lies, and Benchmarks. https://typesafe.ai/blog/antibenchmaxxing
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- Mark Kashef: OpenAI's Decisions API just dropped. Here's how it compares to Jev. (at 9:12). https://www.youtube.com/watch?v=uTU5Ihgl_7Q&t=552s

License: CC BY 4.0 · https://github.com/Haple/system-one
