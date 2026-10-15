#!/usr/bin/env bash
# portrait stills only: tools/qa_portrait.sh 05-noul ...
cd ~/system-one
for id in "$@"; do node tools/stills.mjs /data/$id.json qa/stills/$id-p --portrait --scale 0.25 2>&1 | tail -1; done
echo QA_PORTRAIT_DONE
