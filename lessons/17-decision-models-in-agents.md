# Lesson 17: Decision models inside agents

> Agents make dozens of small decisions per task: which tool, which skill, are these arguments grounded, is it time to ask the user, is the task done. Here is where a fast decision model fits in an agent loop, a gate that stops an agent from guessing, what skill selection gained in TypeSafe's test, and real-time control at ten decisions a second.

Course: System One (https://learn-system-one.pages.dev/) · Module 5: Real systems · 4 min · Watch: https://learn-system-one.pages.dev/lessons/decision-models-in-agents/

## Key takeaways

- Most of an agent's decisions are rote; let a decision model make those and save the LLM for the hard ones.
- Good spots: model routing, tool and skill selection, argument checks before a tool runs, guardrails, and 'is it done?' checks.
- A before-tool-call gate with two narrow questions can make an agent ask instead of guessing.
- Selecting skills with a decision model cut wrong skill loads from 16.8% to 7.3% in TypeSafe's test of 182 skills.
- Prefer workflows (code-defined paths with smart nodes) when you can map the decision tree; use agents when you can't.

## Practices for coding agents

- Gate tool calls on narrow questions (are the arguments grounded in what the user said? is it premature to act?) and guide the agent back instead of hard-failing.
- Use a decision model to pick the few relevant tools or skills to load per step, instead of loading everything into context.
- Give long-running agents a cheap 'ask the decision model' tool for yes/no and classification checks over files or pages.
- Set a deadline for real-time decisions with a deterministic fallback when the answer is late.

## Lesson transcript


### Intro (0:01)

Agents are where language models make the most decisions per minute: which tool, which file, ask or act, done or not. Most of those decisions are small. That's where a fast decision model belongs.

### Plus, not versus (0:15)

TypeSafe's founder is clear that this isn't a rivalry. The future, he says, is not going to be System One models versus LLMs. It's System One models plus code. And for agents, plus the LLM.

### Where it fits (0:30)

AWS built Strands Decider for exactly this. Its README lists the spots: route each task to the right model. Pick the next tool. Check a tool call's arguments before it runs. Triage, guardrails, cheap evaluations. And hybrid agents, where the LLM makes the hard decisions and a decider makes the rote ones.

### A gate before tools (0:53)

Here's the Strands example. The agent has a weather tool, and an eager system prompt. A user asks: what's the weather? No city. The agent guesses one and calls the tool. But before the call runs, a hook asks the decider two narrow questions. Are the argument values grounded in facts the user actually gave? Is it premature to call this tool before clarifying? A few lines of Python, and the agent goes back and asks which city.

```python
class GroundingGate(InterventionHandler):
    def before_tool_call(self, call, conversation):
        a = decider.ask(
            state={"conversation": conversation, "call": call},
            questions={
                "grounded": Noul("Are the argument values grounded "
                                 "in facts the user provided?"),
                "premature": Noul("Is it premature to call this tool "
                                  "before clarifying with the user?"),
            })
        if a["grounded"] < 0.5 or a["premature"] > 0.5:
            return Guide("Ask the user which city they mean.")
        return Proceed()
```


### Pick the right skill (1:22)

Skill selection is another big one. Agents usually stuff every skill description into the prompt and hope. TypeSafe tested an agent with a hundred eighty two skills. On its own, it loaded the wrong skill for sixteen point eight percent of requests that had a matching skill. With a decider ranking skills first, then rechecking the top three with their full text, that fell to seven point three percent. Needless loads fell from nine point eight to four.

### Ask the decider (1:51)

You can also hand the agent the decision model as a tool. Developer IndyDevDan gave his coding agent an ask Jev tool for yes or no and classification questions about files. The agent stopped reading whole files into its expensive context just to answer a simple question. His words: we delegated a QA task for file reading outside of my expensive language model to Jev.

### Real time (2:17)

And speed opens a new kind of agent: one that acts in real time. TypeSafe's demo plays Doom at ten decisions a second, which costs about seven dollars an hour. Opper's Pac-Man benchmark gives each decision a two second deadline: answer late, and a simple backup rule moves instead.

### Workflow or agent? (2:36)

Finally, step back. Anthropic separates workflows, where code defines the paths, from agents, where the LLM decides its own steps. A decision model makes workflows far more capable, because every node can now judge meaning. So before you build an agent, ask: could this be a workflow with smart nodes? If you can map the decision tree, it should be.

### Quick check (3:01)

**Quiz:** An agent calls a payment tool with an amount the user never said. Best fix?
A. Tell the agent in the prompt to be careful
B. A before-tool-call gate: “Is the amount grounded in what the user said?” → guide it back to ask
C. Ask the decider to choose the amount
D. Lower the model temperature
Answer: B. A narrow grounding question before the call catches invented arguments, and guiding the agent back makes it ask the user instead of guessing.


### Try it (3:15)

Try it. Have your agent add a decision model gate to its own tool calls.

```text
In our agent, add a hook that runs before every tool call. It sends the conversation and the proposed call to a decision model with narrow questions: are the argument values grounded in what the user said? is it premature to act before clarifying? is this tool appropriate for the request? If any check fails, hand the turn back to the agent with specific feedback instead of failing. Log the probabilities, and add a test where the user omits a required detail.
```


### Recap (3:20)

So: decision models go inside agents, not instead of them. Route, pick tools and skills, check arguments, decide when it's done. Gate risky calls and guide the agent back. And when you can map the decision tree, build a workflow with smart nodes. That's module five's first half. Next: turning judgments into data.

## Sources

- Modal: jev: on | Diogo Almeida founder of Typesafe AI, Runtime 2026 (at 6:53). https://www.youtube.com/watch?v=ip7Qej0ONoE&t=413s
- AnthropicAI: Building Effective AI Agents. https://www.anthropic.com/engineering/building-effective-agents
- AWS Strands Labs: strands-decider (README). https://github.com/strands-labs/strands-decider
- AWS Strands Labs: strands-decider: agent example. https://github.com/strands-labs/strands-decider/blob/main/examples/strands_README.md
- Marc Brooker; Mike Chambers; Fabio Nonato de Paula: Introducing Strands Decider 2B: a small, open source, decision model. https://strandsagents.com/blog/introducing-strands-decider/
- TypeSafe AI docs: Skill suggestion. https://docs.typesafe.ai/cookbooks/skill_suggestion
- IndyDevDan: 10 Levels of Jev For Agentic Engineers (at 21:20). https://www.youtube.com/watch?v=_U-O5lYhJ7Q&t=1280s
- Steve (Builder.io): Fake Jev demos are taking over the internet (at 7:36). https://www.youtube.com/watch?v=Spn-F83ZHH0&t=456s
- Diogo Almeida: Introducing System One Models & Jev. https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Opper AI: JevMan: a Pac-Man benchmark for decision models | Opper AI. https://opper.ai/jevman-benchmark/
- Hacker News commenters: Hacker News: Strands Decider 2B: a small, open-source, decision model. https://news.ycombinator.com/item?id=49987076
- The TWIML AI Podcast with Sam Charrington: Asking JEV's Creator the Hard Questions About This Hot New AI Model (at 73:49). https://www.youtube.com/watch?v=9Aato-NfjoU&t=4429s

License: CC BY 4.0 · https://github.com/Haple/system-one
