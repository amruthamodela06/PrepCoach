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
