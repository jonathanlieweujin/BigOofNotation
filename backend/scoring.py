"""
Deterministic evidence + confidence layer, per track/track.md section 4:
"a model that cannot show its reasoning cannot be safely overridden".

This runs BEFORE Gemini. Gemini only ever sees, and only ever chooses an
action within, a confidence tier this module already computed — it cannot
talk its way past a LOW score. That's the fail-safe: uncertainty degrades to
observation, never to a guess.

Input is one customer's feedback rows, each already emotion-classified by
emotion_model.py. Corroboration rule (track.md #4.1): a diagnosis needs
repetition across >=2 separate contacts, or it stays at single-mention
weight. We don't have an aspect extractor (SetFitABSA is future-work per
futureworks.md), so "same complaint restated" is approximated as "another
negative-emotion entry from the same customer on a different day/channel" —
an honest, documented approximation, not a claim of aspect-level matching.
"""

from collections import Counter
from datetime import datetime

from taxonomy import EVIDENCE_WEIGHTS, MIN_EMOTION_CONFIDENCE, NEGATIVE_EMOTIONS, confidence_tier

HIGH_INTENSITY = 0.75  # model score above this counts as a confident read


def _parse_ts(ts: str):
    try:
        return datetime.strptime(ts, "%Y-%m-%d %H:%M:%S")
    except (ValueError, TypeError):
        return None


def score_customer(feedback_rows: list[dict]) -> dict:
    """
    feedback_rows: [{text, channel, timestamp, emotion: {label, score, scores}}, ...]
    Returns {evidence: [...], score: float, tier: "HIGH"|"MEDIUM"|"LOW",
             dominant_emotion: str, negative_rows: [...]}
    """
    rows = sorted(feedback_rows, key=lambda r: r.get("timestamp") or "")
    negative_rows = [
        r
        for r in rows
        if r["emotion"]["label"] in NEGATIVE_EMOTIONS
        and r["emotion"]["score"] >= MIN_EMOTION_CONFIDENCE
    ]

    if not negative_rows:
        return {
            "evidence": [],
            "score": 0,
            "tier": "LOW",
            "dominant_emotion": rows[-1]["emotion"]["label"] if rows else None,
            "negative_rows": [],
        }

    evidence = []
    seen_types = set()

    # Corroboration: distinct contact channels/dates carrying a negative read.
    distinct_contacts = {(r["channel"], r["timestamp"]) for r in negative_rows}
    repeated = len(distinct_contacts) >= 2

    if repeated:
        latest_two = negative_rows[-2:]
        detail = "; ".join(
            f'"{r["text"][:90]}" ({r["channel"]}, {r["timestamp"]})' for r in latest_two
        )
        evidence.append(
            {
                "type": "STATED_GOAL_REPEATED",
                "detail": f"Negative signal repeated across {len(distinct_contacts)} separate contacts: {detail}",
            }
        )
        seen_types.add("STATED_GOAL_REPEATED")
    else:
        r = negative_rows[-1]
        evidence.append(
            {
                "type": "STATED_GOAL_SINGLE",
                "detail": f'"{r["text"][:120]}" ({r["channel"]}, {r["timestamp"]})',
            }
        )
        seen_types.add("STATED_GOAL_SINGLE")

    # Emotion evidence: the most intense negative read.
    strongest = max(negative_rows, key=lambda r: r["emotion"]["score"])
    evidence.append(
        {
            "type": "EMOTION",
            "detail": f'{strongest["emotion"]["label"]} detected, {strongest["emotion"]["score"]:.0%} confidence ({strongest["channel"]}, {strongest["timestamp"]})',
        }
    )
    seen_types.add("EMOTION")

    score = sum(EVIDENCE_WEIGHTS[t]["weight"] for t in seen_types)

    # A confidently-read negative emotion (not a borderline call) nudges the
    # score up within its tier; doesn't cross a tier boundary on its own.
    if strongest["emotion"]["score"] >= HIGH_INTENSITY:
        score += 1

    dominant = Counter(r["emotion"]["label"] for r in negative_rows).most_common(1)[0][0]

    return {
        "evidence": evidence,
        "score": score,
        "tier": confidence_tier(score),
        "dominant_emotion": dominant,
        "negative_rows": negative_rows,
    }
