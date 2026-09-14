import { useEffect, useState } from 'react';
import { getModels, getDatasets, trainModel } from '../services/api';
import type { MLModel, Dataset } from '../services/api';
import { Brain, Play } from 'lucide-react';

export function ModelPage() {
  const [models, setModels] = useState<MLModel[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDs, setSelectedDs] = useState('');
  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getModels().then(setModels).catch(() => {});
    getDatasets().then(ds => { setDatasets(ds); if (ds.length) setSelectedDs(ds[0].id); }).catch(() => {});
  }, []);

  const handleTrain = async () => {
    if (!selectedDs) { setError('Select a dataset first'); return; }
    setTraining(true); setError(''); setTrainResult(null);
    try {
      const r = await trainModel({ datasetId: selectedDs });
      setTrainResult(r);
      getModels().then(setModels).catch(() => {});
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Training failed');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ML Models</h1>
          <div className="page-subtitle">PCA + SVM model training and management</div>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ alignItems: 'start', marginBottom: 24 }}>
          <div className="card">
            <div className="card-title mb-4">Train New Model</div>
            <div className="form-group mb-4">
              <label className="form-label">Dataset</label>
              <select className="form-select" value={selectedDs} onChange={e => setSelectedDs(e.target.value)}>
                {datasets.length === 0
                  ? <option>No datasets — import a CSV first</option>
                  : datasets.map(d => <option key={d.id} value={d.id}>{d.name} ({d.sampleCount} samples)</option>)
                }
              </select>
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTrain} disabled={training || !selectedDs}>
              {training ? <><span className="loading-spinner" /> Training…</> : <><Play size={14} /> Train PCA + SVM</>}
            </button>
            {error && <div style={{ marginTop: 12, color: 'var(--adulterated)', fontSize: 13 }}>{error}</div>}
          </div>

          {trainResult && (
            <div className="card">
              <div className="card-title mb-4" style={{ color: 'var(--safe)' }}>✓ Training Complete</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Model ID: </span><span className="mono">{trainResult.modelId}</span></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Version: </span>{trainResult.version}</div>
                <div><span style={{ color: 'var(--text-muted)' }}>Samples: </span>{trainResult.sampleCount}</div>
                {trainResult.metrics?.cv_mean_accuracy !== undefined && (
                  <div><span style={{ color: 'var(--text-muted)' }}>CV Accuracy: </span>
                    <span className="mono" style={{ color: 'var(--safe)' }}>
                      {(trainResult.metrics.cv_mean_accuracy * 100).toFixed(1)}% ± {(trainResult.metrics.cv_std_accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
                {trainResult.isDevelopmentModel && (
                  <div style={{ marginTop: 8, color: 'var(--suspected)', fontSize: 12 }}>
                    ⚠ Development model — trained on synthetic data. Not for real-world use.
                  </div>
                )}
                {trainResult.warnings?.map((w: string, i: number) => (
                  <div key={i} style={{ color: 'var(--suspected)', fontSize: 12 }}>• {w}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <div className="card-title">Registered Models</div>
          </div>
          {models.length === 0 ? (
            <div className="empty-state">
              <Brain size={32} color="var(--text-muted)" />
              <p>No models yet. A development model will be automatically trained on first test.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Version</th><th>Food Type</th><th>Samples</th><th>CV Accuracy</th><th>Dev Model</th><th>Trained</th></tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.model_id}>
                    <td className="mono" style={{ color: 'var(--accent)', fontSize: 11 }}>{m.model_id}</td>
                    <td className="mono">{m.version}</td>
                    <td>{m.food_type}</td>
                    <td className="mono">{m.sample_count}</td>
                    <td className="mono" style={{ color: 'var(--safe)' }}>
                      {m.metrics?.cv_mean_accuracy !== undefined
                        ? `${((m.metrics.cv_mean_accuracy as number) * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td style={{ color: m.is_development_model ? 'var(--suspected)' : 'var(--safe)' }}>
                      {m.is_development_model ? 'Yes' : 'No'}
                    </td>
                    <td>{new Date(m.trained_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
