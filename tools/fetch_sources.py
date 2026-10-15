#!/usr/bin/env python3
"""Fetch research/fetch_list.tsv -> sources/fetched/<id>.{html|pdf} and sources/fetched/<id>.md (clean text).
Skips ids already fetched. PDFs -> text via pdftotext if available."""
import csv, os, subprocess, sys, json, time
import trafilatura
R = os.path.expanduser("~/system-one")
OUT = f"{R}/sources/fetched"; os.makedirs(OUT, exist_ok=True)
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
rows = list(csv.DictReader(open(f"{R}/research/fetch_list.tsv"), delimiter="\t"))
meta = {}
mf = f"{OUT}/_meta.json"
if os.path.exists(mf): meta = json.load(open(mf))
for r in rows:
    sid, url = r["id"], r["url"]
    md = f"{OUT}/{sid}.md"
    if os.path.exists(md) and os.path.getsize(md) > 300 and "--force" not in sys.argv: continue
    is_pdf = url.lower().endswith(".pdf")
    raw = f"{OUT}/{sid}.{'pdf' if is_pdf else 'html'}"
    subprocess.run(["curl", "-sL", "--max-time", "60", "-A", UA, url, "-o", raw])
    text, head = "", {}
    try:
        if is_pdf or open(raw, "rb").read(5) == b"%PDF-":
            text = subprocess.run(["pdftotext", "-layout", raw, "-"], capture_output=True, text=True).stdout
        else:
            h = open(raw, errors="ignore").read()
            text = trafilatura.extract(h, output_format="markdown", include_tables=True, favor_recall=True) or ""
            m = trafilatura.extract_metadata(h)
            head = {"title": getattr(m, "title", None), "author": getattr(m, "author", None), "date": getattr(m, "date", None), "sitename": getattr(m, "sitename", None)}
    except Exception as e:
        print("ERR", sid, e)
    open(md, "w").write(text)
    meta[sid] = {"id": sid, "kind": r["kind"], "url": url, **head, "chars": len(text)}
    print(f"{len(text):>7} {sid:32} {str(head.get('title'))[:70]}", flush=True)
    time.sleep(0.5)
json.dump(meta, open(mf, "w"), indent=1)
