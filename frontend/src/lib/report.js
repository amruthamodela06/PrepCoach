const ROLE_LABELS = { swe: 'Software Engineer', data: 'Data Science', pm: 'Product Manager' }

export function buildReportText(data, role, difficulty) {
  const lines = []
  lines.push('INTERVIEW PREP COACH — SCORECARD')
  lines.push(`Role: ${ROLE_LABELS[role] || role}  |  Difficulty: ${difficulty}`)
  lines.push('')
  lines.push(`Overall score: ${data.overall_score ?? '—'} / 100 (${data.band || 'Unrated'})`)
  lines.push('')
  if (Array.isArray(data.dimensions) && data.dimensions.length) {
    lines.push('Breakdown:')
    data.dimensions.forEach((d) => lines.push(`  - ${d.name}: ${d.score}`))
    lines.push('')
  }
  if (Array.isArray(data.improvements) && data.improvements.length) {
    lines.push('What to improve:')
    data.improvements.forEach((imp) => {
      lines.push(`  - ${imp.what}`)
      lines.push(`    -> ${imp.where}`)
    })
    lines.push('')
  }
  if (Array.isArray(data.ideal_answers) && data.ideal_answers.length) {
    lines.push('Ideal answers:')
    data.ideal_answers.forEach((qa, i) => {
      lines.push(`  Q${i + 1}: ${qa.question}`)
      lines.push(`  Ideal: ${qa.ideal}`)
      lines.push('')
    })
  }
  return lines.join('\n')
}

export { ROLE_LABELS }
