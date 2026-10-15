# Select, don't generate

A decision model can't write a value, but most extraction is really selection: the value is already in the text. Let code find the candidates and let the model pick one, then copy it verbatim. Here is that pattern for phone numbers, dates, search reranking, line-level search and deep taxonomies.

## Key ideas

- Most extraction is selection: the value already exists in the source, so the model only has to pick it.
- Code finds candidates (regex, parser, search), the model chooses, code copies the value verbatim, so nothing is invented.
- Dates are parts: month, day and year are each a small Choice with a 'not stated' option; code assembles and does the arithmetic.
- Reranking is selection too: a cheap search finds candidates, one Noul per candidate scores relevance.
- Big taxonomies go level by level, keeping the best few paths instead of one greedy guess.

## Practices for agents

- For extraction, generate candidates in code and ask a Choice which candidate is the requested value; always include a none option.
- Extract dates as separate Choices for each part with 'not stated'; build and compare dates in code.
- Rerank search results with one relevance question per candidate and sort by probability.
- Walk hierarchical taxonomies level by level with a small beam of top paths.

Full lesson (Markdown): https://learn-system-one.pages.dev/lessons/select-dont-generate.md
Video: https://learn-system-one.pages.dev/lessons/select-dont-generate/
