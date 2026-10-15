# Decision models inside agents

Agents make dozens of small decisions per task: which tool, which skill, are these arguments grounded, is it time to ask the user, is the task done. Here is where a fast decision model fits in an agent loop, a gate that stops an agent from guessing, what skill selection gained in TypeSafe's test, and real-time control at ten decisions a second.

## Key ideas

- Most of an agent's decisions are rote; let a decision model make those and save the LLM for the hard ones.
- Good spots: model routing, tool and skill selection, argument checks before a tool runs, guardrails, and 'is it done?' checks.
- A before-tool-call gate with two narrow questions can make an agent ask instead of guessing.
- Selecting skills with a decision model cut wrong skill loads from 16.8% to 7.3% in TypeSafe's test of 182 skills.
- Prefer workflows (code-defined paths with smart nodes) when you can map the decision tree; use agents when you can't.

## Practices for agents

- Gate tool calls on narrow questions (are the arguments grounded in what the user said? is it premature to act?) and guide the agent back instead of hard-failing.
- Use a decision model to pick the few relevant tools or skills to load per step, instead of loading everything into context.
- Give long-running agents a cheap 'ask the decision model' tool for yes/no and classification checks over files or pages.
- Set a deadline for real-time decisions with a deterministic fallback when the answer is late.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/decision-models-in-agents.md
Video: https://learn-system-one.pages.dev/lessons/decision-models-in-agents/
