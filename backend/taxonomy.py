"""
Python mirror of the decision-layer tables in app/src/HardCodedData.js and
track/track.md. Kept as data, not code, so the candidate action set can be
swapped later without touching the pipeline logic.

cost_rank is the escalation order from track.md section 5 ("cheapest first"):
try the lowest-numbered action that plausibly resolves the diagnosis before
ever reaching for a higher one.
"""

DIAGNOSES = {
    "UNRESOLVED_FRICTION": {
        "label": "Unresolved friction",
        "blurb": "Told us, still stuck",
        "need_state": "COMPETENCE",
    },
    "UNREALISED_VALUE": {
        "label": "Unrealised value",
        "blurb": "Paying, never activated",
        "need_state": "COMPETENCE",
    },
    "WRONG_FIT": {
        "label": "Wrong fit",
        "blurb": "Paying for the wrong thing",
        "need_state": "AUTONOMY",
    },
    "VALUE_DOUBT": {
        "label": "Value doubt",
        "blurb": "Usage fine, renewal near",
        "need_state": "AUTONOMY",
    },
    "RELATIONSHIP_GAP": {
        "label": "Relationship gap",
        "blurb": "No human contact",
        "need_state": "RELATEDNESS",
    },
}

NEED_STATES = {
    "COMPETENCE": {
        "label": "Competence",
        "feeling": "I can't make this work",
        "fits": "Remove the obstacle: fix, workaround, done-for-you setup",
        "backfires": "A discount, implies they're cheap, and it's still broken",
    },
    "AUTONOMY": {
        "label": "Autonomy",
        "feeling": "I feel trapped / oversold",
        "fits": "Give control back: downgrade, pause, self-serve exit",
        "backfires": "Retention pressure, deepens the trapped feeling",
    },
    "RELATEDNESS": {
        "label": "Relatedness",
        "feeling": "Nobody noticed me",
        "fits": "A named human taking ownership",
        "backfires": "Automated drip, proves nobody noticed",
    },
}

# Placeholder candidate set, reused from HardCodedData.js. Swap this table
# once the real solution/workaround list is finalised; nothing downstream
# depends on these specific ids beyond "must be a key of this dict".
ACTIONS = {
    "WORKAROUND": {
        "label": "Micro-guide / workaround",
        "cost": "Near zero",
        "reversible": "Yes",
        "cost_rank": 1,
        "fits_need_states": ["COMPETENCE"],
    },
    "CSM_SETUP": {
        "label": "CSM setup session",
        "cost": "Staff hours",
        "reversible": "Yes",
        "cost_rank": 2,
        "fits_need_states": ["COMPETENCE"],
    },
    "NAMED_OWNER": {
        "label": "Named human ownership",
        "cost": "Headcount",
        "reversible": "Partly",
        "cost_rank": 3,
        "fits_need_states": ["RELATEDNESS"],
    },
    "ENG_FIX": {
        "label": "Engineering fix",
        "cost": "Eng time (high)",
        "reversible": "No",
        "cost_rank": 4,
        "fits_need_states": ["COMPETENCE"],
    },
    "DOWNGRADE": {
        "label": "Proactive downgrade",
        "cost": "Revenue, immediately",
        "reversible": "No",
        "cost_rank": 5,
        "fits_need_states": ["AUTONOMY"],
    },
    "DISCOUNT": {
        "label": "Discount",
        "cost": "Margin, recurring",
        "reversible": "Hard to unwind",
        "cost_rank": 6,
        "fits_need_states": ["AUTONOMY"],
    },
}

# Evidence weights, ordered by falsifiability (track.md section 4).
EVIDENCE_WEIGHTS = {
    "STATED_GOAL_REPEATED": {"label": "Stated unmet goal, repeated", "weight": 5},
    "STATED_GOAL_SINGLE": {"label": "Stated unmet goal, single mention", "weight": 4},
    "ACCOUNT_MISMATCH": {"label": "Contract/account mismatch", "weight": 3},
    "ASPECT_SENTIMENT": {"label": "Aspect-based sentiment", "weight": 3},
    "EMOTION": {"label": "Emotion classification", "weight": 2},
    "GENERIC_SENTIMENT": {"label": "Generic sentiment score", "weight": 1},
}

## Thresholds are tuned to what scoring.py can actually produce from this
## dataset (repetition + emotion only, no ABSA/account-mismatch signals
## yet -- see futureworks.md). Max attainable score is 8 (repeated + a
## high-intensity emotion read); a single mention lands at 6-7. This keeps
## the HIGH/automated tier reserved for the corroboration requirement in
## track.md #4.1 (repetition across contacts), and routes single mentions to
## MEDIUM/human-review rather than auto-acting on one utterance.
CONFIDENCE_TIERS = {
    "HIGH": {"label": "Act now", "badge": "bad", "min": 8},
    "MEDIUM": {"label": "Review needed", "badge": "warn", "min": 6},
    "LOW": {"label": "Log only", "badge": "good", "min": 0},
}

# Emotions from j-hartmann/emotion-english-distilroberta-base that count as
# a churn-risk signal, i.e. worth running the diagnosis pipeline on at all.
# "prioritising the bad emotions first" -> everything else is skipped/queued
# last so Gemini calls are spent on the population that can actually churn.
NEGATIVE_EMOTIONS = {"anger", "disgust", "fear", "sadness"}
NEUTRAL_EMOTIONS = {"neutral", "surprise"}
POSITIVE_EMOTIONS = {"joy"}

# Below this, the top label is a weak plurality over near-tied runner-ups
# (observed: a "fear" top-1 at 0.30 confidence on a clearly positive
# sentence -- "onboarding was genuinely painless!"). A near-tie shouldn't
# read as a corroborating negative signal, so it's dropped before scoring
# rather than trusted at face value. ~8% of negative-labelled rows in the
# seed dataset fall under this bar.
MIN_EMOTION_CONFIDENCE = 0.4


def confidence_tier(score: float) -> str:
    if score >= CONFIDENCE_TIERS["HIGH"]["min"]:
        return "HIGH"
    if score >= CONFIDENCE_TIERS["MEDIUM"]["min"]:
        return "MEDIUM"
    return "LOW"
