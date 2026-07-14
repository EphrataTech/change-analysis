const CATEGORY_COLORS = {
  'Geopolitical Conflict': '#f87171',
  'OPEC Policy': '#fbbf24',
  'Economic Shock': '#a78bfa',
  'Sanctions/Policy': '#34d399',
  'Supply Disruption': '#fb923c',
  'Market Speculation': '#38bdf8',
  'Market Anomaly': '#f472b6',
}

const s = {
  wrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '10px 14px', textAlign: 'left', fontSize: 11,
    color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8,
    borderBottom: '1px solid #2d3148', whiteSpace: 'nowrap'
  },
  td: { padding: '10px 14px', borderBottom: '1px solid #1e2235', verticalAlign: 'middle' },
  badge: (cat) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11,
    background: (CATEGORY_COLORS[cat] || '#64748b') + '22',
    color: CATEGORY_COLORS[cat] || '#94a3b8',
    border: `1px solid ${(CATEGORY_COLORS[cat] || '#64748b')}44`
  }),
  pct: (v) => ({ color: v >= 0 ? '#34d399' : '#f87171', fontWeight: 600 }),
  sig: (s) => ({
    display: 'inline-block', padding: '2px 6px', borderRadius: 4, fontSize: 11,
    background: s ? '#34d39922' : '#64748b22',
    color: s ? '#34d399' : '#64748b'
  })
}

export default function ChangePointTable({ changePoints, events }) {
  if (!changePoints?.length) return <div style={{ color: '#64748b', padding: 20 }}>No change points detected.</div>

  const enriched = changePoints.map(cp => {
    const nearby = events?.find(ev => {
      const d1 = new Date(cp.date), d2 = new Date(ev.date)
      return Math.abs(d1 - d2) < 90 * 86400000
    })
    return { ...cp, event: nearby?.event, category: nearby?.category }
  })

  return (
    <div style={s.wrap}>
      <table style={s.table}>
        <thead>
          <tr>
            {['Date', 'Avg Price Before', 'Avg Price After', '% Change', 'Associated Event'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enriched.map((cp, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
              <td style={s.td}>{cp.date}</td>
              <td style={s.td}>${cp.price_before}</td>
              <td style={s.td}>${cp.price_after}</td>
              <td style={{ ...s.td, ...s.pct(cp.pct_change) }}>
                {cp.pct_change > 0 ? '+' : ''}{cp.pct_change}%
              </td>
              <td style={s.td}>
                {cp.event
                  ? <><span style={s.badge(cp.category)}>{cp.category}</span><span style={{ marginLeft: 8, color: '#cbd5e1' }}>{cp.event}</span></>
                  : <span style={{ color: '#475569' }}>—</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
