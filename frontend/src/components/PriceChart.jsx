import {
  ComposedChart, Line, ReferenceLine, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const CATEGORY_COLORS = {
  'Geopolitical Conflict': '#f87171',
  'OPEC Policy': '#fbbf24',
  'Economic Shock': '#a78bfa',
  'Sanctions/Policy': '#34d399',
  'Supply Disruption': '#fb923c',
  'Market Speculation': '#38bdf8',
  'Market Anomaly': '#f472b6',
}

const CustomTooltip = ({ active, payload, label, events }) => {
  if (!active || !payload?.length) return null
  const price = payload[0]?.value
  const ev = events?.find(e => e.date === label)
  return (
    <div style={{
      background: '#1e2235', border: '1px solid #3b4268',
      borderRadius: 8, padding: '10px 14px', fontSize: 13
    }}>
      <div style={{ color: '#94a3b8', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#60a5fa', fontWeight: 600 }}>${price?.toFixed(2)}/bbl</div>
      {ev && (
        <div style={{ marginTop: 6, color: CATEGORY_COLORS[ev.category] || '#e2e8f0', maxWidth: 220 }}>
          ⚡ {ev.event}
        </div>
      )}
    </div>
  )
}

export default function PriceChart({ prices, events, changePoints, showEvents, showChangePoints }) {
  if (!prices?.length) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>No data</div>

  const eventDates = new Set((events || []).map(e => e.date))
  const cpDates = new Set((changePoints || []).map(c => c.date))

  const filteredEvents = showEvents ? (events || []) : []
  const filteredCPs = showChangePoints ? (changePoints || []) : []

  // Thin data for performance if > 2000 points
  const data = prices.length > 2000
    ? prices.filter((_, i) => i % Math.ceil(prices.length / 2000) === 0)
    : prices

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
        <XAxis
          dataKey="date"
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={d => d?.slice(0, 7)}
          interval={Math.floor(data.length / 8)}
        />
        <YAxis
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={v => `$${v}`}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip events={filteredEvents} />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />

        <Line
          type="monotone" dataKey="price" name="Brent Price (USD/bbl)"
          stroke="#3b82f6" dot={false} strokeWidth={1.5}
        />

        {filteredEvents.map(ev => (
          <ReferenceLine
            key={ev.date} x={ev.date}
            stroke={CATEGORY_COLORS[ev.category] || '#94a3b8'}
            strokeDasharray="4 3" strokeWidth={1.2}
            label={{ value: '', position: 'top' }}
          />
        ))}

        {filteredCPs.map(cp => (
          <ReferenceLine
            key={cp.date} x={cp.date}
            stroke="#f59e0b" strokeWidth={2}
            label={{ value: '▼', position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
