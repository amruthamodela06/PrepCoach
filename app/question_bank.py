"""Curated practice question bank across interview roles and difficulty tiers."""

QUESTION_BANK = {
    "swe": {
        "easy": [
            {
                "id": "swe-e1",
                "topic": "Data Structures & Algorithms",
                "question": "When would you choose a hash map over a binary search tree in a backend service, and what happens when hash collisions spike?",
                "key_points": ["O(1) average vs O(log n) worst-case lookup", "Ordering requirements and range queries", "Collision resolution and load factor resizing"],
            },
            {
                "id": "swe-e2",
                "topic": "APIs & Databases",
                "question": "Explain the difference between PUT and PATCH in a REST API, and how idempotency affects retry logic.",
                "key_points": ["Full resource replacement vs partial update", "Idempotency guarantees on network timeouts", "Safe retry strategies with idempotency keys"],
            },
            {
                "id": "swe-e3",
                "topic": "Debugging & Testing",
                "question": "Walk through how you isolate a memory leak or slow endpoint in a web application you recently built.",
                "key_points": ["Reproducing under controlled load", "Profiling heap allocations or query latency", "Verifying the fix with regression metrics"],
            },
        ],
        "medium": [
            {
                "id": "swe-m1",
                "topic": "System Design",
                "question": "Design a rate limiter for a multi-instance API gateway handling 50,000 requests per second. Which algorithm and backing store would you pick?",
                "key_points": ["Token bucket vs sliding window counter", "Redis atomic Lua scripts and race conditions", "Fail-open vs fail-closed trade-offs during cache outage"],
            },
            {
                "id": "swe-m2",
                "topic": "APIs & Databases",
                "question": "An orders table with 100M rows has slow pagination using OFFSET/LIMIT. Why does it degrade and how do you redesign it?",
                "key_points": ["Full index scan cost of large OFFSET", "Cursor/keyset pagination on indexed monotonic columns", "Handling concurrent inserts and tie-breaking"],
            },
            {
                "id": "swe-m3",
                "topic": "Behavioral & Ownership",
                "question": "Tell me about a production bug or architectural mistake you personally introduced. How did you detect, mitigate, and prevent it?",
                "key_points": ["Clear personal accountability", "Immediate blast-radius mitigation", "Concrete systemic guardrail added post-incident"],
            },
        ],
        "hard": [
            {
                "id": "swe-h1",
                "topic": "System Design",
                "question": "How do you maintain consistency between a primary relational database and an Elasticsearch search index without dual-write race conditions?",
                "key_points": ["Transactional outbox pattern or CDC (Debezium)", "Idempotent consumers and out-of-order version checks", "Reconciliation jobs for drift recovery"],
            },
            {
                "id": "swe-h2",
                "topic": "Data Structures & Algorithms",
                "question": "Design an in-memory LRU cache supporting concurrent reads and writes across 32 threads with minimal lock contention.",
                "key_points": ["Sharded hash table + doubly linked list segments", "Read-write locks or approximate clock/second-chance eviction", "Memory overhead and false sharing considerations"],
            },
        ],
    },
    "data": {
        "easy": [
            {
                "id": "data-e1",
                "topic": "Probability & Statistics",
                "question": "What is the difference between a p-value and statistical power in an A/B test, and why can a tiny effect still have p < 0.01?",
                "key_points": ["Type I vs Type II error definitions", "Sample size sensitivity on p-values", "Practical vs statistical significance (confidence intervals)"],
            },
            {
                "id": "data-e2",
                "topic": "SQL & Data Wrangling",
                "question": "Explain the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() when deduplicating user activity events.",
                "key_points": ["Tie handling behavior across all three", "Deterministic ordering in OVER(PARTITION BY ... ORDER BY ...)", "Performance impact on large partitions"],
            },
        ],
        "medium": [
            {
                "id": "data-m1",
                "topic": "A/B Testing & Experimentation",
                "question": "You launch a checkout UI experiment and see conversion rise +4% in week 1, then drop to +0.2% by week 3. What hypotheses do you test?",
                "key_points": ["Novelty effect and returning user cohort analysis", "Sample Ratio Mismatch (SRM) check", "Instrumentation drift or seasonal confounders"],
            },
            {
                "id": "data-m2",
                "topic": "Machine Learning & Modeling",
                "question": "Your fraud classification model has 99.4% accuracy offline but misses 60% of fraud in production. How do you diagnose and fix it?",
                "key_points": ["Severe class imbalance and Precision-Recall AUC", "Target leakage or train-serve feature skew", "Cost-sensitive thresholding and calibration"],
            },
        ],
        "hard": [
            {
                "id": "data-h1",
                "topic": "A/B Testing & Experimentation",
                "question": "How would you measure the causal impact of a new driver-matching algorithm in a two-sided rideshare marketplace where user randomization leaks?",
                "key_points": ["Network interference / SUTVA violation", "Switchback time-split or geo-cluster randomization", "Variance reduction via CUPED / pre-experiment covariates"],
            },
        ],
    },
    "pm": {
        "easy": [
            {
                "id": "pm-e1",
                "topic": "Product Sense & Design",
                "question": "Pick a daily productivity app you use. What is its core value loop, and what is one feature you would remove to improve retention?",
                "key_points": ["Clear user persona and core job-to-be-done", "Cognitive load vs activation friction", "Measurable retention metric + guardrail"],
            },
            {
                "id": "pm-e2",
                "topic": "Metrics & Root Cause Analysis",
                "question": "Define the North Star metric for a collaborative document editor and one counter-metric that prevents gaming it.",
                "key_points": ["Value-aligned North Star (e.g. weekly collaborative active docs)", "Counter-metric (latency, churn, or spam invitations)", "Leading vs lagging indicators"],
            },
        ],
        "medium": [
            {
                "id": "pm-m1",
                "topic": "Metrics & Root Cause Analysis",
                "question": "Daily active users on our mobile checkout funnel dropped 12% overnight while web traffic stayed flat. Walk me through your diagnostic tree.",
                "key_points": ["Telemetry validation and app release version cut", "OS/region/payment-gateway segmentation", "Internal deploys vs external platform outage"],
            },
            {
                "id": "pm-m2",
                "topic": "Prioritization & Roadmapping",
                "question": "Engineering wants a full quarter for tech debt refactoring while Sales demands three enterprise integrations to close Q3 deals. How do you decide?",
                "key_points": ["Quantifying cost of delay and incident risk", "Scoping minimum lovable integration vs incremental refactor", "Transparent trade-off alignment with leadership"],
            },
        ],
        "hard": [
            {
                "id": "pm-h1",
                "topic": "Go-To-Market & Strategy",
                "question": "Should a mid-market B2B SaaS analytics platform launch a free self-serve tier when 85% of revenue comes from enterprise contracts?",
                "key_points": ["Cannibalization risk vs PLG top-of-funnel expansion", "Support cost and infrastructure unit economics", "Feature gating strategy and conversion triggers"],
            },
        ],
    },
    "devops": {
        "easy": [
            {
                "id": "devops-e1",
                "topic": "Kubernetes & Containers",
                "question": "What is the difference between a Kubernetes liveness probe and readiness probe, and what happens if a readiness probe depends on an external DB?",
                "key_points": ["Container restart vs service endpoint removal", "Cascading outage risk when shared DB hiccups", "Shallow vs deep health check patterns"],
            },
        ],
        "medium": [
            {
                "id": "devops-m1",
                "topic": "Observability & SLOs",
                "question": "How do you define an error budget for a tier-1 payment service, and what concrete policy triggers when 80% of the monthly budget is burned?",
                "key_points": ["SLI definition (availability & tail latency p99)", "Multi-window burn-rate alerts", "Feature freeze / reliability sprint enforcement"],
            },
        ],
        "hard": [
            {
                "id": "devops-h1",
                "topic": "Incident Response",
                "question": "A bad Terraform apply just wiped a stateful production security group during peak traffic. Walk through your first 15 minutes as Incident Commander.",
                "key_points": ["Immediate state lock and blast radius stabilization", "Out-of-band break-glass access & state recovery", "Blameless postmortem and CI policy-as-code guardrails"],
            },
        ],
    },
    "security": {
        "easy": [
            {
                "id": "sec-e1",
                "topic": "Web & API Security (OWASP)",
                "question": "Why are CORS headers not a substitute for CSRF protection or server-side authorization?",
                "key_points": ["Browser same-origin read restriction vs simple state-changing requests", "Anti-CSRF tokens and SameSite cookie attributes", "Defense-in-depth authorization checks"],
            },
        ],
        "medium": [
            {
                "id": "sec-m1",
                "topic": "IAM & Cryptography",
                "question": "Compare stateless JWT access tokens against opaque session tokens. How do you handle immediate revocation when an account is compromised?",
                "key_points": ["Short-lived access tokens + rotating refresh tokens", "Token denylist / epoch version claims", "Signature algorithm confusion and key rotation (JWKS)"],
            },
        ],
        "hard": [
            {
                "id": "sec-h1",
                "topic": "Threat Modeling",
                "question": "Threat-model a multi-tenant AI document summarization service that ingests untrusted PDFs and calls an internal LLM with tool access.",
                "key_points": ["Indirect prompt injection and data exfiltration vectors", "Tenant isolation in vector/storage layers", "Sandboxed PDF parsing and strict tool permission boundaries"],
            },
        ],
    },
}


def get_questions_for_role(role="swe", difficulty=None):
    """Return curated practice questions for a given role and optional difficulty."""
    by_diff = QUESTION_BANK.get(role, QUESTION_BANK["swe"])
    if difficulty and difficulty in by_diff:
        return by_diff[difficulty]
    combined = []
    for diff_level, items in by_diff.items():
        for item in items:
            combined.append({**item, "difficulty": diff_level})
    return combined
