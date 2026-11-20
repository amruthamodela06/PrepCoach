const SIZE = 220
const CENTER = SIZE / 2
const RADIUS = 72

function polarToCartesian(angleRad, fraction) {
  const r = RADIUS * Math.max(0, Math.min(1, fraction))
  return {
    x: CENTER + r * Math.cos(angleRad),
    y: CENTER + r * Math.sin(angleRad),
  }
}

export default function RadarChart({ dimensions = [], prevDimensions = [] }) {
  if (!Array.isArray(dimensions) || dimensions.length < 3) return null

  const count = dimensions.length
  const angles = dimensions.map((_, i) => (Math.PI * 2 * i) / count - Math.PI / 2)

  const rings = [0.25, 0.5, 0.75, 1]
  const currentPoints = dimensions
    .map((d, i) => {
      const score = Math.max(0, Math.min(100, Number(d.score) || 0))
      const pt = polarToCartesian(angles[i], score / 100)
      return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
    })
    .join(' ')

  let prevPoints = null
  if (Array.isArray(prevDimensions) && prevDimensions.length >= count) {
    prevPoints = dimensions
      .map((d, i) => {
        const match = prevDimensions.find((p) => p.name === d.name) || prevDimensions[i]
        const score = Math.max(0, Math.min(100, Number(match?.score) || 0))
        const pt = polarToCartesian(angles[i], score / 100)
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`
      })
      .join(' ')
  }

  return (
    <div className="radar-chart-wrap" aria-label="Dimension radar chart">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="radar-svg">
        {rings.map((r) => {
          const pts = angles
            .map((a) => {
              const p = polarToCartesian(a, r)
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
            })
            .join(' ')
          return <polygon key={r} points={pts} className="radar-grid-ring" />
        })}

        {angles.map((a, i) => {
          const outer = polarToCartesian(a, 1)
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={outer.x}
              y2={outer.y}
              className="radar-axis-line"
            />
          )
        })}

        {prevPoints && <polygon points={prevPoints} className="radar-polygon-prev" />}
        <polygon points={currentPoints} className="radar-polygon-current" />

        {dimensions.map((d, i) => {
          const score = Math.max(0, Math.min(100, Number(d.score) || 0))
          const pt = polarToCartesian(angles[i], score / 100)
          const labelPt = polarToCartesian(angles[i], 1.24)
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="3.5" className="radar-vertex" />
              <text
                x={labelPt.x}
                y={labelPt.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="radar-label"
              >
                {(d.name || '').split(' ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
