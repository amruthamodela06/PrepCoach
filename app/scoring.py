"""Pure functions for transcript formatting, JSON recovery, and scorecard normalization."""

import json
import re


def format_transcript(messages):
    """Render the chat messages as a labeled transcript for the evaluator."""
    lines = []
    for m in messages:
        speaker = "Interviewer" if m.get("role") == "assistant" else "Candidate"
        lines.append(f"{speaker}: {m.get('content', '')}")
    return "\n\n".join(lines)


def sanitize_messages(raw_messages):
    """Filter and sanitize client messages to valid user/assistant turns."""
    if not isinstance(raw_messages, list):
        return []
    cleaned = []
    for m in raw_messages[:60]:
        if not isinstance(m, dict):
            continue
        role = m.get("role")
        content = str(m.get("content", "")).strip()
        if role in ("user", "assistant") and content:
            cleaned.append({"role": role, "content": content[:8000]})
    return cleaned


def strip_json_fences(text):
    """Best-effort recovery of a JSON object from a fenced/prose-wrapped reply."""
    t = text.strip()
    fenced = re.match(r"^```(?:json)?\s*(.*?)\s*```$", t, re.DOTALL)
    if fenced:
        t = fenced.group(1).strip()
    start, end = t.find("{"), t.rfind("}")
    if start != -1 and end != -1 and end > start:
        t = t[start:end + 1]
    return t


def parse_scorecard(raw):
    """Parse the model's reply; on failure retry once after fence-stripping.

    Returns the parsed object, or None if both attempts fail.
    """
    try:
        return json.loads(raw)
    except (json.JSONDecodeError, TypeError):
        pass
    try:
        return json.loads(strip_json_fences(raw))
    except (json.JSONDecodeError, TypeError):
        return None


def derive_band(score):
    """Derive human-readable performance band from a 0-100 score."""
    if score < 45:
        return "Needs Work"
    if score <= 60:
        return "Fair"
    if score <= 78:
        return "Strong"
    return "Excellent"


def normalize_scorecard(data):
    """Clamp overall_score and dimension scores to 0-100, force band to match,
    and annotate strongest/weakest dimensions.
    """
    if not isinstance(data, dict):
        return data
    try:
        score = int(data.get("overall_score"))
    except (TypeError, ValueError):
        return data
    score = max(0, min(100, score))
    data["overall_score"] = score
    data["band"] = derive_band(score)

    dims = data.get("dimensions")
    if isinstance(dims, list) and dims:
        valid_dims = []
        for d in dims:
            if not isinstance(d, dict):
                continue
            try:
                d_score = max(0, min(100, int(d.get("score"))))
                d["score"] = d_score
                d["band"] = derive_band(d_score)
                valid_dims.append(d)
            except (TypeError, ValueError):
                continue
        if valid_dims:
            strongest = max(valid_dims, key=lambda x: x["score"])
            weakest = min(valid_dims, key=lambda x: x["score"])
            data["strongest_dimension"] = strongest.get("name")
            data["weakest_dimension"] = weakest.get("name")
    return data
