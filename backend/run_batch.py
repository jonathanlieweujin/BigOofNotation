"""
Batch pipeline: data/synthetic_saas_*.csv -> output/diagnoses.json

Usage:
    python run_batch.py                     # full run
    python run_batch.py --gemini-limit 15    # cheap smoke test: only the
                                              # first 15 customers that clear
                                              # the action threshold get a
                                              # real Gemini call
    python run_batch.py --customers 50       # only load the first 50
                                              # customers from the CSV

Emotion classification always runs on every feedback row (that's the local
HF model, free and fast). Gemini is the expensive/slow step, so it's the
one with its own limit flag and the one skipped outright for LOW-tier
customers regardless of any limit -- see pipeline design notes in
gemini_diagnose.py.
"""

import argparse
import csv
import json
import os
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv(Path(__file__).parent / ".env")

import emotion_model
import gemini_diagnose
import pipeline
import scoring

DATA_DIR = Path(__file__).parent.parent / "data"  # shared dataset, repo root
OUT_DIR = Path(__file__).parent / "output"


def load_customers(limit=None):
    with open(DATA_DIR / "synthetic_saas_customers.csv", newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    if limit:
        rows = rows[:limit]
    return {r["customer_id"]: r for r in rows}


def load_feedback():
    with open(DATA_DIR / "synthetic_saas_feedback.csv", newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def run_emotion_model(feedback_rows):
    texts = [r["text"] for r in feedback_rows]
    print(f"Running {emotion_model.MODEL_NAME} on {len(texts)} feedback rows...")
    t0 = time.time()
    predictions = emotion_model.classify_batch(texts)
    print(f"  done in {time.time() - t0:.1f}s")

    for row, pred in zip(feedback_rows, predictions):
        row["emotion"] = pred
    return feedback_rows


def group_by_customer(feedback_rows):
    grouped = defaultdict(list)
    for r in feedback_rows:
        grouped[r["customer_id"]].append(r)
    return grouped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--customers", type=int, default=None, help="cap number of customers loaded")
    ap.add_argument("--gemini-limit", type=int, default=None, help="cap number of Gemini calls")
    ap.add_argument("--skip-gemini", action="store_true", help="evidence/scoring only, no Gemini calls")
    ap.add_argument("--workers", type=int, default=8, help="concurrent Gemini calls")
    args = ap.parse_args()

    customers = load_customers(limit=args.customers)
    feedback = load_feedback()
    feedback = [r for r in feedback if r["customer_id"] in customers]
    feedback = run_emotion_model(feedback)
    grouped = group_by_customer(feedback)

    # Score every customer first (cheap, local). This decides who's even
    # eligible for a Gemini call -- LOW tier never gets one.
    scored_customers = []
    for cust_id, customer in customers.items():
        rows = grouped.get(cust_id, [])
        scored = scoring.score_customer(rows)
        scored_customers.append((customer, scored))

    # Prioritise the worst signals first, per "bad emotions first" -- if
    # --gemini-limit is set, spend it on the customers most likely to
    # actually be at risk, not in CSV order.
    scored_customers.sort(key=lambda cs: cs[1]["score"], reverse=True)

    eligible = [cs for cs in scored_customers if cs[1]["tier"] != "LOW"]
    print(f"{len(eligible)}/{len(scored_customers)} customers cleared the action threshold (MEDIUM/HIGH).")

    to_call = [] if args.skip_gemini else eligible
    if args.gemini_limit is not None:
        to_call = to_call[: args.gemini_limit]

    gemini_results = {}
    gemini_calls = 0
    if to_call:
        gemini_diagnose._get_client()  # init once before spawning threads

        def _call(customer, scored):
            return customer["customer_id"], gemini_diagnose.diagnose(
                customer, scored["evidence"], scored["negative_rows"]
            )

        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            futures = [pool.submit(_call, c, s) for c, s in to_call]
            for fut in tqdm(as_completed(futures), total=len(futures), desc="Diagnosing (Gemini)"):
                try:
                    cust_id, result = fut.result()
                    gemini_results[cust_id] = result
                    gemini_calls += 1
                except Exception as e:
                    print(f"  [warn] Gemini call failed: {e}")

    records = [
        pipeline.build_customer_record(
            customer, scored, gemini_results.get(customer["customer_id"])
        )
        for customer, scored in scored_customers
    ]

    # Ranked by expected value of intervening, matching the frontend's
    # rankedAccounts() in HardCodedData.js.
    records.sort(key=lambda r: r["confidence_score"] * r["ltv"], reverse=True)

    OUT_DIR.mkdir(exist_ok=True)
    out_path = OUT_DIR / "diagnoses.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    tier_counts = defaultdict(int)
    for r in records:
        tier_counts[r["tier"]] += 1
    acted = sum(1 for r in records if r["recommended"])
    print(f"\nWrote {len(records)} records to {out_path}")
    print(f"Tiers: {dict(tier_counts)}")
    print(f"Gemini calls made: {gemini_calls}")
    print(f"Records with a committed recommended action: {acted}")


if __name__ == "__main__":
    main()
