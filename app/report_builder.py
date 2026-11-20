"""Builds a structured Markdown study guide from an interview scorecard and transcript."""

from app.prompts import _ROLE_CONTEXT


def build_markdown_study_guide(role, difficulty, scorecard, messages=None):
    """Return a clean Markdown document summarizing the interview scorecard and transcript."""
    role_label = _ROLE_CONTEXT.get(role, _ROLE_CONTEXT["swe"])[0].title()
    data = scorecard if isinstance(scorecard, dict) else {}
    overall = data.get("overall_score", "—")
    band = data.get("band", "Unrated")

    lines = [
        "# PrepCoach Interview Scorecard & Study Guide",
        "",
        f"- **Role:** {role_label} (`{role}`)",
        f"- **Difficulty:** {str(difficulty or 'medium').title()}",
        f"- **Overall Score:** **{overall} / 100** ({band})",
    ]

    if data.get("strongest_dimension"):
        lines.append(f"- **Strongest Area:** {data['strongest_dimension']}")
    if data.get("weakest_dimension"):
        lines.append(f"- **Focus Area:** {data['weakest_dimension']}")
    lines.append("")

    metrics = data.get("transcript_metrics")
    if isinstance(metrics, dict) and metrics.get("answer_count"):
        lines.extend([
            "## Communication Analytics",
            "",
            f"- **Answers Analyzed:** {metrics.get('answer_count', 0)}",
            f"- **Total Words Spoken/Typed:** {metrics.get('total_words', 0)} (avg {metrics.get('avg_words_per_answer', 0)} words/answer)",
            f"- **Quantified Answers (with metrics/numbers):** {metrics.get('quantified_answers', 0)} / {metrics.get('answer_count', 0)}",
            f"- **Structured Reasoning Answers:** {metrics.get('structured_answers', 0)} / {metrics.get('answer_count', 0)}",
            f"- **Filler Words Detected:** {metrics.get('filler_count', 0)}",
            "",
        ])

    dims = data.get("dimensions")
    if isinstance(dims, list) and dims:
        lines.extend(["## Dimension Breakdown", "", "| Dimension | Score | Band |", "| :--- | :---: | :--- |"])
        for d in dims:
            if isinstance(d, dict):
                lines.append(f"| {d.get('name', 'Dimension')} | {d.get('score', '—')}/100 | {d.get('band', '—')} |")
        lines.append("")

    improvements = data.get("improvements")
    if isinstance(improvements, list) and improvements:
        lines.extend(["## Actionable Improvement Plan", ""])
        for i, imp in enumerate(improvements, 1):
            if isinstance(imp, dict):
                lines.append(f"### {i}. {imp.get('what', 'Area to improve')}")
                lines.append(f"- **Next Step:** {imp.get('where', '')}")
                lines.append("")

    ideals = data.get("ideal_answers")
    if isinstance(ideals, list) and ideals:
        lines.extend(["## Model Answers Reference", ""])
        for i, qa in enumerate(ideals, 1):
            if isinstance(qa, dict):
                lines.append(f"### Q{i}: {qa.get('question', '')}")
                lines.append(f"> {qa.get('ideal', '')}")
                lines.append("")

    if isinstance(messages, list) and len(messages) > 1:
        lines.extend(["## Full Interview Transcript", ""])
        for m in messages[1:]:
            if not isinstance(m, dict):
                continue
            speaker = "Interviewer" if m.get("role") == "assistant" else "Candidate"
            lines.append(f"**{speaker}:**")
            lines.append(str(m.get("content", "")).strip())
            lines.append("")

    return "\n".join(lines).strip() + "\n"
