"""Deterministic communication and structure metrics for candidate interview transcripts."""

import re

_FILLER_PATTERN = re.compile(
    r"\b(?:um+|uh+|er+|ah+|basically|honestly|literally|sort of|kind of|you know)\b",
    re.IGNORECASE,
)

_QUANT_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?(?:\s*%|\s*ms|\s*s|\s*x|\s*k|\s*m|\s*gb|\s*mb|\s*rps|\s*qps|\s*users|\s*rows|\s*days|\s*hours)?\b",
    re.IGNORECASE,
)

_STRUCTURE_PATTERN = re.compile(
    r"\b(?:because|trade-?off|first|second|third|specifically|for example|for instance|resulted in|measured|latency|throughput|bottleneck)\b",
    re.IGNORECASE,
)

_KICKOFF_PREFIX = "i'm ready"


def compute_transcript_metrics(messages):
    """Compute objective candidate communication metrics from chat messages."""
    if not isinstance(messages, list):
        return {
            "answer_count": 0,
            "total_words": 0,
            "avg_words_per_answer": 0,
            "filler_count": 0,
            "quantified_answers": 0,
            "structured_answers": 0,
        }

    user_answers = []
    for idx, m in enumerate(messages):
        if not isinstance(m, dict) or m.get("role") != "user":
            continue
        text = str(m.get("content", "")).strip()
        if not text:
            continue
        if idx == 0 and text.lower().startswith(_KICKOFF_PREFIX):
            continue
        user_answers.append(text)

    answer_count = len(user_answers)
    if answer_count == 0:
        return {
            "answer_count": 0,
            "total_words": 0,
            "avg_words_per_answer": 0,
            "filler_count": 0,
            "quantified_answers": 0,
            "structured_answers": 0,
        }

    total_words = 0
    filler_count = 0
    quantified_answers = 0
    structured_answers = 0

    for ans in user_answers:
        words = ans.split()
        total_words += len(words)
        filler_count += len(_FILLER_PATTERN.findall(ans))
        if _QUANT_PATTERN.search(ans):
            quantified_answers += 1
        if _STRUCTURE_PATTERN.search(ans):
            structured_answers += 1

    return {
        "answer_count": answer_count,
        "total_words": total_words,
        "avg_words_per_answer": round(total_words / answer_count),
        "filler_count": filler_count,
        "quantified_answers": quantified_answers,
        "structured_answers": structured_answers,
    }
