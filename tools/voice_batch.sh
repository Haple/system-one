#!/usr/bin/env bash
# voice several lessons sequentially: tools/voice_batch.sh 02-two-systems 03-how-it-works ...
cd ~/system-one
: "${FAL_KEY:?set FAL_KEY (fal.ai key) first}"
for id in "$@"; do
  echo "== $id"; node tools/voice.mjs course/lessons/$id.json 2>&1 | tail -2
done
echo VOICE_BATCH_DONE
