# Experiments

Everything the course shows as "measured" comes from these scripts. Results are in `results/`; the summary the site uses is `results/facts.json`.
Measured 2026-10-15 from a VPS in Campinas, Brazil (Hostinger); latencies include the network round trip.

| Script | What it measures |
|---|---|
| `e1_banking77.py` | BANKING77 test set (3,080 messages, 77 intents), one Choice per message: accuracy, calibration, coverage, latency, cost; also with the options reversed |
| `e2_fanout.py` | 13 questions in one request vs 13 requests (sequential and parallel) |
| `e4_jagged.py` | Known failure modes: counting, arithmetic, dates, inverted questions, injection |
| `e7_llm_verbalized.py` | An LLM asked for JSON with a stated confidence, as a baseline |
| `e8_news.py` | Fresh news stories (after every model's release), 8-way section Choice |
| `e9_distractor.py` | State design: ticket alone, plus 6k unrelated tokens, or buried among 40 tickets |
| `e10_counterfactual.py` | Name-swap audit on 12 synthetic candidate summaries |
| `demos.py` | The individual requests whose real answers appear in the lessons |
| `analyze.py` | Builds `results/facts.json` |

`s1client.py` talks to Jev (`JEV_API_KEY`), Cloudflare Workers AI (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`) and a local Strands Decider server. It reads keys with Doppler; replace `_secret()` with environment variables to use your own.

Data: BANKING77 (Casanueva et al., 2020, CC BY 4.0, PolyAI). The news test set is published as links and labels only (`data/news_2026-10-15.links.json`).
