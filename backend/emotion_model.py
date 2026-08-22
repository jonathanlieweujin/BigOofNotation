"""
Wraps j-hartmann/emotion-english-distilroberta-base.
https://huggingface.co/j-hartmann/emotion-english-distilroberta-base

7-way emotion classifier: anger, disgust, fear, joy, neutral, sadness,
surprise. This is the "understand the sentiment/emotion" step; nothing here
decides an action, that's gemini_diagnose.py.
"""

from functools import lru_cache

from transformers import pipeline

MODEL_NAME = "j-hartmann/emotion-english-distilroberta-base"


@lru_cache(maxsize=1)
def get_classifier():
    return pipeline(
        "text-classification",
        model=MODEL_NAME,
        top_k=None,  # return scores for every label, not just the top one
        truncation=True,
    )


def classify(text: str) -> dict:
    """One text -> {"label": str, "score": float, "scores": {label: score, ...}}"""
    return classify_batch([text])[0]


def classify_batch(texts: list[str], batch_size: int = 16) -> list[dict]:
    if not texts:
        return []
    clf = get_classifier()
    raw = clf(list(texts), batch_size=batch_size)
    results = []
    for scores in raw:
        ranked = sorted(scores, key=lambda s: s["score"], reverse=True)
        results.append(
            {
                "label": ranked[0]["label"],
                "score": ranked[0]["score"],
                "scores": {s["label"]: s["score"] for s in scores},
            }
        )
    return results
