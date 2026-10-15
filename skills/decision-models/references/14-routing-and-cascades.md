# Route and cascade

One fast decision in front of expensive things. Here is intent routing (code, a specialist model, or a person), the cascade (cheap model first, escalate only the uncertain), how to tune it so it matches a strong model at a fraction of the cost, and the prompt-cache gotcha that turned one developer's model router into a money loser.

## Key ideas

- Routing: one cheap, fast decision chooses the handler, which may be plain code, a specialist LLM, or a person.
- If you can map the whole decision tree, build it explicitly and optimize each node; don't hand it to an agent loop.
- A cascade answers with the cheap model when it's confident and escalates the rest to a stronger model or a person.
- Tune the cascade on a sample of a few hundred items: pick the cheapest threshold that still agrees with the strong model at your target rate.
- Route per task, not mid-session: switching models mid-conversation throws away the prompt cache.

## Practices for agents

- Put one fast decision (intent + complexity) in front of expensive handlers, and send low-confidence routes to a person.
- Implement cascades: accept confident cheap answers, escalate the rest, and tune the threshold on labeled data against the strong model's answers.
- Prefer routing whole tasks or reasoning effort over swapping models mid-session, which invalidates prompt caches.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/routing-and-cascades.md
Video: https://learn-system-one.pages.dev/lessons/routing-and-cascades/
