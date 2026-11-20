import unittest
from app.prompts import (
    ROLE_FOCUS_TOPICS,
    SCORING_PROMPTS,
    SYSTEM_PROMPTS,
    build_interview_system,
)


class TestPrompts(unittest.TestCase):
    def test_all_roles_configured(self):
        expected_roles = {"swe", "data", "pm", "devops", "security"}
        self.assertEqual(set(SYSTEM_PROMPTS.keys()), expected_roles)
        self.assertEqual(set(SCORING_PROMPTS.keys()), expected_roles)
        self.assertEqual(set(ROLE_FOCUS_TOPICS.keys()), expected_roles)

    def test_build_interview_system_defaults(self):
        prompt = build_interview_system()
        self.assertIn("senior engineer", prompt)
        self.assertIn("MEDIUM interview", prompt)
        self.assertNotIn("CANDIDATE RESUME", prompt)

    def test_build_interview_system_with_resume_and_topics(self):
        prompt = build_interview_system(
            role="devops",
            difficulty="hard",
            resume="Built multi-region Kubernetes clusters on AWS EKS",
            focus_topics=["Kubernetes & Containers", "Incident Response"],
            style="bar_raiser",
            company_context="Fintech payments infrastructure",
        )
        self.assertIn("Kubernetes/containers", prompt)
        self.assertIn("HARD interview", prompt)
        self.assertIn("Bar Raiser", prompt)
        self.assertIn("Kubernetes & Containers, Incident Response", prompt)
        self.assertIn("Fintech payments infrastructure", prompt)
        self.assertIn("Built multi-region Kubernetes clusters", prompt)

    def test_resume_truncation_cap(self):
        long_resume = "A" * 10000
        prompt = build_interview_system(resume=long_resume)
        self.assertIn("A" * 6000, prompt)
        self.assertNotIn("A" * 6001, prompt)


if __name__ == "__main__":
    unittest.main()
