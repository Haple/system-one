#!/usr/bin/env python3
"""Raw HTML files -> clean markdown text (trafilatura). usage: extract_html.py <in.html>... --out DIR"""
import sys, os, trafilatura, json
args = sys.argv[1:]; out = args[args.index("--out") + 1]; files = [a for a in args if a.endswith(".html")]
os.makedirs(out, exist_ok=True)
for f in files:
    raw = open(f, errors="ignore").read()
    md = trafilatura.extract(raw, output_format="markdown", include_links=False, include_tables=True, include_comments=False, favor_recall=True) or ""
    meta = trafilatura.extract_metadata(raw)
    head = {"title": getattr(meta, "title", None), "author": getattr(meta, "author", None), "date": getattr(meta, "date", None), "url": getattr(meta, "url", None), "sitename": getattr(meta, "sitename", None)}
    dst = os.path.join(out, os.path.basename(f).replace(".html", ".md"))
    open(dst, "w").write("---\n" + "\n".join(f"{k}: {v}" for k, v in head.items()) + "\n---\n\n" + md)
    print(f"{len(md):>7}  {head['title']!r:.80}  {head['date']}  -> {dst}")
