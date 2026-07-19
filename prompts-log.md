# Prompts Log

Every prompt given to Cursor / Claude Code, with a one-line note on what changed after.

---

## Day 1 — FastAPI + Claude streaming, local

### 2026-07-16 — Prompt 1 (scaffold)

> Interview Prep Coach — you pick a role (SWE, data, PM), it runs a mock interview: asks a
> question, you answer, it probes with a follow-up, then gives structured feedback.
> Day 1: FastAPI + Claude streaming, local. [full project structure, requirements.txt,
> .gitignore, app/main.py, app/prompts.py, run + curl test instructions]

**What changed after:**
- Scaffolded into repo root (`PrepCoach/`) instead of a nested `interview-coach/` dir — repo already existed.
- `AsyncAnthropic(api_key=os.environ["ANTHROPIC_API_KEY"])` → `AsyncAnthropic()`. The SDK resolves the key from the env itself; the explicit form raises `KeyError` at import time before FastAPI can start, which is a worse failure than a clear auth error at request time.
- Wrapped the `messages.stream` block in try/except so SDK errors surface to the frontend as `data: {"error": ...}` instead of killing the generator mid-stream with no client-visible cause.
- Added `Cache-Control: no-cache` + `X-Accel-Buffering: no` response headers so proxies don't buffer SSE chunks (this is the #1 cause of "streaming works via curl, arrives all at once in the browser").
- Wrote `app/static/index.html` — not supplied in the spec, but `StaticFiles(directory="app/static")` raises at startup if the dir doesn't exist.
- Kept `app/prompts.py` verbatim as written.

**Open question:** spec pins `claude-sonnet-4-6`. `claude-sonnet-5` is now available and is the current Sonnet. Left as specced; revisit.

### 2026-07-16 — Prompt 2 (model upgrade)

> okay do that

(i.e. switch `claude-sonnet-4-6` → `claude-sonnet-5`, resolving the open question above.)

**What changed after:**
- `MODEL = "claude-sonnet-5"`. Better judgment on the core task — reading an answer and probing its weakest part.
- Added `thinking={"type": "disabled"}`. Sonnet 5 runs adaptive thinking by default when `thinking` is omitted, but `stream.text_stream` yields *text* deltas only — so thinking time would surface as a dead pause with no output. The alternative (`display: "summarized"`) would stream reasoning to the user and break the "never break role" rule in `prompts.py`.
- `max_tokens` 1024 → 2048 (`MAX_TOKENS` constant). Sonnet 5's tokenizer counts ~30% more tokens for the same text, and the feedback block (2 strengths + 2 gaps + 3-4 sentence rewrite) is the longest output the app produces. 1024 risked truncating it mid-rewrite.

**Verified:** request shape returns 401 (auth) rather than 400 (validation) against a dummy key, so the model ID + `thinking` param are accepted server-side. Live output still unverified — needs a real key.

**Watch on first real run:** if answers feel shallower than expected, the lever is re-enabling adaptive thinking and handling the pause in the UI (e.g. a "thinking..." indicator), not prompt patching.

### 2026-07-17 — Prompt 3 (drop paid Claude for free backends: Groq + Ollama)

> isnt there a free tier one? ... 5 dollars means almost 500 rupees ... can we also use ollama?

Anthropic has no free tier and Max/Pro don't grant API credits, so for a submission-only project we moved off Claude to zero-cost backends. Groq (free cloud key, no card) and Ollama (fully local, no key) are both OpenAI-compatible.

**What changed after:**
- `anthropic` -> `openai` in requirements. One SDK (`AsyncOpenAI`) serves both providers by swapping `base_url`; no need for separate groq/ollama SDKs.
- Added a `PROVIDERS` registry + `PROVIDER` env var in `main.py`. `groq` -> api.groq.com, needs `GROQ_API_KEY`; `ollama` -> localhost:11434, no key. `MODEL` env var overrides the per-provider default.
- System prompt moved from a top-level `system=` param into the first message of the array (`{"role":"system",...}`) — OpenAI/Groq/Ollama style. `prompts.py` itself unchanged.
- Dropped the Anthropic-only `thinking={"type":"disabled"}` param.
- `/health` now reports the active `provider` and `model` — makes "which backend am I actually hitting" a one-curl check.
- Ollama `default_model` set to `qwen2.5-coder:7b-instruct` because that's what's already pulled on this machine (runs out of the box). Overridable via `MODEL`.
- Added `.env.example` documenting both providers and the model knobs.

**Verified (finally, for real — no key, no cost):**
- Both provider configs import.
- Groq path: clean `data: {"error":"AuthenticationError: 401..."}` on a dummy key — SSE framing correct, request shape accepted.
- **Ollama path: full end-to-end stream through `qwen2.5-coder:7b-instruct`.** Timestamped the chunks — they arrive ~100ms apart, progressively, NOT in one burst. This is the Day 1 streaming gate, passed. Model asked exactly one question + a project-depth probe (prompt behaving).

**Prompt-tuning note for later:** on this run the model opened with "Hi there! I'm excited to talk..." — warmer than `prompts.py`'s "Be direct. Do not praise weak answers." Smaller local models follow negative/tone instructions less tightly than Claude did. Fix is in `prompts.py` (stronger framing / few-shot), not the backend.

### 2026-07-20 — Prompt 4 (add Claude back as a third provider, make it default)

> alright I am going to use claude only I will pay the 5 dollars for the credits and will give you an api key

Decided to pay for Anthropic credits. Rather than revert the free backends, added Claude as a third provider so the free local Ollama loop stays available for prompt iteration.

**What changed after:**
- `anthropic` added back to requirements (alongside `openai`).
- `main.py`: `PROVIDERS` now has `anthropic` (default), `groq`, `ollama`. Extracted a `stream_text()` helper that branches: Claude uses the native Anthropic SDK (`messages.stream` + `text_stream`, `thinking` disabled); groq/ollama share the `AsyncOpenAI` client. The SSE framing / error handling in `/chat` is provider-agnostic now.
- Default `PROVIDER=anthropic`, default model `claude-sonnet-5`.
- `.env.example` documents all three.

**Security:** did NOT accept the API key in chat — keys can be logged/cached, and a leaked `sk-ant-` is live billable credit. Key goes in local `.env` (gitignored) only; rotate in Console if ever exposed.

**Verified:**
- All three provider configs import and resolve the right default model.
- Anthropic path: clean `data: {"error":"AuthenticationError: 401..."}` on a dummy key — so `claude-sonnet-5` + `thinking` param + request shape all pass server-side validation; only a real key is missing.
- Ollama path: still streams for real after the refactor (regression check passed).

**Workflow from here:** iterate `prompts.py` on `PROVIDER=ollama` (free, fast), switch to `PROVIDER=anthropic` for real answers / submission. Tune against Groq's 70B when possible — closer to Claude's instruction-following than the local 7B.

### 2026-07-20 — Prompt 5 (strengthen prompts.py against warm opening)

> yeah strenghten the prompts.py

Rewrote `_BASE` to fix the "Hi there! I'm excited..." opening and make the interview loop a hard state machine. Feedback format + role strings unchanged (graded structure kept).

**What changed after:**
- Split `_BASE` into CADENCE / TONE / BOUNDARIES sections.
- CADENCE spells out the 3-step loop (question -> one follow-up -> feedback -> next) and explicitly forbids feedback-before-follow-up and skipping the follow-up.
- TONE: "open with the first question and nothing else"; banned filler ("Great question", "I'm excited", "welcome"); praise only if genuinely strong, and probe anyway; questions capped at 1-3 sentences.
- BOUNDARIES: stay in character, no fourth-wall, don't answer own questions / coach mid-answer.

**Verified on Ollama 7B:** SWE now opens with a bare question, no greeting (was "Hi there! I'm excited..."). PM still adds a small "Let's dive right in" lead-in — a small-model artifact; Claude should honor "first question and nothing else" more tightly. Net: materially stronger, re-check on Claude once the key is in.
