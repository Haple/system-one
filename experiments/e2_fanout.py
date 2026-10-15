"""E2: one request with 13 questions vs 13 single-question requests over the same long state (latency, tokens, answers).
Runs each arm 5 times, uncached. State: a ~3k-token policy document."""
import json, time, statistics as st
from concurrent.futures import ThreadPoolExecutor
import s1client as s1
state = {"ticket": {"from": "customer", "text": "Hi, I was charged twice for order A-104 last Thursday and I still can't log in since your update. This is the third time I'm writing. If this isn't fixed today I'm cancelling. Also, would be great if you supported Apple Pay."},
         "customer": {"plan": "Pro annual", "tenure_months": 26, "open_orders": [{"id": "A-104", "status": "delivered", "charges": [{"amount_usd": 49, "status": "captured"}, {"amount_usd": 49, "status": "captured"}]}]},
         "policy": open("data/policy.txt").read()}
Q = {
 "category": {"type": "choice", "instructions": "What is the main request in `ticket.text`?", "criteria": {"billing": "Charges, invoices, refunds", "account": "Login, access, security", "feature_request": "Asks for new functionality", "bug_report": "Something is broken"}},
 "refund_requested": {"type": "noul", "instructions": "Does `ticket.text` explicitly ask for a refund or credit?"},
 "duplicate_charge": {"type": "noul", "instructions": "Do `ticket.text` and `customer.open_orders[0].charges` indicate a duplicate charge?"},
 "policy_allows_refund": {"type": "noul", "instructions": "Does `policy` allow a refund for a duplicate charge?"},
 "login_problem": {"type": "noul", "instructions": "Does `ticket.text` report a problem logging in?"},
 "repeat_contact": {"type": "noul", "instructions": "Has the customer contacted support about this before?"},
 "churn_threat": {"type": "noul", "instructions": "Does `ticket.text` threaten to cancel or leave?"},
 "feature_request": {"type": "noul", "instructions": "Does `ticket.text` ask for a new feature?"},
 "mentions_order": {"type": "noul", "instructions": "Does `ticket.text` refer to an order in `customer.open_orders`?"},
 "frustration": {"type": "score", "instructions": "How frustrated does the customer appear in `ticket.text`?", "criteria": ["Calm and matter-of-fact", "Frustrated but civil", "Very angry or threatening to leave"]},
 "urgency": {"type": "score", "instructions": "How time-sensitive is the request in `ticket.text`?", "criteria": ["No time pressure", "Wants it soon", "Demands a fix today"]},
 "needs_human": {"type": "noul", "instructions": "Would a reasonable support lead want a person to handle this ticket?"},
 "policy_escalation": {"type": "noul", "instructions": "Does `policy` require escalating a customer who threatens to cancel?"},
}
def run_batched():
    r = s1.ask(state, Q, provider="jev", model="jev-1.13.0", cache=False); return r["latency_s"], r["usage"]["input_tokens"], r["answers"]
def run_single(k):
    r = s1.ask(state, {k: Q[k]}, provider="jev", model="jev-1.13.0", cache=False); return r["latency_s"], r["usage"]["input_tokens"], r["answers"][k]
out = {"batched": [], "sequential": [], "concurrent": []}
for rep in range(5):
    lat, tok, ans = run_batched(); out["batched"].append({"lat": lat, "tok": tok, "ans": ans})
    t0 = time.perf_counter(); res = [run_single(k) for k in Q]; wall = time.perf_counter() - t0
    out["sequential"].append({"lat": wall, "tok": sum(x[1] for x in res), "ans": {k: x[2] for k, x in zip(Q, res)}})
    t0 = time.perf_counter()
    with ThreadPoolExecutor(13) as ex: res = list(ex.map(run_single, Q))
    wall = time.perf_counter() - t0
    out["concurrent"].append({"lat": wall, "tok": sum(x[1] for x in res), "ans": {k: x[2] for k, x in zip(Q, res)}})
    print(rep, {k: (round(v[-1]["lat"], 2), v[-1]["tok"]) for k, v in out.items()}, flush=True)
json.dump(out, open("results/e2_fanout.json", "w"), indent=1)
for k, v in out.items(): print(k, "median latency", round(st.median(x["lat"] for x in v), 3), "tokens", v[0]["tok"])
