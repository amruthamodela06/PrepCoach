import os
import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from openai import AsyncOpenAI
from dotenv import load_dotenv
from app.prompts import SYSTEM_PROMPTS

load_dotenv()

# Both Groq and Ollama speak the OpenAI-compatible API, so one client
# serves both. Switch with PROVIDER in .env; override the model with MODEL.
#   PROVIDER=groq    -> Groq cloud, needs GROQ_API_KEY (free key, no card)
#   PROVIDER=ollama  -> local Ollama at :11434, no key, no cost
PROVIDERS = {
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

PROVIDER = os.environ.get("PROVIDER", "groq").lower()
if PROVIDER not in PROVIDERS:
    raise RuntimeError(
        f"Unknown PROVIDER={PROVIDER!r}. Set PROVIDER to one of: "
        f"{', '.join(PROVIDERS)}."
    )

_cfg = PROVIDERS[PROVIDER]
_api_key = os.environ.get(_cfg["api_key_env"]) if _cfg["api_key_env"] else "ollama"
MODEL = os.environ.get("MODEL", _cfg["default_model"])
MAX_TOKENS = 2048

# api_key must be non-empty for the SDK to construct; a wrong/missing key
# surfaces as a clean auth error on the request, not a crash at startup.
client = AsyncOpenAI(base_url=_cfg["base_url"], api_key=_api_key or "missing")

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
            # OpenAI-style: the system prompt is the first message, not a
            # separate parameter.
            stream = await client.chat.completions.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                messages=[{"role": "system", "content": system}, *messages],
                stream=True,
            )
            async for chunk in stream:
                text = chunk.choices[0].delta.content
                if text:
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
