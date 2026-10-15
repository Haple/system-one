# Lesson 8: State: give it what it needs

> The state is everything the model sees besides your questions. Here is how to shape it (named fields, paths the questions point at, the record next to the policy), what we measured when we buried the one thing that mattered, and the limits on length, language and context you should design around.

Course: System One (https://learn-system-one.pages.dev/) · Module 2: Asking good questions · 4 min · Watch: https://learn-system-one.pages.dev/lessons/designing-state/

## Key takeaways

- State is the material you would hand an expert panel before asking: the message, the record, the policy.
- Use a JSON object with named fields, and point each question at the field it is about with a backticked path.
- Unrelated text in its own named field barely hurt in our test; asking about one item buried by index among 40 similar ones dropped accuracy from 98% to 72%.
- Name the thing you are asking about: one item per request, or put the record in the question itself.
- Filter in code before you send; long context exists but is slower and less accurate, and English is still the strongest language.

## Practices for coding agents

- Send state as a JSON object with descriptive field names; reference fields in questions with backticked paths like ticket.messages[0].text.
- Put the decision's evidence (policy, record, history) in the state, and only what the questions need.
- Never make the model find one item by index in a long list of similar items; send that item on its own or inside the question.
- Write the complete question in instructions; question IDs are not sent to the model.

## Lesson transcript


### Intro (0:01)

Every request has two halves: your questions, and the state they're asked about. Most failures we'll see in this course start on the state side. So let's shape it well.

### What state is (0:12)

The TypeSafe docs have a good image for it. Think of the state as the material you'd present to a panel of experts before asking them to make a judgment. The customer's message. Their order. The policy that applies. Everything an expert would need, and nothing they wouldn't.

### Shapes of state (0:30)

State can be a plain string, which is fine for one message. An array works for a sequence, like a conversation. But for most real decisions, use an object, so every part has a name and the relationships stay clear.

### Point at the field (0:45)

Then point each question at the field it's about, with a path in backticks. Does the policy support the refund requested in the ticket, given the order's charges? The model knows exactly which parts to compare.

### Bury it, lose it (0:58)

How much does extra material hurt? We tested sixty banking messages, half of them about refunds, with one Noul: does the ticket ask about a refund? Alone, ninety eight percent right. With six thousand tokens of unrelated handbook in its own field: still ninety eight. But bury the same ticket among forty similar tickets and ask about ticket number seventeen, and it drops to seventy two, missing seventeen of the thirty refund requests.
So the lesson isn't just keep the state short. It's name the thing you're asking about. Don't make the model hunt for item seventeen in a list of lookalikes. Send that item on its own, or put it right in the question.

### Data in the question (1:43)

Questions can carry data too. To check a new resume against candidate records, put each record inside its own question's instructions, next to the same question text. Twenty records, twenty Nouls, one request, and each answer is about exactly one record.

```python
SAME = "Is the resume for the same person as `potential_duplicate`?"

questions = {
    f"same_as_{c['id']}": Noul(instructions={
        "potential_duplicate": {"name": c["name"],
                                "location": c["location"]},
        "question": SAME,
    })
    for c in candidates          # one question per record
}
client.system_one(state={"resume": resume}, questions=questions)
```


### Limits to design around (2:01)

A few limits to design around. Question IDs aren't sent to the model, so write the full question in the instructions. Jev reads up to sixty four thousand tokens per request, and thirty two thousand for the state plus any one question. Long context can be turned on, but TypeSafe warns it's slower and less accurate. And English is still the strongest language, so test others before you rely on them.

### Facts vs judgments (2:27)

One last habit, from TypeSafe's own guide for coding agents. When you store answers and feed them into later requests, keep what you observed separate from what the model inferred. A field that says refund requested, point nine nine, is a judgment, not a fact. Label it, and check it's still fresh before you act on it.

### Quick check (2:49)

**Quiz:** Is ticket 17 of 40 asking for a refund? Best state?
A. All 40 tickets in an array; ask about tickets[17]
B. All 40 tickets plus the refund policy, for context
C. Ticket 17 alone, as a named field; ask about that field
D. A summary of all 40 tickets
Answer: C. In our test, asking about one ticket by index among 40 lookalikes missed 17 of 30 refunds. Send the item you're asking about on its own, under a clear name.


### Try it (3:02)

Try it. Have your agent design the state for one decision in your code, and test what happens when you bury it.

```text
Pick one decision we make with a model. Design its state as a JSON
object with named fields: only what an expert would need (the message, the record, the relevant policy). Rewrite each question to point at its field with a backticked path. Then run 20 labeled examples three ways: the clean state, the state plus a large unrelated document in its own field, and the item hidden in a list of 20 similar items. Report the accuracy of each.
```


### Recap (3:10)

So: state is what you'd hand an expert panel. Use named fields and point questions at them. Name the thing you're asking about, and never make the model hunt for it. Design around the limits, and keep judgments separate from facts. That's module two. Next: probabilities you can act on, starting with calibration.

## Sources

- TypeSafe AI docs: State. https://docs.typesafe.ai/concepts/state
- TypeSafe AI docs: Primitives (Questions). https://docs.typesafe.ai/primitives
- TypeSafe AI docs: How to build with TypeSafe. https://docs.typesafe.ai/concepts/how-to-build-with-system-one
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- TypeSafe AI docs: Models. https://docs.typesafe.ai/models
- TypeSafe AI docs: Noul. https://docs.typesafe.ai/primitives/noul
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md
- Diogo Almeida with swyx: Jev: System One models for Prod, not God (Latent Space podcast). https://www.latent.space/p/jev
- Ki-jung Kim (akaslany): Why We Made Jev — Diogo Almeida, TypeSafe Co-founder & CEO (at 6:29). https://www.youtube.com/watch?v=RW_0PqUFq3w&t=389s

License: CC BY 4.0 · https://github.com/Haple/system-one
