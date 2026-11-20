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

const FILLER_REGEX = /\b(um+|uh+|er+|basically|honestly|literally|sort of|kind of|you know)\b/gi
const METRIC_REGEX = /\b\d+(?:\.\d+)?(?:\s*%|\s*ms|\s*s|\s*x|\s*k|\s*m|\s*gb|\s*mb|\s*rps|\s*qps|\s*users|\s*rows)?\b/i
const STRUCTURE_REGEX = /\b(because|trade-?off|first|second|resulted in|measured|specifically|for example|bottleneck)\b/i

export function analyzeDraftAnswer(text) {
  const clean = (text || '').trim()
  if (!clean) {
    return { wordCount: 0, speakingSeconds: 0, fillerCount: 0, hasMetrics: false, hasStructure: false, depthLabel: 'Empty' }
  }
  const words = clean.split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const speakingSeconds = Math.max(1, Math.round((wordCount / 140) * 60))
  const fillers = clean.match(FILLER_REGEX) || []
  const fillerCount = fillers.length
  const hasMetrics = METRIC_REGEX.test(clean)
  const hasStructure = STRUCTURE_REGEX.test(clean)

  let depthLabel = 'Brief'
  if (wordCount >= 80) depthLabel = 'Detailed'
  else if (wordCount >= 35) depthLabel = 'Solid length'

  return {
    wordCount,
    speakingSeconds,
    fillerCount,
    hasMetrics,
    hasStructure,
    depthLabel,
  }
}
