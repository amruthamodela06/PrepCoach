import unittest
from app.analytics import compute_transcript_metrics
from app.question_bank import get_questions_for_role
from app.report_builder import build_markdown_study_guide
from app.scoring import (
    derive_band,
    format_transcript,
    normalize_scorecard,
    parse_scorecard,
    sanitize_messages,
    strip_json_fences,
)


class TestScoringAndAnalytics(unittest.TestCase):
    def test_derive_band_cutoffs(self):
        self.assertEqual(derive_band(0), "Needs Work")
        self.assertEqual(derive_band(44), "Needs Work")
        self.assertEqual(derive_band(45), "Fair")
        self.assertEqual(derive_band(60), "Fair")
        self.assertEqual(derive_band(61), "Strong")
        self.assertEqual(derive_band(78), "Strong")
        self.assertEqual(derive_band(79), "Excellent")
        self.assertEqual(derive_band(100), "Excellent")

    def test_parse_scorecard_with_fences(self):
        fenced = '```json\n{"overall_score": 72, "band": "Fair"}\n```'
        parsed = parse_scorecard(fenced)
        self.assertEqual(parsed["overall_score"], 72)

    def test_normalize_scorecard_clamps_and_finds_extremes(self):
        raw = {
            "overall_score": 105,
            "band": "Needs Work",
            "dimensions": [
                {"name": "Technical Depth", "score": 82},
                {"name": "Communication", "score": 54},
            ],
        }
        norm = normalize_scorecard(raw)
        self.assertEqual(norm["overall_score"], 100)
        self.assertEqual(norm["band"], "Excellent")
        self.assertEqual(norm["strongest_dimension"], "Technical Depth")
        self.assertEqual(norm["weakest_dimension"], "Communication")

    def test_sanitize_messages(self):
        msgs = [
            {"role": "user", "content": "  Hello  "},
            {"role": "system", "content": "Ignore me"},
            {"role": "assistant", "content": ""},
            {"role": "assistant", "content": "First question?"},
        ]
        cleaned = sanitize_messages(msgs)
        self.assertEqual(len(cleaned), 2)
        self.assertEqual(cleaned[0]["content"], "Hello")

    def test_compute_transcript_metrics(self):
        messages = [
            {"role": "user", "content": "I'm ready — let's begin the interview."},
            {"role": "assistant", "content": "How did you optimize query latency?"},
            {
                "role": "user",
                "content": "First, we measured p99 latency at 450ms because of a missing index. Um, adding a composite index reduced latency by 65%.",
            },
        ]
        metrics = compute_transcript_metrics(messages)
        self.assertEqual(metrics["answer_count"], 1)
        self.assertEqual(metrics["filler_count"], 1)
        self.assertEqual(metrics["quantified_answers"], 1)
        self.assertEqual(metrics["structured_answers"], 1)

    def test_question_bank_and_markdown_export(self):
        qs = get_questions_for_role("swe", "medium")
        self.assertTrue(len(qs) >= 2)
        md = build_markdown_study_guide("swe", "hard", {"overall_score": 76, "band": "Strong"})
        self.assertIn("76 / 100", md)
        self.assertIn("Software Engineering", md)

    def test_markdown_study_guide_full_sections(self):
        scorecard = {
            "overall_score": 68,
            "band": "Strong",
            "strongest_dimension": "Technical Depth",
            "weakest_dimension": "Communication",
            "transcript_metrics": {
                "answer_count": 2,
                "total_words": 120,
                "avg_words_per_answer": 60,
                "quantified_answers": 1,
                "structured_answers": 2,
                "filler_count": 0,
            },
            "dimensions": [
                {"name": "Technical Depth", "score": 78, "band": "Strong"},
                {"name": "Communication", "score": 58, "band": "Fair"},
            ],
            "improvements": [
                {"what": "Vague caching eviction answer", "where": "Review Redis LRU vs LFU policies"}
            ],
            "ideal_answers": [
                {"question": "How does Redis handle memory pressure?", "ideal": "Configure maxmemory-policy with allkeys-lru or volatile-lfu."}
            ],
        }
        messages = [
            {"role": "user", "content": "I'm ready"},
            {"role": "assistant", "content": "How does Redis handle memory pressure?"},
            {"role": "user", "content": "It evicts keys using LRU."},
        ]
        md = build_markdown_study_guide("devops", "medium", scorecard, messages)
        self.assertIn("## Communication Analytics", md)
        self.assertIn("## Dimension Breakdown", md)
        self.assertIn("## Actionable Improvement Plan", md)
        self.assertIn("## Model Answers Reference", md)
        self.assertIn("## Full Interview Transcript", md)
        self.assertIn("Review Redis LRU vs LFU policies", md)

    def test_format_transcript_and_strip_fences(self):
        transcript = format_transcript([
            {"role": "assistant", "content": "Q1"},
            {"role": "user", "content": "A1"},
        ])
        self.assertIn("Interviewer: Q1", transcript)
        self.assertIn("Candidate: A1", transcript)
        raw = "Here is the JSON:\n{\"overall_score\": 60}\nThanks!"
        self.assertEqual(strip_json_fences(raw), '{"overall_score": 60}')


if __name__ == "__main__":
    unittest.main()
