"""
Gemini decision layer: picks a diagnosis class + ONE action from the
candidate set in taxonomy.py, and states which candidates it ruled out.

Gemini never runs on a LOW-confidence customer (see pipeline.py) -- that
gate is enforced in Python before this module is even called, per
track.md #4.2: "uncertainty degrades to observation, never to a guess."

Within a MEDIUM/HIGH call, Gemini can still come back empty-handed: if none
of the candidate actions is a good match, or it isn't confident, it must
return recommended_action: null rather than invent something outside the
candidate list. That's enforced twice -- once by prompt instruction, once by
validating the returned id is actually a key in taxonomy.ACTIONS (anything
else is discarded and treated as "no match").
"""

import json
import os

from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from taxonomy import ACTIONS, DIAGNOSES, NEED_STATES

MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY not set (check backend/.env)")
        _client = genai.Client(api_key=api_key)
    return _client


class RejectedAction(BaseModel):
    action: str = Field(description="Action id from the candidate list")
    reason: str = Field(description="One sentence: why this action was ruled out for this specific customer")


class DiagnosisResult(BaseModel):
    diagnosis: str | None = Field(description="One id from the diagnosis list, or null if none fits")
    confident: bool = Field(description="True only if the evidence clearly supports this diagnosis")
    why: str | None = Field(description="One plain-English sentence: what is actually going on, or null")
    recommended_action: str | None = Field(
        description="Cheapest action id from the candidate list that plausibly resolves the issue, or null if none fit / not confident"
    )
    recommended_reason: str | None = Field(
        description="One sentence justifying this action AND why it's the cheapest viable option, or null"
    )
    rejected_actions: list[RejectedAction] = Field(
        default_factory=list,
        description="2-3 other candidate actions considered and ruled out, cheapest-considered-first",
    )


def _build_prompt(customer: dict, evidence: list[dict], negative_texts: list[dict]) -> str:
    diagnosis_menu = "\n".join(
        f"- {k}: {v['label']} ({v['blurb']}), need-state: {v['need_state']}"
        for k, v in DIAGNOSES.items()
    )
    need_state_menu = "\n".join(
        f"- {k}: \"{v['feeling']}\" -> fits: {v['fits']} | backfires: {v['backfires']}"
        for k, v in NEED_STATES.items()
    )
    # Cheapest-first, per track.md #5 escalation ladder.
    action_menu = "\n".join(
        f"- {k}: {v['label']} | cost: {v['cost']} | reversible: {v['reversible']} | fits need-state(s): {', '.join(v['fits_need_states'])}"
        for k, v in sorted(ACTIONS.items(), key=lambda kv: kv[1]["cost_rank"])
    )
    evidence_txt = "\n".join(f"- [{e['type']}] {e['detail']}" for e in evidence)
    quotes_txt = "\n".join(
        f'- ({r["channel"]}, {r["timestamp"]}, emotion={r["emotion"]["label"]}): "{r["text"]}"'
        for r in negative_texts
    )

    return f"""You are the diagnosis step of a churn-retention system. A deterministic \
evidence layer (not you) already decided this customer clears the bar for a \
human/automated action -- your only job is to name the likely cause and pick \
ONE action from the candidate list below, or explicitly decline.

CUSTOMER
- plan tier: {customer.get('plan_tier')}
- contract type: {customer.get('contract_type')}
- monthly spend: RM{customer.get('monthly_spend_myr')}
- customer since: {customer.get('signup_date')}

EVIDENCE ALREADY COLLECTED (from a separate rules layer)
{evidence_txt}

RAW FEEDBACK / CALL TRANSCRIPT EXCERPTS
{quotes_txt}

DIAGNOSIS CLASSES (pick at most one)
{diagnosis_menu}

NEED-STATES (what kind of response this customer can actually accept)
{need_state_menu}

CANDIDATE ACTIONS, listed cheapest-first
{action_menu}

RULES, follow strictly:
1. Pick the diagnosis class that best matches what the customer actually said. If nothing \
   clearly matches, set diagnosis to null.
2. The action MUST come from the candidate list above by its exact id, and MUST fit the \
   need-state implied by the diagnosis. Never propose an action outside this list.
3. Prefer the CHEAPEST action in the list that plausibly resolves the issue. Only pick a \
   costlier action if every cheaper action that fits the need-state would clearly fail to \
   resolve this specific issue -- say so in recommended_reason.
4. If you are not confident, or no candidate action is a good fit, set confident=false and \
   recommended_action=null. Do not guess or invent a solution just to fill the field -- an \
   unresolved "no action" is a correct and expected output, not a failure.
5. List 2-3 other candidate actions you considered and ruled out, with a one-sentence reason \
   each grounded in this customer's specific evidence (e.g. "wrong need-state", "does not \
   address the stated cause"). A generic reason is not acceptable.
"""


def diagnose(customer: dict, evidence: list[dict], negative_rows: list[dict]) -> dict:
    client = _get_client()
    prompt = _build_prompt(customer, evidence, negative_rows)

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=DiagnosisResult,
            temperature=0.2,
        ),
    )

    try:
        result: DiagnosisResult = response.parsed
        if result is None:
            raise ValueError("empty parse")
    except Exception:
        # Model didn't return valid structured output -- fail safe, don't guess.
        return _no_action_result("Model output could not be parsed; defaulting to no action.")

    return _validate(result)


def _no_action_result(reason: str) -> dict:
    return {
        "diagnosis": None,
        "confident": False,
        "why": reason,
        "recommended_action": None,
        "recommended_reason": None,
        "rejected_actions": [],
    }


def _validate(result: DiagnosisResult) -> dict:
    out = result.model_dump()

    if out["diagnosis"] not in DIAGNOSES:
        out["diagnosis"] = None

    # Anything outside the candidate list, or that doesn't fit the
    # diagnosis's need-state, is discarded rather than trusted -- this is
    # the "does not simply introduce a random solution" guard.
    action_id = out.get("recommended_action")
    need_state = DIAGNOSES.get(out["diagnosis"], {}).get("need_state")
    if action_id not in ACTIONS:
        out["recommended_action"] = None
        out["recommended_reason"] = None
    elif need_state and need_state not in ACTIONS[action_id]["fits_need_states"]:
        out["recommended_action"] = None
        out["recommended_reason"] = None

    if not out["confident"] or out["diagnosis"] is None:
        out["recommended_action"] = None
        out["recommended_reason"] = None

    out["rejected_actions"] = [
        r for r in out.get("rejected_actions", []) if r["action"] in ACTIONS
    ][:3]

    return out
