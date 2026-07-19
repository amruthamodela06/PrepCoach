import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from app.prompts import SYSTEM_PROMPTS

load_dotenv()

# Three backends, one switch (PROVIDER in .env). Claude is the default;
# Groq and Ollama are free fallbacks for local prompt iteration.
#   PROVIDER=anthropic -> Claude, needs ANTHROPIC_API_KEY (paid credits)
#   PROVIDER=groq      -> Groq cloud, needs GROQ_API_KEY (free key, no card)
#   PROVIDER=ollama    -> local Ollama at :11434, no key, no cost
# Groq and Ollama both speak the OpenAI-compatible API, so they share one
# client; Claude uses the native Anthropic SDK.
PROVIDERS = {
    "anthropic": {"default_model": "claude-sonnet-5"},
    "groq": {
        "base_url": "https://api.groq.com/openai/v1",
        "api_key_env": "GROQ_API_KEY",
        "default_model": "llama-3.3-70b-versatile",
    },
    "ollama": {
        "base_url": "http://localhost:11434/v1",
        "api_key_env": None,  # local server ignores the key
        "default_model": "qwen2.5-coder:7b-instruct",
    },
}

PROVIDER = os.environ.get("PROVIDER", "anthropic").lower()
if PROVIDER not in PROVIDERS:
    raise RuntimeError(
        f"Unknown PROVIDER={PROVIDER!r}. Set PROVIDER to one of: "
        f"{', '.join(PROVIDERS)}."
    )

_cfg = PROVIDERS[PROVIDER]
MODEL = os.environ.get("MODEL", _cfg["default_model"])
MAX_TOKENS = 2048

if PROVIDER == "anthropic":
    from anthropic import AsyncAnthropic

    # Key is resolved from ANTHROPIC_API_KEY at request time; a missing key
    # surfaces as a clean auth error, not a crash at startup.
    client = AsyncAnthropic()
else:
    from openai import AsyncOpenAI

    _api_key = os.environ.get(_cfg["api_key_env"]) if _cfg["api_key_env"] else "ollama"
    client = AsyncOpenAI(base_url=_cfg["base_url"], api_key=_api_key or "missing")


async def stream_text(system, messages):
    """Yield text deltas from the active provider."""
    if PROVIDER == "anthropic":
        async with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=system,
            # text_stream yields text deltas only; adaptive thinking (on by
            # default for Sonnet 5) would stall output with no visible progress.
            thinking={"type": "disabled"},
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                yield text
    else:
        # OpenAI-style: the system prompt is the first message.
        stream = await client.chat.completions.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            messages=[{"role": "system", "content": system}, *messages],
            stream=True,
        )
        async for chunk in stream:
            text = chunk.choices[0].delta.content
            if text:
                yield text


app = FastAPI()


@app.get("/health")
def health():
    return {"ok": True, "provider": PROVIDER, "model": MODEL}


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    role = body.get("role", "swe")
    messages = body.get("messages", [])
    system = SYSTEM_PROMPTS.get(role, SYSTEM_PROMPTS["swe"])

    async def gen():
        try:
            async for text in stream_text(system, messages):
                yield f"data: {json.dumps({'text': text})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': f'{type(e).__name__}: {e}'})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


app.mount("/", StaticFiles(directory="app/static", html=True), name="static")
