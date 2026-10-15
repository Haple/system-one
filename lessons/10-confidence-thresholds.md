# Lesson 10: Confidence and thresholds

> The answer tells you what; the probability tells you whether to act. Here is the three-path pattern (act, confirm, escalate), why thresholds should differ by action, a one-line formula that turns the cost of mistakes into a threshold, and the one thing thresholds cannot protect you from.

Course: System One (https://learn-system-one.pages.dev/) · Module 3: Probabilities you can act on · 4 min · Watch: https://learn-system-one.pages.dev/lessons/confidence-thresholds/

## Key takeaways

- Use probability as a second axis: the answer says what to do, the probability says whether to do it now.
- Three paths: act automatically, ask to confirm, or escalate to a person or a slower model.
- Thresholds belong to actions, not to the model: a read-only action can go at 0.6, a money transfer may need 0.85 and a confirmation.
- With calibrated probabilities, act when p exceeds cost of a false action ÷ (cost of a false action + cost of a missed one).
- Confidence can't flag inputs the model doesn't understand at all; check that inputs are in scope before you trust the number.

## Practices for coding agents

- Gate every automated action on its own threshold, set by the cost of acting wrongly versus missing a true case.
- Keep thresholds as named constants in code with a comment explaining their cost reasoning, and log the probability with each action.
- Send the middle band to confirmation or human review instead of guessing.
- Detect out-of-scope inputs (wrong language, unknown domain) before the decision, because confidence will not catch them.

## Lesson transcript


### Intro (0:01)

A probability on its own doesn't do anything. Your code turns it into behavior with thresholds. This lesson is about where to put them, and why.

### A second axis (0:11)

Here's the idea in one line, from the TypeSafe docs. Use confidence as a second axis. The answer tells you what. Confidence tells you whether to act.

### Three paths (0:23)

That gives you three paths. When the model is sure, act automatically. When it's fairly sure, ask the user to confirm, or gather more information. And when it isn't, hand the case to a person, or to a slower, smarter model. Watch where each request goes.

### Thresholds per action (0:41)

But one threshold for everything is a mistake. Thresholds belong to actions. In this voice banking example, checking a balance is harmless if it's wrong, so point six is enough. Approving a transfer is not, so it needs point eight five to go through, and anything less gets a spoken confirmation. And below point six, nothing happens without a person.

```python
intent = answers["intent"]
if intent.confidence < 0.6:
    route_to_support_agent(account)        # genuinely unsure
elif intent.choice == "check_balance":
    show_balance(account)                  # low stakes: 0.6 is fine
elif intent.choice == "approve_transfer":
    if intent.confidence > 0.85:
        approve_transfer(account)          # high stakes, high confidence
    else:
        ask_user_to_confirm(account)       # high stakes, moderate
```


### A threshold from costs (1:06)

Where should a threshold sit? There's a formula, from decision theory. If acting on a false yes costs C false, and missing a true yes costs C miss, act when the probability is above C false divided by C false plus C miss. It assumes the probability is calibrated, which is why lesson nine came first.
Two examples. Auto-approving a refund that wasn't owed costs you forty dollars, and making a real refund wait for review costs about ten. Forty over fifty: act above point eight. Now a safety report. A false alarm costs a minute of someone's time, a missed one could cost a hundred times more. One over a hundred and one: flag anything above about point oh one.
Developer Daniel Sam put the attitude well. Fifty percent is a coin toss you ignore. Ninety five percent is a bet you take. Thresholds should scale with the cost of being wrong.

### Who owns the threshold (2:09)

Some see this as a catch. Armin Ronacher put it as delegating the hallucination problem a little bit to the user. He's right, and that's the deal. The threshold is a business decision, and now it's yours: written in code, readable, and changeable in one line.

### What thresholds can't catch (2:27)

One thing thresholds can't do. The author of Laya, an open decision model, fed its English model text in other languages. Accuracy collapsed, all the way to zero on some, but its average confidence never dropped below point eight eight five. A model can be confidently lost. Check that inputs are in scope before you trust the number.

### Quick check (2:50)

**Quiz:** A wrong auto-close costs 9× a needless review. Threshold?
A. 0.5
B. 0.75
C. 0.9
D. 0.99
Answer: C. C_false ÷ (C_false + C_miss) = 9 ÷ (9 + 1) = 0.9. Auto-close above 0.9; review the rest.


### Try it (3:07)

Try it. Have your agent write the threshold policy for one decision, with the cost reasoning in the code.

```text
For one automated decision in this codebase, write a threshold policy:
- list each action it can trigger and estimate the cost of a wrong
  action vs a missed one (ask me if you can't infer them)
- compute each threshold as C_false / (C_false + C_miss)
- add a review band that goes to a person or a slower model
- add a check that rejects out-of-scope inputs before the decision
Put thresholds in named constants with the cost reasoning in comments, and log probability, threshold and action for every decision.
```


### Recap (3:14)

So: the answer says what, the probability says whether. Act, confirm, or escalate. Give every action its own threshold, set by what mistakes cost. And check that inputs are in scope, because a model can be confidently lost. Next: how much can you automate, and how to pick thresholds from data.

## Sources

- TypeSafe AI docs: Confidence-gated routing. https://docs.typesafe.ai/patterns/confidence-routing
- TypeSafe AI docs: Confidence. https://docs.typesafe.ai/confidence
- elkan-cost-sensitive. https://cseweb.ucsd.edu/~elkan/rescale.pdf
- Daniel Sam: The Model That Doesn't Talk. https://dev.to/danielsamfdo/the-model-that-doesnt-talk-5adm
- Flavio Copes: How to build typed decisions with Jev. https://flaviocopes.com/jev/
- The TWIML AI Podcast with Sam Charrington: Asking JEV's Creator the Hard Questions About This Hot New AI Model (at 50:55). https://www.youtube.com/watch?v=9Aato-NfjoU&t=3055s
- IBM Technology: What Is Jev? The AI Model That Doesn't Generate Text (at 12:16). https://www.youtube.com/watch?v=YGgNBcIgI4s&t=736s
- InfoQ: TypeSafe AI Releases Jev: a Decision-Only Model That Returns Typed Probabilities. https://www.infoq.com/news/2026/10/typesafe-ai-jev-released/
- Laya — 33ms Multilingual System 1 Decision Engine. https://laya.convaiinnovations.com/
- IBM Technology: Building Decision Agents with LLMs & Machine Learning Models (at 10:35). https://www.youtube.com/watch?v=mRkJTXDromw&t=635s
- Ryan Porter: The OpenAI Decisions API Needs a Confidence You Can Trust | Anthus. https://anth.us/blog/openai-decisions-api-preview/

License: CC BY 4.0 · https://github.com/Haple/system-one
