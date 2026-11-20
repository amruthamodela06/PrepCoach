FROM node:22-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY --from=frontend-build /build/app/static ./app/static

# Render injects $PORT at runtime; default to 8000 for local `docker run`.
ENV PORT=8000
EXPOSE 8000

# Shell form so ${PORT} expands. --proxy-headers because the app runs behind
# Render's load balancer (correct scheme/client IP for redirects and logging).
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips="*"
