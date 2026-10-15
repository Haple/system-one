#!/usr/bin/env bash
# Sequential Supadata fetch (parallel => 429). Skips existing.
cd ~/system-one
while read -r id; do
  [ -z "$id" ] && continue
  out="sources/transcripts/$id.json"
  if [ -s "$out" ] && jq -e '.text|length>200' "$out" >/dev/null 2>&1; then echo "skip $id"; continue; fi
  for attempt in 1 2; do
    uv run supadata.py  # a Supadata API client; set SUPADATA_API_KEY transcript "https://www.youtube.com/watch?v=$id" --chunks --mode native --wait-timeout 300 > "$out.tmp" 2> "$out.err"
    if jq -e '.text|length>200' "$out.tmp" >/dev/null 2>&1; then mv "$out.tmp" "$out"; echo "ok $id $(jq '.text|length' $out) chars"; break; fi
    echo "fail $id attempt $attempt: $(head -c 300 $out.tmp) $(tail -c 300 $out.err)"; sleep 8
  done
  sleep 2
done < sources/selected.txt
echo DONE_EXIT_0
