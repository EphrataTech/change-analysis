import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'

export default function EventImpactChart({ data, category }) {
  if (!data?.length) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>No data</div>

  const filtered = category && category !== 'All'
    ? data.filter(d => d.category === category)
    : data

  const sorted = [...filtered].sort((a, b) => b.pct_change - a.pct_change)

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, sorted.length * 32)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" horizontal={false} />
        <XAxis
          type="number" tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
        />
        <YAxis
          type="category" dataKey="date" width={80}
          tick={{ fill: '#64748b', fontSize: 10 }}
        />
        <Tooltip
          contentStyle={{ background: '#1e2235', border: '1px solid #3b4268', borderRadius: 8, fontSize: 12 }}
          formatter={(v, _, props) => [
            `${v > 0 ? '+' : ''}${v}% (${props.payload.significant ? 'p<0.05 ✓' : 'not sig.'})`,
            'Price change'
          ]}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.event || label}
          labelStyle={{ color: '#94a3b8', maxWidth: 260, whiteSpace: 'normal' }}
        />
        <ReferenceLine x={0} stroke="#3b4268" />
        <Bar dataKey="pct_change" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, i) => (
            <Cell key={i} fill={entry.pct_change >= 0 ? '#34d399' : '#f87171'} opacity={entry.significant ? 1 : 0.45} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
