const s = {
  card: {
    background: '#1a1d27',
    border: '1px solid #2d3148',
    borderRadius: 12,
    padding: '20px 24px',
  },
  label: { fontSize: 12, color: '#8892b0', textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 28, fontWeight: 700, color: '#e2e8f0', marginTop: 4 },
  sub: { fontSize: 13, color: '#64748b', marginTop: 4 },
  pos: { color: '#34d399' },
  neg: { color: '#f87171' },
}

export default function StatCard({ label, value, sub, trend }) {
  return (
    <div style={s.card}>
      <div style={s.label}>{label}</div>
      <div style={{ ...s.value, ...(trend === 'pos' ? s.pos : trend === 'neg' ? s.neg : {}) }}>
        {value}
      </div>
      {sub && <div style={s.sub}>{sub}</div>}
    </div>
  )
}
