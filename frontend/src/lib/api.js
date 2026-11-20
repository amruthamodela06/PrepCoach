// Streams POST /chat, invoking onToken for each SSE text delta.
// Returns the full concatenated text, or throws on any failure (network
// error, non-2xx, or an {error} payload from the backend).
export async function streamChat({
  role,
  difficulty,
  resume,
  focusTopics,
  style,
  companyContext,
  messages,
  onToken,
}) {
  const res = await fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role,
      difficulty,
      resume,
      focus_topics: focusTopics,
      style,
      company_context: companyContext,
      messages,
    }),
  })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let full = ''
  let errored = false

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split('\n\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6)
      if (payload === '[DONE]') continue
      let obj
      try {
        obj = JSON.parse(payload)
      } catch {
        continue
      }
      if (obj.error) {
        errored = true
        continue
      }
      full += obj.text
      onToken?.(full)
    }
  }

  if (errored || !full) throw new Error('stream_failed')
  return full
}

export async function fetchScore({ role, messages }) {
  const res = await fetch('/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, messages }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchHealth() {
  const res = await fetch('/health')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchRoles() {
  const res = await fetch('/roles')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchQuestions({ role = 'swe', difficulty = '' } = {}) {
  const params = new URLSearchParams({ role })
  if (difficulty) params.set('difficulty', difficulty)
  const res = await fetch(`/questions?${params.toString()}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchHint({ role, messages }) {
  const res = await fetch('/hint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, messages }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function rewriteAnswer({ role, question, draft }) {
  const res = await fetch('/rewrite-answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, question, draft }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function analyzeResume({ role, resume }) {
  const res = await fetch('/analyze-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, resume }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function exportMarkdown({ role, difficulty, scorecard, messages }) {
  const res = await fetch('/export-markdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, difficulty, scorecard, messages }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
