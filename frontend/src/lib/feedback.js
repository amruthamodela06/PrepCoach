// Parses a completed assistant turn into feedback + surrounding text, so the
// UI can render evaluation (Strengths/Gaps/Stronger answer) in a visually
// distinct card, separate from the plain question text.
export function parseFeedback(text) {
  const m = text.match(/\*\*Strengths:?\*\*([\s\S]*?)\*\*Gaps:?\*\*([\s\S]*?)\*\*Stronger answer:?\*\*([\s\S]*)/i)
  if (!m) return null
  const before = text.slice(0, m.index).trim()
  const strengths = m[1].trim()
  const gaps = m[2].trim()
  const rest = m[3].trim()
  const parts = rest.split(/\n\s*\n/)
  const strongerAnswer = (parts[0] || '').trim()
  const nextQuestion = parts.slice(1).join('\n\n').trim()
  return { before, strengths, gaps, strongerAnswer, nextQuestion }
}

export function bulletsFromBlock(block) {
  return block
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

export function stripMarkdownForSpeech(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^[-*]\s*/gm, '')
    .replace(/\n{2,}/g, '. ')
    .trim()
}

// Splits a raw assistant message into an ordered list of render blocks:
// plain text / a feedback card / plain text. Mirrors the vanilla app's
// renderCompletedAssistantTurn, but as a pure function for React rendering.
export function splitAssistantMessage(text) {
  const parsed = parseFeedback(text)
  if (!parsed) return [{ type: 'text', text }]
  const blocks = []
  if (parsed.before) blocks.push({ type: 'text', text: parsed.before })
  blocks.push({ type: 'feedback', strengths: parsed.strengths, gaps: parsed.gaps, strongerAnswer: parsed.strongerAnswer })
  if (parsed.nextQuestion) blocks.push({ type: 'text', text: parsed.nextQuestion })
  return blocks
}
