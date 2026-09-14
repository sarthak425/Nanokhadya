import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import type { HistoryItem } from '../services/api';
import { FlaskConical, Globe, User } from 'lucide-react';
import { useOperator } from '../context/OperatorContext';

const FOOD_TYPES = ['All', 'Milk', 'Cooking Oil', 'Spice', 'Honey', 'Other'];

export function HistoryPage() {
  const navigate = useNavigate();
  const { currentOperator } = useOperator();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [viewScope, setViewScope] = useState<'operator' | 'universal'>('operator');

  // Re-load when operator, filter, or viewScope changes
  useEffect(() => {
    setLoading(true);
    const opId = viewScope === 'operator' ? currentOperator?.id : undefined;
    getHistory({
      food_type:   filter !== 'All' ? filter : undefined,
      operator_id: opId,
      limit: 200,
    })
      .then(r => { setItems(r.items); setTotal(r.total); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter, currentOperator?.id, viewScope]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test History</h1>
          <div className="page-subtitle">
            {total} test{total !== 1 ? 's' : ''}
            {viewScope === 'operator' && currentOperator && (
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}> — {currentOperator.name}</span>
            )}
            {viewScope === 'universal' && (
              <span style={{ color: 'var(--safe)', fontWeight: 500 }}> — Universal (All Operators)</span>
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
              title="Filter by current operator"
            >
              <User size={12} /> My Tests
            </button>
            <button
              onClick={() => setViewScope('universal')}
              className={viewScope === 'universal' ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '5px 10px', fontSize: 11, border: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
              title="Show all tests across all operators"
            >
              <Globe size={12} /> All Tests
            </button>
          </div>

          <select
            className="form-select"
            style={{ width: 140 }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            {FOOD_TYPES.map(f => <option key={f}>{f}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => navigate('/test')}>
            <FlaskConical size={14} /> New Test
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Scope notice banner */}
        {viewScope === 'operator' && currentOperator && (
          <div style={{
            marginBottom: 12, padding: '8px 12px', borderRadius: 6,
            background: 'var(--accent-dim)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              👤 Showing tests for <strong>{currentOperator.name}</strong> ({currentOperator.id}).
            </div>
            <button
              onClick={() => setViewScope('universal')}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
            >
              Switch to Universal view →
            </button>
          </div>
        )}

        {viewScope === 'universal' && (
          <div style={{
            marginBottom: 12, padding: '8px 12px', borderRadius: 6,
            background: 'var(--safe-bg)', border: '1px solid rgba(63, 185, 80, 0.3)',
            fontSize: 12, color: 'var(--safe)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              🌐 <strong>Universal Mode:</strong> Showing all tests from all operators across the platform.
            </div>
            {currentOperator && (
              <button
                onClick={() => setViewScope('operator')}
                style={{ background: 'none', border: 'none', color: 'var(--safe)', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}
              >
                Filter by {currentOperator.name} only →
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="loading-overlay"><span className="loading-spinner" /> Loading history…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={32} color="var(--text-muted)" />
            <p>
              {viewScope === 'operator' && currentOperator
                ? `No tests found for ${currentOperator.name}.`
                : 'No tests found in the system.'}
            </p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/test')}>
              Run First Test
            </button>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test ID</th><th>Food Type</th><th>Result</th>
                    <th>Confidence</th><th>Source</th><th>Date / Time</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
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
          </div>
        )}
      </div>
    </div>
  );
}
