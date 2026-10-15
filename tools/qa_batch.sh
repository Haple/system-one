#!/usr/bin/env bash
# stills (landscape + portrait) for several lessons: tools/qa_batch.sh 05-noul 06-choice ...
cd ~/system-one
for id in "$@"; do
  node tools/stills.mjs /data/$id.json qa/stills/$id --scale 0.35 2>&1 | tail -3
  node tools/stills.mjs /data/$id.json qa/stills/$id-p --portrait --scale 0.25 2>&1 | tail -2
done
echo QA_BATCH_DONE
