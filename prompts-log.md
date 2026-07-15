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
