// Petit graphique en ligne (SVG fait main, pas de dépendance externe) —
// utilisé pour l'évolution de la note Google, du nb d'avis Google et du
// nombre d'avis publiés. Tooltip au survol/tap sur le point le plus proche.
import { useRef, useState } from 'react'

export default function MiniLineChart({ points, color = '#0ea5e9', height = 140, formatValue = (v) => v }) {
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

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

  function pointLePlusProche(clientX) {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    const xPct = ((clientX - rect.left) / rect.width) * width
    let meilleurIndex = 0
    let meilleureDistance = Infinity
    coords.forEach((c, i) => {
      const d = Math.abs(c.x - xPct)
      if (d < meilleureDistance) { meilleureDistance = d; meilleurIndex = i }
    })
    return meilleurIndex
  }

  const actif = hoverIndex !== null ? coords[hoverIndex] : null

  return (
    <div style={{ height }} className="w-full relative">
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible cursor-crosshair"
        onMouseMove={(e) => setHoverIndex(pointLePlusProche(e.clientX))}
        onMouseLeave={() => setHoverIndex(null)}
        onTouchMove={(e) => { if (e.touches[0]) setHoverIndex(pointLePlusProche(e.touches[0].clientX)) }}
        onTouchEnd={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id="miniChartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={pathArea} fill="url(#miniChartFill)" />
        <path d={pathLine} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hoverIndex === i ? 2.4 : 1.4}
            fill={color}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {actif && (
          <line
            x1={actif.x} y1="0" x2={actif.x} y2="100"
            stroke={color} strokeOpacity="0.25" strokeWidth="1" vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {actif && (
        <div
          className="absolute -top-1 px-2 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-[11px] font-semibold shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: `${actif.x}%`,
            transform: `translateX(${actif.x < 15 ? '0%' : actif.x > 85 ? '-100%' : '-50%'})`,
          }}
        >
          {formatValue(actif.value)} · {actif.label}
        </div>
      )}

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
