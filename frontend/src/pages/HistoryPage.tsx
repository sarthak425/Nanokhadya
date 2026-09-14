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

  // Re-load tests strictly for this operator
  useEffect(() => {
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
  }, [filter, currentOperator?.id]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test History</h1>
          <div className="page-subtitle">
            {total} test{total !== 1 ? 's' : ''}
            {currentOperator && (
              <span style={{ color: 'var(--accent)', fontWeight: 500 }}> — {currentOperator.name} (Only My Records)</span>
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
            marginBottom: 12, padding: '8px 12px', borderRadius: 6,
            background: 'var(--accent-dim)', border: '1px solid var(--border)',
            fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              🔒 <strong>Private Terminal Session:</strong> Showing test records belonging exclusively to <strong>{currentOperator.name}</strong>.
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
