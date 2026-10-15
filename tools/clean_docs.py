#!/usr/bin/env python3
"""Strip Mintlify boilerplate (index header, inline JSX component definitions, footer) from fetched docs."""
import os, re, sys
src, dst = sys.argv[1], sys.argv[2]
os.makedirs(dst, exist_ok=True)
for f in sorted(os.listdir(src)):
    t = open(os.path.join(src, f)).read()
    t = re.sub(r"^> ## Documentation Index\n(> .*\n)+\n?", "", t)
    # drop "export function X(...) { ... }" blocks: from 'export function' to a line that is exactly '}' at column 0
    t = re.sub(r"(?ms)^export (?:function|const) .*?^\}\s*;?\s*$\n?", "", t)
    t = t.replace("This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.", "")
    t = re.sub(r"\n{3,}", "\n\n", t).strip() + "\n"
    open(os.path.join(dst, f), "w").write(t)
    print(f"{len(t):>7} {f}")
