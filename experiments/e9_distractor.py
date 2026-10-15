"""E9: context rot. 60 BANKING77 messages (30 refund-related, 30 not), one Noul 'Does `ticket` ask about a refund?'.
Arm A: state = {ticket}. Arm B: state = {ticket, policy: ~6k tokens of unrelated handbook text}. Arm C: ticket buried among
39 other tickets (state = {tickets: [...]}), question points at `tickets[k]`."""
import csv, json, random
from concurrent.futures import ThreadPoolExecutor
import s1client as s1
rows = list(csv.DictReader(open("data/banking77_test.csv")))
rng = random.Random(5)
pos = [r for r in rows if r["category"] in ("request_refund", "Refund_not_showing_up")]; neg = [r for r in rows if r["category"] not in ("request_refund", "Refund_not_showing_up", "cancel_transfer", "reverted_card_payment?")]
items = rng.sample(pos, 30) + rng.sample(neg, 30)
handbook = open("data/policy.txt").read() * 4
others = [r["text"] for r in rng.sample(neg, 200)]
def q(path): return {"refund": {"type": "noul", "instructions": f"Does `{path}` ask about a refund?"}}
def one(args):
    k, r = args; y = r in pos
    a = s1.ask({"ticket": r["text"]}, q("ticket"), tag="e9a")["answers"]["refund"]["noul"]
    b = s1.ask({"ticket": r["text"], "handbook": handbook}, q("ticket"), tag="e9b")["answers"]["refund"]["noul"]
    lst = rng.sample(others, 39); j = k % 40; lst.insert(j, r["text"])
    c = s1.ask({"tickets": lst}, q(f"tickets[{j}]"), tag="e9c")["answers"]["refund"]["noul"]
    return {"text": r["text"], "y": y, "a": a, "b": b, "c": c}
with ThreadPoolExecutor(6) as ex: res = list(ex.map(one, list(enumerate(items))))
json.dump(res, open("results/e9_distractor.json", "w"), indent=1)
for arm, name in [("a", "ticket only"), ("b", "+ ~6k tokens of unrelated handbook"), ("c", "buried among 40 tickets")]:
    acc = sum((x[arm] > 0.5) == x["y"] for x in res) / len(res)
    brier = sum((x[arm] - x["y"]) ** 2 for x in res) / len(res)
    mid = sum(0.2 < x[arm] < 0.8 for x in res)
    print(f"{name:40} acc {acc:.3f} brier {brier:.3f} unsure(0.2-0.8) {mid}")
