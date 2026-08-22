"""
Orchestrates one customer end-to-end: feedback rows -> emotion model ->
deterministic evidence/confidence (scoring.py) -> Gemini diagnosis+action
(gemini_diagnose.py, skipped entirely below the action threshold) -> the
per-customer record the frontend queue/detail views expect.
"""

from taxonomy import ACTIONS, DIAGNOSES

# Rough LTV estimate: monthly spend over a 3-year horizon. Not a real
# LTV model -- customers.csv has no churn/tenure-outcome field to fit one
# against -- but it's a defensible, documented placeholder for ranking.
LTV_HORIZON_MONTHS = 36


def build_customer_record(customer: dict, scored: dict, gemini_result: dict | None) -> dict:
    ltv = round(float(customer["monthly_spend_myr"]) * LTV_HORIZON_MONTHS)

    diagnosis_id = gemini_result["diagnosis"] if gemini_result else None
    action_id = gemini_result["recommended_action"] if gemini_result else None
    why = (
        gemini_result["why"]
        if gemini_result and gemini_result["why"]
        else _fallback_why(scored)
    )

    record = {
        "id": customer["customer_id"],
        "name": customer["full_name"],
        "plan_tier": customer["plan_tier"],
        "contract_type": customer["contract_type"],
        "ltv": ltv,
        "tier": scored["tier"],
        "confidence_score": scored["score"],
        "diagnosis": diagnosis_id,
        "diagnosis_label": DIAGNOSES[diagnosis_id]["label"] if diagnosis_id else None,
        "why": why,
        "evidence": scored["evidence"],
        "recommended": action_id,
        "recommended_label": ACTIONS[action_id]["label"] if action_id else None,
        "recommended_reason": gemini_result["recommended_reason"] if gemini_result else None,
        "rejected": gemini_result["rejected_actions"] if gemini_result else [],
        "timeline": [
            {
                "date": r["timestamp"],
                "event": r["text"],
                "channel": r["channel"],
                "emotion": r["emotion"]["label"],
            }
            for r in scored.get("negative_rows", [])
        ],
    }
    return record


def _fallback_why(scored: dict) -> str:
    if scored["tier"] == "LOW":
        if scored["evidence"]:
            return "Weak, uncorroborated signal only. Logged for observation, no action taken."
        return "No negative signal detected in available feedback. Healthy."
    return "Negative signal detected but the diagnosis step did not reach a confident read."
