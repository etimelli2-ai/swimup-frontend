// Petit graphique en ligne (SVG fait main, pas de dépendance externe) —
// utilisé pour l'évolution de la note Google et le nombre d'avis publiés.
export default function MiniLineChart({ points, color = '#0ea5e9', height = 140, formatValue = (v) => v }) {
  if (!points || points.length === 0) {
    return (
      <div className="flex items-center justify-center h-[140px] text-sm text-slate-400">
        Pas encore assez de données
      </div>
    )
  }

  const width = 100 // viewBox en %, étiré par le conteneur
  const values = points.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padY = 10

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : (i / (points.length - 1)) * width
    const y = padY + (1 - (p.value - min) / range) * (100 - padY * 2)
    return { x, y, value: p.value, label: p.label }
  })

  const pathLine = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ')
  const pathArea = `${pathLine} L ${coords[coords.length - 1].x} 100 L ${coords[0].x} 100 Z`

  return (
    <div style={{ height }} className="w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="miniChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathArea} fill="url(#miniChartFill)" />
        <path d={pathLine} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1.4" fill={color} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex justify-between text-[11px] text-slate-400 mt-1">
        <span>{points[0]?.label}</span>
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {formatValue(points[points.length - 1]?.value)}
        </span>
        <span>{points[points.length - 1]?.label}</span>
      </div>
    </div>
  )
}
