import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function VolatilityChart({ data }) {
  if (!data?.length) return <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>No data</div>

  const thinned = data.length > 1500
    ? data.filter((_, i) => i % Math.ceil(data.length / 1500) === 0)
    : data

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={thinned} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2235" />
        <XAxis
          dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={d => d?.slice(0, 7)}
          interval={Math.floor(thinned.length / 6)}
        />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}%`} />
        <Tooltip
          contentStyle={{ background: '#1e2235', border: '1px solid #3b4268', borderRadius: 8, fontSize: 12 }}
          formatter={v => [`${v?.toFixed(1)}%`, 'Annualised Vol']}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Area type="monotone" dataKey="volatility" stroke="#a78bfa" fill="url(#volGrad)" dot={false} strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
