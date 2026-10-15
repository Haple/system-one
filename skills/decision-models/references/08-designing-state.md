# State: give it what it needs

The state is everything the model sees besides your questions. Here is how to shape it (named fields, paths the questions point at, the record next to the policy), what we measured when we buried the one thing that mattered, and the limits on length, language and context you should design around.

## Key ideas

- State is the material you would hand an expert panel before asking: the message, the record, the policy.
- Use a JSON object with named fields, and point each question at the field it is about with a backticked path.
- Unrelated text in its own named field barely hurt in our test; asking about one item buried by index among 40 similar ones dropped accuracy from 98% to 72%.
- Name the thing you are asking about: one item per request, or put the record in the question itself.
- Filter in code before you send; long context exists but is slower and less accurate, and English is still the strongest language.

## Practices for agents

- Send state as a JSON object with descriptive field names; reference fields in questions with backticked paths like `ticket.messages[0].text`.
- Put the decision's evidence (policy, record, history) in the state, and only what the questions need.
- Never make the model find one item by index in a long list of similar items; send that item on its own or inside the question.
- Write the complete question in instructions; question IDs are not sent to the model.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/designing-state.md
Video: https://learn-system-one.pages.dev/lessons/designing-state/
