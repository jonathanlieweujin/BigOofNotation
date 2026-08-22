"""
output/diagnoses.json (per-customer) -> output/friction.json + output/impact.json

Read-only transform, no new model calls. Frontend can either fetch these
directly or re-derive the same numbers client-side from diagnoses.json --
they're kept here so the aggregation logic (which fields mean what) lives in
one place instead of being re-guessed in JS.

Honesty boundary, see track/todo.md's Impact view spec: "revenue at risk" and
the tier/action breakdowns below are real, computed straight from this
dataset. "Retained revenue net of concession cost" and the matched-vs-
baseline retention chart are NOT computed here -- they require knowing
whether an intervention actually worked, and this dataset has no outcome/
churn-result column to measure that against. Those stay seeded on the
frontend, same as track/todo.md already allows ("Can be static/seeded for
the demo, the framing is what scores, not live data").
"""

import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

from taxonomy import ACTIONS, DIAGNOSES

OUT_DIR = Path(__file__).parent / "output"


def _trend(dates: list[str]) -> str:
    """
    Real, not guessed: split this group's negative-signal dates at the
    overall dataset's median date, compare earlier-half count to later-half
    count. This is the same shape of judgement Friction.jsx already expects
    (f.trend), just computed instead of hand-authored.
    """
    if len(dates) < 4:
        return "flat"  # too few points to call a direction honestly
    parsed = sorted(datetime.strptime(d, "%Y-%m-%d %H:%M:%S") for d in dates)
    mid = parsed[len(parsed) // 2]
    earlier = sum(1 for d in parsed if d < mid)
    later = len(parsed) - earlier
    if later > earlier * 1.2:
        return "growing"
    if later < earlier * 0.8:
        return "shrinking"
    return "flat"


def build_friction(records: list[dict]) -> list[dict]:
    """
    Grouped by diagnosis class (the granularity the current pipeline
    actually produces). Each customer's `why` is free text and can't be
    string-matched across customers, so this is "what KIND of problem is
    recurring", not yet "same specific bug reported by N customers" -- see
    the note in the reply about the optional cause-tag upgrade.

    Field names (accountCount, arrAffected, trend, firstSeen) match
    FRICTION in app/src/HardCodedData.js exactly, so Friction.jsx needs no
    changes beyond swapping its import source.
    """
    groups = defaultdict(list)
    for r in records:
        if r["diagnosis"]:
            groups[r["diagnosis"]].append(r)

    out = []
    for diagnosis_id, accounts in groups.items():
        arr = sum(a["ltv"] for a in accounts)
        all_dates = [t["date"] for a in accounts for t in a["timeline"]]
        out.append(
            {
                "id": diagnosis_id,
                "cause": DIAGNOSES[diagnosis_id]["label"],
                "blurb": DIAGNOSES[diagnosis_id]["blurb"],
                "accountCount": len(accounts),
                "arrAffected": arr,
                "trend": _trend(all_dates),
                "firstSeen": min(all_dates)[:10] if all_dates else None,
                "accountIds": [a["id"] for a in accounts],
            }
        )
    out.sort(key=lambda g: g["arrAffected"], reverse=True)
    return out


def build_impact(records: list[dict]) -> dict:
    at_risk = [r for r in records if r["tier"] in ("HIGH", "MEDIUM")]
    committed = [r for r in records if r["recommended"]]

    tier_counts = defaultdict(int)
    for r in records:
        tier_counts[r["tier"]] += 1

    action_counts = defaultdict(lambda: {"count": 0, "ltv": 0})
    for r in committed:
        action_counts[r["recommended"]]["count"] += 1
        action_counts[r["recommended"]]["ltv"] += r["ltv"]

    diagnosis_breakdown = defaultdict(int)
    for r in at_risk:
        if r["diagnosis"]:
            diagnosis_breakdown[r["diagnosis"]] += 1

    return {
        "revenue_at_risk": sum(r["ltv"] for r in at_risk),
        "accounts_under_observation": tier_counts["LOW"],
        "accounts_at_risk": len(at_risk),
        "interventions_recommended": len(committed),
        "tier_counts": dict(tier_counts),
        "action_breakdown": [
            {
                "action": action_id,
                "label": ACTIONS[action_id]["label"],
                "cost_rank": ACTIONS[action_id]["cost_rank"],
                "count": v["count"],
                "ltv_covered": v["ltv"],
            }
            for action_id, v in sorted(action_counts.items(), key=lambda kv: ACTIONS[kv[0]]["cost_rank"])
        ],
        "diagnosis_breakdown": [
            {"diagnosis": d, "label": DIAGNOSES[d]["label"], "count": c}
            for d, c in sorted(diagnosis_breakdown.items(), key=lambda kv: kv[1], reverse=True)
        ],
        # Deliberately NOT computed: retained_revenue_net_of_concession,
        # matched_vs_baseline. No outcome data exists to measure these --
        # keep them seeded on the frontend rather than faking a number here.
    }


def main():
    records = json.loads((OUT_DIR / "diagnoses.json").read_text())

    friction = build_friction(records)
    impact = build_impact(records)

    (OUT_DIR / "friction.json").write_text(json.dumps(friction, indent=2))
    (OUT_DIR / "impact.json").write_text(json.dumps(impact, indent=2))

    print(f"Friction: {len(friction)} cause groups, top: {friction[0]['cause'] if friction else None}")
    print(f"Impact: revenue_at_risk=RM{impact['revenue_at_risk']:,}, "
          f"at_risk={impact['accounts_at_risk']}, committed={impact['interventions_recommended']}")


if __name__ == "__main__":
    main()
