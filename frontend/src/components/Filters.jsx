const CATEGORIES = ['All', 'Geopolitical Conflict', 'OPEC Policy', 'Economic Shock', 'Sanctions/Policy', 'Supply Disruption', 'Market Speculation', 'Market Anomaly']

const s = {
  wrap: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, padding: '20px 24px' },
  title: { fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16 },
  row: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 },
  label: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  input: {
    width: '100%', background: '#0f1117', border: '1px solid #2d3148',
    borderRadius: 6, padding: '6px 10px', color: '#e2e8f0', fontSize: 13,
  },
  btn: (active) => ({
    padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
    border: '1px solid', transition: 'all .15s',
    background: active ? '#3b82f6' : 'transparent',
    borderColor: active ? '#3b82f6' : '#2d3148',
    color: active ? '#fff' : '#94a3b8',
  }),
  resampleRow: { display: 'flex', gap: 6, marginBottom: 16 },
}

export default function Filters({ filters, onChange }) {
  const { start, end, category, resample } = filters
  const set = (k, v) => onChange({ ...filters, [k]: v })

  return (
    <div style={s.wrap}>
      <div style={s.title}>Filters</div>

      <div style={s.grid}>
        <div>
          <div style={s.label}>Start date</div>
          <input type="date" style={s.input} value={start} onChange={e => set('start', e.target.value)} />
        </div>
        <div>
          <div style={s.label}>End date</div>
          <input type="date" style={s.input} value={end} onChange={e => set('end', e.target.value)} />
        </div>
      </div>

      <div style={s.label}>Resample</div>
      <div style={s.resampleRow}>
        {['', 'W', 'M', 'Q', 'Y'].map(r => (
          <button key={r} style={s.btn(resample === r)} onClick={() => set('resample', r)}>
            {r || 'Daily'}
          </button>
        ))}
      </div>

      <div style={s.label}>Event category</div>
      <div style={s.row}>
        {CATEGORIES.map(c => (
          <button key={c} style={s.btn(category === c)} onClick={() => set('category', c)}>
            {c}
          </button>
        ))}
      </div>
    </div>
  )
}
