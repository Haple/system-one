# Lesson 14: Route and cascade

> One fast decision in front of expensive things. Here is intent routing (code, a specialist model, or a person), the cascade (cheap model first, escalate only the uncertain), how to tune it so it matches a strong model at a fraction of the cost, and the prompt-cache gotcha that turned one developer's model router into a money loser.

Course: System One (https://learn-system-one.pages.dev/) · Module 4: Composing judgments · 4 min · Watch: https://learn-system-one.pages.dev/lessons/routing-and-cascades/

## Key takeaways

- Routing: one cheap, fast decision chooses the handler, which may be plain code, a specialist LLM, or a person.
- If you can map the whole decision tree, build it explicitly and optimize each node; don't hand it to an agent loop.
- A cascade answers with the cheap model when it's confident and escalates the rest to a stronger model or a person.
- Tune the cascade on a sample of a few hundred items: pick the cheapest threshold that still agrees with the strong model at your target rate.
- Route per task, not mid-session: switching models mid-conversation throws away the prompt cache.

## Practices for coding agents

- Put one fast decision (intent + complexity) in front of expensive handlers, and send low-confidence routes to a person.
- Implement cascades: accept confident cheap answers, escalate the rest, and tune the threshold on labeled data against the strong model's answers.
- Prefer routing whole tasks or reasoning effort over swapping models mid-session, which invalidates prompt caches.

## Lesson transcript


### Intro (0:01)

Expensive models are great, and wasteful when they're used for everything. The fix is old and simple: put one fast decision in front of the expensive things.

### Intent routing (0:13)

Here's intent routing. A customer message comes in. One Choice decides the intent, and one Score estimates how complex it is, in a single fast call. Order status goes to plain code: a database lookup, no model at all. Product questions go to an LLM with product knowledge. Complaints that are complex, or unclear, go to a person.
Anthropic's Barry Zhang gives the same advice for agents. If you can map out the entire decision tree pretty easily, just build that explicitly, and then optimize every node. It's cheaper, and it gives you more control. A decision model is how you make each node smart.

### The cascade (0:54)

The cascade is routing by confidence. Every item goes to the cheap, fast model first. If it's confident, you keep its answer. If not, the item goes to a stronger, slower model, and only the leftovers reach a person. Most items never touch the expensive part.
The savings can be dramatic. The FrugalGPT paper reported matching GPT-4's performance with up to ninety eight percent lower cost on its benchmarks. And the open model Jeff, on one Apple M4 Max, beat a twenty seven billion parameter model deciding directly, ninety five versus eighty seven percent, in under half a second instead of eight.

### Tuning it (1:36)

How do you set the cascade's threshold? Shreya Shankar's recipe: treat the strong model as the oracle. Run both on a sample, say five hundred items. Simulate each threshold, measuring how often the cascade agrees with the oracle, and what it costs. Throw out every threshold below your target, and pick the cheapest one left. And if confidence carries no signal, the only threshold left sends everything to the oracle. The procedure tells you there's nothing to save, instead of pretending.

### Routing effort (2:07)

You can route effort, not just models. The Jeff team put a small decision model inside a coding agent, deciding at each step whether the big model should think hard. Over twelve hundred tasks, it kept the same pass rate, sixty two percent, in about two thirds of the time. Simply turning thinking off was faster too, but seven and a half points worse.

### The cache gotcha (2:31)

One gotcha from Hacker News. A developer used a decision model to route each turn of a session between small and large models, and lost money. Swapping models mid-session invalidates the prompt cache, which is where a lot of the savings live. Route whole tasks, or route the effort level, instead.

### Quick check (2:51)

**Quiz:** Answers above 0.9 agree with the oracle no more often than answers below 0.5. What now?
A. Raise the threshold to 0.99
B. Confidence carries no signal on this task: don't cascade it this way
C. Lower the threshold to 0.5
D. Add more questions to the request
Answer: B. A cascade only works if confidence tracks correctness. Here it doesn't, so any threshold routes at random. Improve the questions or the model, or send everything to the strong model.


### Try it (3:08)

Try it. Have your agent put a router or a cascade in front of your most expensive model call.

```text
Find our most expensive or slowest LLM call. Put a decision model in front of it: either a router (one Choice for intent + one Score for complexity, sending easy cases to code or a cheap path) or a cascade (accept confident answers, escalate the rest). Tune the threshold on
300 logged inputs using the expensive model's outputs as the oracle, and report agreement, cost and latency at each threshold. Route whole tasks, never switch models mid-session.
```


### Recap (3:15)

So: one fast decision in front of expensive things. Route to code, a specialist, or a person. Cascade: cheap first, escalate the uncertain, tuned against a strong model. Route effort, not just models, and never mid-session. Next: getting exact values out, without generating them.

## Sources

- TypeSafe AI docs: Intent routing. https://docs.typesafe.ai/patterns/intent-routing
- TypeSafe AI docs: SDE cascade. https://docs.typesafe.ai/cookbooks/sde_cascade
- AnthropicAI: Building Effective AI Agents. https://www.anthropic.com/engineering/building-effective-agents
- AI Engineer: How We Build Effective Agents: Barry Zhang, Anthropic (at 2:51). https://www.youtube.com/watch?v=D7_ipDqhtwk&t=171s
- Hamel Husain: How to Cut Your LLM Classification Costs by 90% (at 4:43). https://www.youtube.com/watch?v=FWFjLF_VoVI&t=283s
- Chen, Zaharia, Zou: FrugalGPT: How to Use Large Language Models While Reducing Cost and Improving Performance. https://arxiv.org/abs/2305.05176
- Ong et al.: RouteLLM: Learning to Route LLMs with Preference Data. https://arxiv.org/abs/2406.18665
- firelex/jeff: firelex/jeff: Millisecond decisions, any domain: a 0.8B open "System 1" model that picks between your…. https://github.com/firelex/jeff
- Hacker News commenters: Hacker News: Jev in 25 Lines of Python. https://news.ycombinator.com/item?id=49812769
- Hacker News commenters: Hacker News: Decisions API is in public beta. https://news.ycombinator.com/item?id=49984025
- Syntax: Jev Explained: Demos and Use Cases (at 4:44). https://www.youtube.com/watch?v=QbYBRjOaGOo&t=284s
- Sebastien Dubois: Jev and System One models - a semantic if statement for your code. https://www.dsebastien.net/jev-and-system-one-models-a-semantic-if-statement-for-your-code/

License: CC BY 4.0 · https://github.com/Haple/system-one
