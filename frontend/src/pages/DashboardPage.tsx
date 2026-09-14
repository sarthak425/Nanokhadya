import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FlaskConical, Globe, User } from 'lucide-react';
import { getHistory, getSystemStatus } from '../services/api';
import type { HistorySummary, HistoryItem, SystemStatus } from '../services/api';
import { useOperator } from '../context/OperatorContext';

// ── 3D Tilt card ──────────────────────────────────────────────────────
function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width  - 0.5;
    const y = (e.clientY - top)  / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  };

  return (
    <div
      ref={ref}
      className="stat-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ ...style, transition: 'transform 0.1s ease', transformStyle: 'preserve-3d', cursor: 'default' }}
    >
      {children}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { currentOperator } = useOperator();
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [recent, setRecent]   = useState<HistoryItem[]>([]);
  const [status, setStatus]   = useState<SystemStatus | null>(null);
  const [viewScope, setViewScope] = useState<'operator' | 'universal'>('operator');

  useEffect(() => {
    getSystemStatus().then(setStatus).catch(() => {});
  }, []);

  // Re-fetch when operator or viewScope changes
  useEffect(() => {
    const opId = viewScope === 'operator' ? currentOperator?.id : undefined;
    getHistory({ limit: 5, operator_id: opId }).then(r => setRecent(r.items)).catch(() => {});
    getHistory({ limit: 500, operator_id: opId })
      .then(r => {
        const byLabel: Record<string, number> = {};
        const byFood:  Record<string, number> = {};
        for (const item of r.items) {
          byLabel[item.finalLabel] = (byLabel[item.finalLabel] ?? 0) + 1;
          byFood[item.foodType]    = (byFood[item.foodType]    ?? 0) + 1;
        }
        setSummary({ totalTests: r.total, byLabel, byFoodType: byFood });
      })
      .catch(() => {});
  }, [currentOperator?.id, viewScope]);

  const LABEL_COLOR: Record<string, string> = {
    SAFE: 'var(--safe)', AUTHENTIC: 'var(--safe)',
    SUSPECTED: 'var(--suspected)', ADULTERATED: 'var(--adulterated)',
    UNKNOWN: 'var(--unknown)',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <div className="page-subtitle">
            {status?.sensor.type} · {status?.sensor.channels} channels · {status?.sensor.wavelengthRange}
            {viewScope === 'operator' && currentOperator && (
              <span style={{ marginLeft: 12, color: 'var(--accent)', fontWeight: 500 }}>
                — {currentOperator.name}
              </span>
            )}
            {viewScope === 'universal' && (
              <span style={{ marginLeft: 12, color: 'var(--safe)', fontWeight: 500 }}>
                — Universal Overview (All Operators)
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* View Scope Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setViewScope('operator')}
              className={viewScope === 'operator' ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '5px 10px', fontSize: 11, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              title="Show data for currently active operator"
            >
              <User size={12} /> My Data
            </button>
            <button
              onClick={() => setViewScope('universal')}
              className={viewScope === 'universal' ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '5px 10px', fontSize: 11, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              title="Show aggregate data across all operators"
            >
              <Globe size={12} /> Universal
            </button>
          </div>

          <button className="btn btn-primary" onClick={() => navigate('/test')}>
            <FlaskConical size={15} /> New Test
          </button>
        </div>
      </div>

      <div className="page-body">
        {status?.isDevelopmentMode && (
          <div className="dev-banner">
            <Activity size={14} />
            DATA SOURCE: DEVELOPMENT MODE — No physical sensor connected.
            Results use synthetic spectral data. Switch to BLE when hardware is available.
          </div>
        )}

        {/* System Status — 3D tilt cards */}
        <div className="card mb-4">
          <div className="card-header"><div className="card-title">System Status</div></div>
          <div className="grid-4">
            <TiltCard>
              <div className="stat-label">Sensor</div>
              <div className="stat-value" style={{ fontSize: 16 }}>AS7265x</div>
              <div className="stat-sub">18 channels · 410–940 nm</div>
            </TiltCard>
            <TiltCard>
              <div className="stat-label">Data Source</div>
              <div className="stat-value" style={{ fontSize: 16, color: status?.isDevelopmentMode ? 'var(--suspected)' : 'var(--accent)' }}>
                {status?.dataSource ?? '—'}
              </div>
              <div className="stat-sub">{status?.isDevelopmentMode ? 'Dev Mode — Synthetic' : 'Real Sensor'}</div>
            </TiltCard>
            <TiltCard>
              <div className="stat-label">{viewScope === 'operator' ? 'My Tests' : 'Total Tests'}</div>
              <div className="stat-value">{summary?.totalTests ?? '—'}</div>
              <div className="stat-sub">{viewScope === 'operator' ? (currentOperator?.name ?? 'Active Operator') : 'All Operators (Universal)'}</div>
            </TiltCard>
            <TiltCard>
              <div className="stat-label">ML Pipeline</div>
              <div className="stat-value" style={{ fontSize: 16, color: 'var(--safe)' }}>Ready</div>
              <div className="stat-sub">SNV → PCA (k=4) → SVM</div>
            </TiltCard>
          </div>
        </div>

        {/* Result Breakdown & Food Types */}
        {summary && (
          <div className="grid-2 mb-4">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Results Distribution</div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {viewScope === 'operator' ? currentOperator?.name : 'Universal'}
                </span>
              </div>
              {Object.keys(summary.byLabel).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tests yet.</div>
              ) : (
                Object.entries(summary.byLabel).map(([label, count]) => {
                  const pct = summary.totalTests > 0 ? Math.round((count / summary.totalTests) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: LABEL_COLOR[label] ?? 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: LABEL_COLOR[label] ?? 'var(--text-muted)', borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Tests by Food Type</div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {viewScope === 'operator' ? currentOperator?.name : 'Universal'}
                </span>
              </div>
              {Object.keys(summary.byFoodType).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tests yet.</div>
              ) : (
                Object.entries(summary.byFoodType).map(([food, count]) => (
                  <div key={food} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{food}</span>
                    <span className="mono" style={{ color: 'var(--accent)' }}>{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Recent Tests Table */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Tests</div>
            <button className="btn btn-outline" style={{ fontSize: 12 }} onClick={() => navigate('/history')}>
              View All →
            </button>
          </div>
          {recent.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>
              No tests recorded yet. Click <strong>New Test</strong> to run the pipeline.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test ID</th><th>Food Type</th><th>Result</th>
                    <th>Confidence</th><th>Source</th><th>Date / Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(item => (
                    <tr key={item.testId} onClick={() => navigate(`/test/${item.testId}`)}>
                      <td className="mono" style={{ color: 'var(--accent)' }}>{item.testId}</td>
                      <td>{item.foodType}</td>
                      <td><span className={`result-badge ${item.finalLabel}`}>{item.finalLabel}</span></td>
                      <td className="mono">
                        {item.probability !== null && item.probability !== undefined
                          ? `${(item.probability * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ color: item.source === 'DEVELOPMENT' ? 'var(--suspected)' : 'var(--accent)', fontSize: 12 }}>
                        {item.source}
                      </td>
                      <td style={{ fontSize: 12 }}>{new Date(item.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
