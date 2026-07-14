import { useState } from 'react'
import { useApi } from './hooks/useApi'
import StatCard from './components/StatCard'
import Filters from './components/Filters'
import PriceChart from './components/PriceChart'
import VolatilityChart from './components/VolatilityChart'
import EventImpactChart from './components/EventImpactChart'
import ChangePointTable from './components/ChangePointTable'

const s = {
  app: { minHeight: '100vh', background: '#0f1117' },
  header: {
    background: '#1a1d27', borderBottom: '1px solid #2d3148',
    padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
  },
  logo: { fontSize: 18, fontWeight: 700, color: '#e2e8f0' },
  logoSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: '50%', background: '#34d399', display: 'inline-block', marginRight: 6 },
  main: { maxWidth: 1400, margin: '0 auto', padding: '24px 24px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  layout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, marginBottom: 24 },
  card: { background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 12, padding: '20px 24px' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 16 },
  tabs: { display: 'flex', gap: 4, marginBottom: 20 },
  tab: (active) => ({
    padding: '7px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
    border: 'none', transition: 'all .15s',
    background: active ? '#3b82f6' : '#1e2235',
    color: active ? '#fff' : '#64748b',
  }),
  toggleRow: { display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  toggle: (on) => ({
    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    fontSize: 12, color: on ? '#e2e8f0' : '#475569', userSelect: 'none'
  }),
  toggleDot: (on, color) => ({
    width: 10, height: 10, borderRadius: '50%',
    background: on ? color : '#2d3148', transition: 'background .15s'
  }),
  loading: { color: '#64748b', padding: '40px 0', textAlign: 'center', fontSize: 14 },
  windowRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  windowLabel: { fontSize: 12, color: '#64748b' },
  windowInput: {
    width: 70, background: '#0f1117', border: '1px solid #2d3148',
    borderRadius: 6, padding: '4px 8px', color: '#e2e8f0', fontSize: 13
  }
}

const TABS = ['Price History', 'Volatility', 'Event Impact', 'Change Points']

export default function App() {
  const [tab, setTab] = useState('Price History')
  const [filters, setFilters] = useState({ start: '1990-01-01', end: '', category: 'All', resample: '' })
  const [showEvents, setShowEvents] = useState(true)
  const [showCPs, setShowCPs] = useState(true)
  const [volWindow, setVolWindow] = useState(30)
  const [impactWindow, setImpactWindow] = useState(30)

  const { data: summary } = useApi('summary')
  const { data: prices, loading: pricesLoading } = useApi('prices', {
    start: filters.start, end: filters.end, resample: filters.resample
  })
  const { data: events } = useApi('events')
  const { data: changePoints } = useApi('change-points')
  const { data: volatility, loading: volLoading } = useApi('volatility', {
    window: volWindow, start: filters.start, end: filters.end
  })
  const { data: eventImpact, loading: impactLoading } = useApi('event-impact', { window: impactWindow })

  const filteredEvents = filters.category === 'All'
    ? events
    : events?.filter(e => e.category === filters.category)

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div>
          <div style={s.logo}>🛢 Brent Oil Price Dashboard</div>
          <div style={s.logoSub}>Birhan Energies — Change Point & Event Analysis</div>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>
          <span style={s.dot} />
          {summary ? `${summary.date_range.start} → ${summary.date_range.end}` : 'Loading...'}
        </div>
      </header>

      <main style={s.main}>
        {/* KPI row */}
        <div style={s.statsRow}>
          <StatCard label="Current Price" value={summary ? `$${summary.price.current}` : '—'} sub="USD/bbl" />
          <StatCard label="All-time High" value={summary ? `$${summary.price.max}` : '—'} sub="Jul 2008" trend="pos" />
          <StatCard label="All-time Low" value={summary ? `$${summary.price.min}` : '—'} sub="Dec 1998" trend="neg" />
          <StatCard label="Mean Price" value={summary ? `$${summary.price.mean}` : '—'} sub="1987–2022" />
          <StatCard label="Ann. Volatility" value={summary ? `${summary.volatility.annualised_pct}%` : '—'} sub="Log returns" />
          <StatCard label="Observations" value={summary ? summary.total_observations.toLocaleString() : '—'} sub="Daily records" />
        </div>

        {/* Filters + Chart layout */}
        <div style={s.layout}>
          <Filters filters={filters} onChange={setFilters} />

          <div>
            {/* Tabs */}
            <div style={s.tabs}>
              {TABS.map(t => (
                <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>

            {/* Price History */}
            {tab === 'Price History' && (
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={s.cardTitle}>Brent Crude Oil Price (USD/bbl)</div>
                  <div style={s.toggleRow}>
                    <label style={s.toggle(showEvents)} onClick={() => setShowEvents(v => !v)}>
                      <span style={s.toggleDot(showEvents, '#f87171')} /> Events
                    </label>
                    <label style={s.toggle(showCPs)} onClick={() => setShowCPs(v => !v)}>
                      <span style={s.toggleDot(showCPs, '#f59e0b')} /> Change Points
                    </label>
                  </div>
                </div>
                {pricesLoading
                  ? <div style={s.loading}>Loading price data...</div>
                  : <PriceChart
                      prices={prices}
                      events={filteredEvents}
                      changePoints={changePoints}
                      showEvents={showEvents}
                      showChangePoints={showCPs}
                    />
                }
              </div>
            )}

            {/* Volatility */}
            {tab === 'Volatility' && (
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={s.cardTitle}>Annualised Rolling Volatility (%)</div>
                  <div style={s.windowRow}>
                    <span style={s.windowLabel}>Window (days)</span>
                    <input
                      type="number" min={5} max={252} style={s.windowInput}
                      value={volWindow} onChange={e => setVolWindow(Number(e.target.value))}
                    />
                  </div>
                </div>
                {volLoading
                  ? <div style={s.loading}>Loading volatility data...</div>
                  : <VolatilityChart data={volatility} />
                }
                <div style={{ marginTop: 12, fontSize: 12, color: '#475569' }}>
                  Volatility clustering is visible around the 2008 GFC, 2014–16 OPEC price war, and 2020 COVID shock.
                  High volatility periods coincide with major geopolitical and economic events.
                </div>
              </div>
            )}

            {/* Event Impact */}
            {tab === 'Event Impact' && (
              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={s.cardTitle}>
                    Mean Price Change Around Events (±{impactWindow} days)
                    <span style={{ marginLeft: 8, fontSize: 11, color: '#475569' }}>
                      Faded bars = not statistically significant (p≥0.05)
                    </span>
                  </div>
                  <div style={s.windowRow}>
                    <span style={s.windowLabel}>Window (days)</span>
                    <input
                      type="number" min={5} max={90} style={s.windowInput}
                      value={impactWindow} onChange={e => setImpactWindow(Number(e.target.value))}
                    />
                  </div>
                </div>
                {impactLoading
                  ? <div style={s.loading}>Loading event impact data...</div>
                  : <EventImpactChart data={eventImpact} category={filters.category} />
                }
              </div>
            )}

            {/* Change Points */}
            {tab === 'Change Points' && (
              <div style={s.card}>
                <div style={s.cardTitle}>Detected Structural Breaks</div>
                <div style={{ fontSize: 12, color: '#475569', marginBottom: 16 }}>
                  Change points detected using PELT algorithm (RBF cost). Avg price computed over ±90 day windows.
                  Associated events matched within 90 days of each break.
                </div>
                <ChangePointTable changePoints={changePoints} events={events} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
