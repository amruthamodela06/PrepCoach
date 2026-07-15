import json
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from anthropic import AsyncAnthropic
from dotenv import load_dotenv
from app.prompts import SYSTEM_PROMPTS

load_dotenv()
client = AsyncAnthropic()
app = FastAPI()

MODEL = "claude-sonnet-5"
MAX_TOKENS = 2048


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    role = body.get("role", "swe")
    messages = body.get("messages", [])
    system = SYSTEM_PROMPTS.get(role, SYSTEM_PROMPTS["swe"])

    async def gen():
        try:
            async with client.messages.stream(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=system,
                # text_stream yields text deltas only, so adaptive thinking
                # would stall output with no visible progress.
                thinking={"type": "disabled"},
                messages=messages,
            ) as stream:
                async for text in stream.text_stream:
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
