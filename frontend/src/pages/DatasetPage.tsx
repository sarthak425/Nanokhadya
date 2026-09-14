import { useEffect, useState } from 'react';
import { getDatasets, importDataset } from '../services/api';
import type { Dataset } from '../services/api';
import { Upload, Database } from 'lucide-react';

export function DatasetPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    getDatasets().then(setDatasets).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', file.name.replace('.csv', ''));
    fd.append('isDevelopmentData', 'false');
    try {
      await importDataset(fd);
      setMessage('Dataset imported successfully!');
      load();
    } catch (err: any) {
      setMessage(`Import failed: ${err?.response?.data?.detail ?? err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dataset Management</h1>
          <div className="page-subtitle">Import and manage labelled spectral datasets for ML training</div>
        </div>
        <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
          {uploading ? <><span className="loading-spinner" /> Importing…</> : <><Upload size={14} /> Import CSV</>}
          <input type="file" accept=".csv" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
        </label>
      </div>

      <div className="page-body">
        <div className="dev-banner" style={{ marginBottom: 16 }}>
          <Database size={14} />
          CSV format: sampleId, foodType, label, ch1, ch2, …, ch18
          (18 spectral channel columns required)
        </div>

        {message && (
          <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8,
            background: message.includes('fail') ? 'var(--adulterated-bg)' : 'var(--safe-bg)',
            color: message.includes('fail') ? 'var(--adulterated)' : 'var(--safe)',
            border: `1px solid ${message.includes('fail') ? 'var(--adulterated)' : 'var(--safe)'}`,
            fontSize: 13 }}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="loading-overlay"><span className="loading-spinner" /></div>
        ) : datasets.length === 0 ? (
          <div className="empty-state">
            <Database size={32} color="var(--text-muted)" />
            <p>No datasets yet. Import a labelled CSV to enable ML model training.</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Food Type</th><th>Samples</th><th>Classes</th><th>Dev Data</th><th>Imported</th></tr>
              </thead>
              <tbody>
                {datasets.map(ds => (
                  <tr key={ds.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{ds.name}</td>
                    <td>{ds.foodType}</td>
                    <td className="mono">{ds.sampleCount}</td>
                    <td>
                      {Object.entries(ds.classDistribution).map(([k, v]) => (
                        <span key={k} className="label-tag" style={{ marginRight: 4 }}>{k}: {v}</span>
                      ))}
                    </td>
                    <td style={{ color: ds.isDevelopmentData ? 'var(--suspected)' : 'var(--safe)' }}>
                      {ds.isDevelopmentData ? 'Yes' : 'No'}
                    </td>
                    <td>{new Date(ds.importedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
