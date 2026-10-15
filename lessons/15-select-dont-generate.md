# Lesson 15: Select, don't generate

> A decision model can't write a value, but most extraction is really selection: the value is already in the text. Let code find the candidates and let the model pick one, then copy it verbatim. Here is that pattern for phone numbers, dates, search reranking, line-level search and deep taxonomies.

Course: System One (https://learn-system-one.pages.dev/) · Module 4: Composing judgments · 3 min · Watch: https://learn-system-one.pages.dev/lessons/select-dont-generate/

## Key takeaways

- Most extraction is selection: the value already exists in the source, so the model only has to pick it.
- Code finds candidates (regex, parser, search), the model chooses, code copies the value verbatim, so nothing is invented.
- Dates are parts: month, day and year are each a small Choice with a 'not stated' option; code assembles and does the arithmetic.
- Reranking is selection too: a cheap search finds candidates, one Noul per candidate scores relevance.
- Big taxonomies go level by level, keeping the best few paths instead of one greedy guess.

## Practices for coding agents

- For extraction, generate candidates in code and ask a Choice which candidate is the requested value; always include a none option.
- Extract dates as separate Choices for each part with 'not stated'; build and compare dates in code.
- Rerank search results with one relevance question per candidate and sort by probability.
- Walk hierarchical taxonomies level by level with a small beam of top paths.

## Lesson transcript


### Intro (0:01)

A decision model can't write. So how do you get a phone number, a date, or the right paragraph out of a document? You don't ask it to write the value. You let it choose.

### The pattern (0:13)

Here's the pattern. Most extraction is really selection, because the value is already sitting in the text. So code finds the candidates, with a regular expression, a parser or a search. The model picks the one you asked for. And code copies it verbatim. Nothing can be invented, because the model only ever chooses.

### Pick a value (0:35)

This email signature has three phone numbers: a finance desk, a direct line, and a support hotline. A regex finds all three. Then one Choice: which candidate is the twenty four seven support number? The hotline, at one point oh. Your code copies that exact string, and there's no way to get a digit wrong.

### Dates are parts (0:56)

Dates work the same way, part by part. Jev reads dates as text, not as numbers, so don't ask it which date is earlier. Ask three small Choices: which month, which day, which year, each with a not stated option. Here, March, the third, twenty twenty six. Then code builds the real date, and does every comparison.
The model's job ends at the parts. Building the date, checking it's valid, computing a renewal or a deadline, comparing two dates: that's arithmetic, and arithmetic belongs in code. If any part comes back not stated, or with low confidence, ask a person.

```python
m, d, y = (a[k].choice for k in ("start_month", "start_day", "start_year"))
if "not_stated" in (m, d, y) or min(a[k].confidence for k in a) < 0.8:
    return send_to_review(doc)
start = date(int(y), MONTHS.index(m) + 1, int(d))   # validates, too
renewal = start.replace(year=start.year + 1)
days_left = (renewal - today).days                  # code, not the model
```


### Rerank (1:38)

Search is selection too. In a TypeSafe cookbook, a cheap keyword search found thirty candidate passages for each of forty legal questions. The right one was always in the list, but it came first only five percent of the time. One Noul per candidate, is this passage relevant, then sort by probability. Now the right passage came first eighteen percent of the time, and in the top ten sixty two percent.

### Find the line (2:05)

You can even point at lines. Another cookbook numbers the two hundred eighteen lines of GitHub's terms of service, and uses them as the options of a single Choice: which line answers this question? Plus one Noul: does the document answer it at all? Search without generating a word.

### Deep taxonomies (2:24)

And for taxonomies with thousands of leaves, like patent classes or product categories, go level by level. At each level, a Choice picks among the children. Keep the best few paths, not just one, so a near miss early on can recover. That's a beam search over the model's probabilities.

### Quick check (2:43)

**Quiz:** Get the invoice total from extracted PDF text. The select-don't-generate way?
A. Ask a Score for the amount, from 0 to 10,000
B. Regex every money amount, ask a Choice which one is the total (plus “none”), copy it
C. Ask a Noul for each possible number from 1 to 10,000
D. Ask the model to type the total
Answer: B. Code finds the candidates, the model picks the one that's the total, and code copies it exactly. The model never has to produce digits.


### Try it (2:56)

Try it. Have your agent replace one generated extraction in your code with find, choose, copy.

```text
Find one place where we ask an LLM to extract a value (an amount, email,
ID, date, name) from text. Replace it with select-don't-generate: candidates from regex/parsing in code, one Choice that picks the requested candidate (always with a "none" option), and code that copies the chosen string verbatim and normalizes it. For dates, ask month/day/
year as separate Choices with "not_stated". Compare both versions on
50 real documents.
```


### Recap (3:04)

So: when you need a value, select it, don't generate it. Code finds candidates, the model picks, code copies. Dates are parts. Reranking and line search are selection. And deep taxonomies go level by level. Next: using decision models to check other models' work.

## Sources

- TypeSafe AI docs: Pre-parsed value extraction. https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook
- TypeSafe AI docs: Date extraction. https://docs.typesafe.ai/cookbooks/date_extraction_cookbook
- TypeSafe AI docs: Re-ranking. https://docs.typesafe.ai/cookbooks/rerank_typesafe
- TypeSafe AI docs: Line-by-line search. https://docs.typesafe.ai/cookbooks/semantic_find
- TypeSafe AI docs: Hierarchical classification. https://docs.typesafe.ai/cookbooks/hierarchical_classification
- TypeSafe AI docs: Structure recovery. https://docs.typesafe.ai/cookbooks/autoformat
- TypeSafe AI docs: Jev 1.13 jaggedness. https://docs.typesafe.ai/model-jaggedness/jev-1.13
- Simon Willison: Jev introduces a new shape of LLM—System One, aka Decision Models. https://simonwillison.net/2026/Sep/21/jev/
- TypeSafe AI: TypeSafe agent skill (SKILL.md). https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md

License: CC BY 4.0 · https://github.com/Haple/system-one
