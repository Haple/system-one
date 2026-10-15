# Jev, Decisions, Clef, Strands: the landscape

Four decision models you can use today, one request shape they almost share, and what they cost. Then what we measured ourselves: accuracy on a public benchmark and on fresh news published after every model's release, latency from a real server, and why you should trust your own evals over anyone's leaderboard.

## Key ideas

- Jev (TypeSafe, hosted), OpenAI's Decisions API (hosted), Clef (Cloudflare, open weights) and Strands Decider (AWS, open, runs locally) share one shape: state plus typed questions in, probabilities out.
- Jev, Clef and Strands speak the same System One request format; OpenAI's is the same idea with different field names.
- Pricing is per input token with free output: a thousand decisions typically cost cents.
- Public benchmarks can leak into training data and leaderboards move; vendor latency is model time, not your round trip.
- Choose on your constraints (data residency, images, latency from your region, price, fine-tuning) and then measure on your own data.

## Practices for agents

- Hide the vendor behind a small adapter so you can swap decision models and compare them on the same questions.
- Pin a versioned model ID in production and log it with every decision.
- Measure latency from where your code runs, and accuracy and calibration on your own labeled examples, before choosing a model.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/decision-models-compared.md
Video: https://learn-system-one.pages.dev/lessons/decision-models-compared/
