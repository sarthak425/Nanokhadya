import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import type { HistoryItem } from '../services/api';
import { FlaskConical } from 'lucide-react';
import { useOperator } from '../context/OperatorContext';

const FOOD_TYPES = ['All', 'Milk', 'Honey', 'Paneer'];

export function HistoryPage() {
  const navigate = useNavigate();
  const { currentOperator } = useOperator();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const loadHistory = () => {
    if (!currentOperator?.id) return;
    setLoading(true);
    getHistory({
      food_type:   filter !== 'All' ? filter : undefined,
      operator_id: currentOperator.id,
      limit: 200,
    })
      .then(r => { setItems(r.items); setTotal(r.total); })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  // Re-load tests strictly for this operator + live updates
  useEffect(() => {
    loadHistory();
    window.addEventListener('nanotech_test_saved', loadHistory);
    return () => window.removeEventListener('nanotech_test_saved', loadHistory);
  }, [filter, currentOperator?.id]);

  const FOOD_EMOJIS: Record<string, string> = {
    Milk: '🐄',
    Honey: '🐝',
    Paneer: '🐃',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test History</h1>
          <div className="page-subtitle" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span>{total} record{total !== 1 ? 's' : ''} stored</span>
            {currentOperator && (
              <>
                <span>·</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  👤 {currentOperator.name}
                </span>
                <span style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}>
                  🔒 ONLY MY RECORDS
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
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
        {/* Private session banner */}
        {currentOperator && (
          <div style={{
            marginBottom: 16, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              🔒 <strong>Single-User Terminal Vault:</strong> All tests displayed here belong exclusively to <strong>{currentOperator.name}</strong> (<span className="mono">{currentOperator.id}</span>). Records are persisted and tied to your PIN login.
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-overlay"><span className="loading-spinner" /> Loading history…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <FlaskConical size={32} color="var(--text-muted)" />
            <p>
              {currentOperator
                ? `No tests found for ${currentOperator.name}.`
                : 'No tests recorded yet.'}
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
                    <th>Test ID</th><th>Food Matrix</th><th>Result</th>
                    <th>Confidence</th><th>Date / Time</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.testId} onClick={() => navigate(`/test/${item.testId}`)} style={{ cursor: 'pointer' }}>
                      <td className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>{item.testId}</td>
                      <td style={{ fontWeight: 600 }}>
                        <span style={{ marginRight: 6 }}>{FOOD_EMOJIS[item.foodType] || '🧪'}</span>
                        {item.foodType}
                      </td>
                      <td><span className={`result-badge ${item.finalLabel}`}>{item.finalLabel}</span></td>
                      <td className="mono">
                        {item.probability !== null && item.probability !== undefined
                          ? `${(item.probability * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(item.timestamp).toLocaleString()}</td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/test/${item.testId}`); }}
                        >
                          View 3D & Report →
                        </button>
                      </td>
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
