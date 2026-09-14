import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Users, Cpu, FlaskConical, Database, Brain,
  Plus, Trash2, RefreshCw, ChevronRight, CheckCircle,
  AlertTriangle, XCircle, HelpCircle, Server, Activity,
} from 'lucide-react';
import {
  getAdminOverview, getOperators, createOperator, deleteOperator,
  getAdminDevices, getAdminTests, getAdminSystem,
  type AdminOverview, type Operator, type DeviceRecord, type AdminTestItem,
} from '../services/api';

// ── Shared ────────────────────────────────────────────────────────
const TABS = ['Overview', 'Operators', 'Devices', 'All Tests', 'System'] as const;
type Tab = typeof TABS[number];

const FOOD_TYPES = ['All', 'Milk', 'Cooking Oil', 'Spice', 'Honey', 'Other'];
const LABELS     = ['All', 'SAFE', 'SUSPECTED', 'ADULTERATED', 'UNKNOWN'];
const SOURCES    = ['All', 'DEVELOPMENT', 'BLE'];

function ResultBadge({ label }: { label: string }) {
  return <span className={`result-badge ${(label ?? 'UNKNOWN').toLowerCase()}`}>{label ?? 'UNKNOWN'}</span>;
}

function StatCard({ icon: Icon, label, value, sub, color = 'var(--accent)' }: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string; value: number | string; sub?: string; color?: string;
}) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Tab: Overview ────────────────────────────────────────────────
function OverviewTab({ ov }: { ov: AdminOverview | null }) {
  if (!ov) return <div className="loading-overlay"><span className="loading-spinner" /> Loading overview…</div>;
  const labelColors: Record<string, string> = { SAFE: 'var(--safe)', SUSPECTED: 'var(--suspected)', ADULTERATED: 'var(--adulterated)', UNKNOWN: 'var(--unknown)' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI Row */}
      <div className="admin-kpi-grid">
        <StatCard icon={FlaskConical} label="Total Tests"    value={ov.totalTests}    color="var(--accent)" />
        <StatCard icon={Users}        label="Operators"      value={ov.totalOperators} color="var(--safe)" />
        <StatCard icon={Cpu}          label="Devices"        value={ov.totalDevices}   color="var(--suspected)" />
        <StatCard icon={Database}     label="Datasets"       value={ov.totalDatasets}  color="var(--accent-hover)" />
        <StatCard icon={Brain}        label="Models"         value={ov.totalModels}    color="var(--safe)" />
        <StatCard icon={Activity}     label="BLE Tests"      value={ov.bleTests}       sub={`${ov.devTests} dev`} color="var(--accent)" />
      </div>

      {/* Result Distribution + Food Type Side by Side */}
      <div className="grid-2">
        <div className="card">
          <div className="card-title mb-4">Results Distribution</div>
          {Object.keys(ov.byLabel).length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tests yet.</div>
            : Object.entries(ov.byLabel).map(([label, count]) => {
              const pct = ov.totalTests > 0 ? Math.round(count / ov.totalTests * 100) : 0;
              return (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: labelColors[label] ?? 'var(--text-muted)', fontWeight: 600 }}>{label}</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: labelColors[label] ?? 'var(--border)', borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              );
            })}
        </div>

        <div className="card">
          <div className="card-title mb-4">Tests by Food Type</div>
          {Object.keys(ov.byFoodType).length === 0
            ? <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tests yet.</div>
            : Object.entries(ov.byFoodType).sort((a, b) => b[1] - a[1]).map(([ft, count]) => (
              <div key={ft} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-primary)' }}>{ft}</span>
                <span className="mono" style={{ color: 'var(--text-secondary)' }}>{count}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Data source + last test */}
      <div className="card">
        <div className="card-title mb-4">System Info</div>
        {[
          ['Data Source',  <span className={`source-badge ${ov.dataSource === 'DEVELOPMENT' ? 'development' : 'ble'}`}>{ov.dataSource}</span>],
          ['App Version',  ov.appVersion],
          ['Latest Test',  ov.latestTestAt ? new Date(ov.latestTestAt).toLocaleString() : 'Never'],
          ['Dev Tests',    ov.devTests],
          ['BLE Tests',    ov.bleTests],
        ].map(([k, v]) => (
          <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{k}</span>
            <span className="mono">{v as React.ReactNode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tab: Operators ───────────────────────────────────────────────
function OperatorsTab() {
  const [ops, setOps]         = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [newId, setNewId]     = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    try { setOps(await getOperators()); } catch { setOps([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setError('');
    if (!newId.trim() || !newName.trim()) { setError('Both ID and name are required.'); return; }
    if (!/^[a-z0-9_-]+$/i.test(newId)) { setError('ID may only contain letters, numbers, hyphens and underscores.'); return; }
    try {
      await createOperator(newId.trim().toLowerCase(), newName.trim());
      setNewId(''); setNewName(''); setAdding(false);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to create operator';
      setError(msg);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete operator "${name}" (${id})? This will fail if they have tests.`)) return;
    try {
      await deleteOperator(id);
      await load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to delete operator';
      alert(msg);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{ops.length} operator{ops.length !== 1 ? 's' : ''}</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={load}><RefreshCw size={14} /> Refresh</button>
          <button className="btn btn-primary" onClick={() => setAdding(a => !a)}><Plus size={14} /> New Operator</button>
        </div>
      </div>

      {adding && (
        <div className="card" style={{ marginBottom: 16, border: '1px solid var(--accent-dim)' }}>
          <div className="card-title mb-4">Add Operator</div>
          <div className="grid-3" style={{ alignItems: 'end' }}>
            <div>
              <label className="form-label">Operator ID</label>
              <input className="form-input" placeholder="e.g. lab-tech-01" value={newId} onChange={e => setNewId(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Display Name</label>
              <input className="form-input" placeholder="e.g. Lab Technician 1" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreate}>Create</button>
          </div>
          {error && <div style={{ marginTop: 10, color: 'var(--adulterated)', fontSize: 13 }}>{error}</div>}
        </div>
      )}

      {loading ? (
        <div className="loading-overlay"><span className="loading-spinner" /> Loading operators…</div>
      ) : ops.length === 0 ? (
        <div className="empty-state"><Users size={32} color="var(--text-muted)" /><p>No operators yet. Create one above.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Tests</th><th>Last Test</th><th>Created</th><th></th></tr></thead>
              <tbody>
                {ops.map(op => (
                  <tr key={op.id}>
                    <td className="mono" style={{ color: 'var(--accent)' }}>{op.id}</td>
                    <td style={{ fontWeight: 500 }}>{op.name}</td>
                    <td className="mono">{op.testCount}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{op.lastTestAt ? new Date(op.lastTestAt).toLocaleString() : '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(op.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--adulterated)', padding: '4px 8px', borderRadius: 4 }}
                        onClick={() => handleDelete(op.id, op.name)}
                        title="Delete operator"
                      >
                        <Trash2 size={14} />
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
  );
}

// ── Tab: Devices ────────────────────────────────────────────────
function DevicesTab() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAdminDevices().then(setDevices).catch(() => setDevices([])).finally(() => setLoading(false));
  }, []);

  return loading ? (
    <div className="loading-overlay"><span className="loading-spinner" /> Loading devices…</div>
  ) : devices.length === 0 ? (
    <div className="empty-state"><Cpu size={32} color="var(--text-muted)" /><p>No devices registered yet.</p></div>
  ) : (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead><tr><th>Device ID</th><th>Sensor</th><th>Channels</th><th>Firmware</th><th>Tests</th><th>Last Test</th><th>Registered</th></tr></thead>
          <tbody>
            {devices.map(d => (
              <tr key={d.id}>
                <td className="mono" style={{ color: 'var(--accent)' }}>{d.id}</td>
                <td>{d.sensorType}</td>
                <td className="mono">{d.channelCount}</td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>{d.firmwareVersion ?? '—'}</td>
                <td className="mono">{d.testCount}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.lastTestAt ? new Date(d.lastTestAt).toLocaleString() : '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(d.registeredAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: All Tests ───────────────────────────────────────────────
function AllTestsTab() {
  const navigate = useNavigate();
  const [items, setItems]       = useState<AdminTestItem[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [opFilter, setOpFilter]   = useState('');
  const [foodFilter, setFoodFilter] = useState('All');
  const [labelFilter, setLabelFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const r = await getAdminTests({
        operator_id: opFilter.trim() || undefined,
        food_type:   foodFilter !== 'All' ? foodFilter : undefined,
        final_label: labelFilter !== 'All' ? labelFilter : undefined,
        source:      sourceFilter !== 'All' ? sourceFilter : undefined,
        limit: 200,
      });
      setItems(r.items); setTotal(r.total);
    } catch { setItems([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [opFilter, foodFilter, labelFilter, sourceFilter]);

  const ResultIcon = ({ label }: { label: string }) => {
    if (label === 'SAFE')        return <CheckCircle size={13} color="var(--safe)" />;
    if (label === 'ADULTERATED') return <XCircle size={13} color="var(--adulterated)" />;
    if (label === 'SUSPECTED')   return <AlertTriangle size={13} color="var(--suspected)" />;
    return <HelpCircle size={13} color="var(--unknown)" />;
  };

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" style={{ flex: '1 1 180px', minWidth: 140 }} placeholder="Filter by operator ID…" value={opFilter} onChange={e => setOpFilter(e.target.value)} />
        <select className="form-select" style={{ flex: '1 1 120px', minWidth: 110 }} value={foodFilter} onChange={e => setFoodFilter(e.target.value)}>
          {FOOD_TYPES.map(f => <option key={f}>{f}</option>)}
        </select>
        <select className="form-select" style={{ flex: '1 1 120px', minWidth: 110 }} value={labelFilter} onChange={e => setLabelFilter(e.target.value)}>
          {LABELS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="form-select" style={{ flex: '1 1 120px', minWidth: 110 }} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 'auto', whiteSpace: 'nowrap' }}>{total} total</span>
      </div>

      {loading ? (
        <div className="loading-overlay"><span className="loading-spinner" /> Loading tests…</div>
      ) : items.length === 0 ? (
        <div className="empty-state"><FlaskConical size={32} color="var(--text-muted)" /><p>No tests match the current filters.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead><tr><th>Test ID</th><th>Operator</th><th>Food Type</th><th>Result</th><th>Source</th><th>Date/Time</th><th></th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.testId} style={{ cursor: 'pointer' }} onClick={() => navigate(`/test/${item.testId}`)}>
                    <td className="mono" style={{ color: 'var(--accent)' }}>{item.testId}</td>
                    <td style={{ fontSize: 12 }}>
                      <div style={{ fontWeight: 500 }}>{item.operatorName}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{item.operatorId}</div>
                    </td>
                    <td>{item.foodType}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <ResultIcon label={item.finalLabel} />
                        <ResultBadge label={item.finalLabel} />
                      </div>
                    </td>
                    <td style={{ color: item.source === 'DEVELOPMENT' ? 'var(--suspected)' : 'var(--accent)', fontSize: 12 }}>{item.source}</td>
                    <td style={{ fontSize: 12 }}>{new Date(item.timestamp).toLocaleString()}</td>
                    <td><ChevronRight size={14} color="var(--text-muted)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: System ──────────────────────────────────────────────────
function SystemTab() {
  const [info, setInfo]       = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getAdminSystem().then(setInfo).catch(() => setInfo(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><span className="loading-spinner" /> Loading system info…</div>;
  if (!info) return <div style={{ color: 'var(--adulterated)', padding: 32 }}>Failed to load system info.</div>;

  const isDev = Boolean(info.isDevelopmentMode);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className={`dev-banner${isDev ? '' : ' hidden'}`} style={{ display: isDev ? 'flex' : 'none' }}>
        ⚠ System running in DEVELOPMENT MODE — No physical sensor connected
      </div>

      <div className="card">
        <div className="card-title mb-4">Runtime Configuration</div>
        {[
          ['App Name',     info.appName],
          ['Version',      info.appVersion],
          ['Data Source',  info.dataSource],
          ['Dev Mode',     isDev ? '⚠ YES — Synthetic Data' : '✓ NO — Real Sensor'],
          ['Log Level',    info.logLevel],
          ['Sensor Channels', info.sensorChannels],
        ].map(([k, v]) => (
          <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)' }}>{String(k)}</span>
            <span className="mono" style={{ color: isDev && k === 'Dev Mode' ? 'var(--suspected)' : 'var(--text-primary)' }}>{String(v)}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title mb-4">Storage Paths</div>
        {[
          ['Database URL',      info.databaseUrl],
          ['Model Storage',     info.modelStoragePath],
          ['Dataset Storage',   info.datasetStoragePath],
        ].map(([k, v]) => (
          <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{String(k)}</span>
            <span className="mono" style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' }}>{String(v)}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title mb-4">AS7265x Channel Wavelengths</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {((info.sensorWavelengths as number[]) ?? []).map((wl, i) => (
            <div key={i} style={{ padding: '4px 10px', borderRadius: 4, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              Ch{i + 1}: {wl} nm
            </div>
          ))}
        </div>
      </div>

      {isDev && (
        <div className="card" style={{ borderColor: 'var(--suspected)' }}>
          <div className="card-title mb-4" style={{ color: 'var(--suspected)' }}>⚠ Switch to Real Hardware</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            To switch from Development Mode to real BLE hardware:<br />
            1. Flash your ESP32 with the NanoTech BLE firmware.<br />
            2. Set <code className="mono" style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 3 }}>DATA_SOURCE=BLE</code> in <code className="mono" style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 3 }}>backend/.env</code>.<br />
            3. Restart the backend server.<br />
            4. Go to the Device page and click Connect.<br />
            <br />
            The ML pipeline, database, history, and UI require <strong>zero changes</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Admin Page ──────────────────────────────────────────────
export function AdminPage() {
  const [tab, setTab]         = useState<Tab>('Overview');
  const [ov, setOv]           = useState<AdminOverview | null>(null);

  useEffect(() => {
    getAdminOverview().then(setOv).catch(() => setOv(null));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={24} color="var(--accent)" />
          <div>
            <h1 className="page-title">Admin Panel</h1>
            <div className="page-subtitle">System management, operator registry, cross-operator test audit</div>
          </div>
        </div>

        {ov && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>{ov.totalTests}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>tests</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--safe)' }}>{ov.totalOperators}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>operators</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--suspected)' }}>{ov.totalDevices}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>devices</div>
            </div>
          </div>
        )}
      </div>

      {/* Dev mode banner */}
      {ov?.dataSource === 'DEVELOPMENT' && (
        <div className="dev-banner">
          <Server size={14} /> DATA SOURCE: DEVELOPMENT — No physical sensor connected. All test data is synthetic.
        </div>
      )}

      <div className="page-body">
        {/* Tab bar */}
        <div className="tabs-header">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px 18px', fontSize: 13, fontWeight: 500,
                color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Overview'  && <OverviewTab ov={ov} />}
        {tab === 'Operators' && <OperatorsTab />}
        {tab === 'Devices'   && <DevicesTab />}
        {tab === 'All Tests' && <AllTestsTab />}
        {tab === 'System'    && <SystemTab />}
      </div>
    </div>
  );
}
