const ROLE_LABELS = {
  swe: 'Software Engineer',
  data: 'Data Science',
  pm: 'Product Manager',
  devops: 'DevOps / SRE',
  security: 'Security Engineer',
}

const STYLE_LABELS = {
  standard: 'Standard Interviewer',
  bar_raiser: 'Bar Raiser (Strict)',
  mentor: 'Tech Lead Mentor',
}

const ROLE_FOCUS_TOPICS = {
  swe: ['Data Structures & Algorithms', 'System Design', 'APIs & Databases', 'Debugging & Testing', 'Behavioral & Ownership'],
  data: ['SQL & Data Wrangling', 'A/B Testing & Experimentation', 'Machine Learning & Modeling', 'Probability & Statistics', 'Product Metrics'],
  pm: ['Product Sense & Design', 'Prioritization & Roadmapping', 'Metrics & Root Cause Analysis', 'Go-To-Market & Strategy', 'Stakeholder Execution'],
  devops: ['Kubernetes & Containers', 'CI/CD & GitOps', 'Observability & SLOs', 'Incident Response', 'Infrastructure as Code'],
  security: ['Threat Modeling', 'Web & API Security (OWASP)', 'IAM & Cryptography', 'Cloud Security Posture', 'Incident Containment'],
}

export function buildReportText(data, role, difficulty) {
  const lines = []
  lines.push('INTERVIEW PREP COACH — SCORECARD')
  lines.push(`Role: ${ROLE_LABELS[role] || role}  |  Difficulty: ${difficulty}`)
  lines.push('')
  lines.push(`Overall score: ${data.overall_score ?? '—'} / 100 (${data.band || 'Unrated'})`)
  if (data.strongest_dimension) lines.push(`Strongest area: ${data.strongest_dimension}`)
  if (data.weakest_dimension) lines.push(`Priority focus: ${data.weakest_dimension}`)
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

export function downloadTextFile(filename, content, mimeType = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export { ROLE_LABELS, STYLE_LABELS, ROLE_FOCUS_TOPICS }
