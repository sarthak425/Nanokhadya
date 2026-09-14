import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Cpu, Activity,
  Database, Zap, FlaskConical, User, Box,
  Droplets, Sparkles, ShieldCheck, Bluetooth, AlertTriangle
} from 'lucide-react';
import { runTest, getOperators } from '../services/api';
import type { TestResult, Operator } from '../services/api';
import { ResultCard } from '../components/ResultCard';
import { SpectralChart } from '../components/SpectralChart';
import { SpectralChart3D } from '../components/SpectralChart3D';
import { ChannelTable } from '../components/ChannelTable';
import { PCAChart } from '../components/PCAChart';
import { CartridgeZoneView } from '../components/CartridgeZoneView';
import { useOperator } from '../context/OperatorContext';
import { useBluetooth } from '../context/BluetoothContext';

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface Step { label: string; key: string; icon: React.ReactNode; status: StepStatus; }

const INITIAL_STEPS: Step[] = [
  { key: 'nanozymes',    label: '1. Nanozymes (Zone functionalization)',       icon: <Sparkles size={16} />,   status: 'pending' },
  { key: 'mixing',       label: '2. Chemical Mixing (Microfluidic flow)',      icon: <Droplets size={16} />,   status: 'pending' },
  { key: 'reaction',     label: '3. Reaction (Colorimetry + AS7265x NIR)',    icon: <Activity size={16} />,   status: 'pending' },
  { key: 'control_val',  label: 'Control Validation (Zone 16 verified)',       icon: <ShieldCheck size={16} />, status: 'pending' },
  { key: 'preprocess',   label: 'Preprocessing (SNV baseline norm)',           icon: <Zap size={16} />,        status: 'pending' },
  { key: 'ai_eval',      label: 'Multimodal AI (PCA + SVM classification)',    icon: <Cpu size={16} />,        status: 'pending' },
  { key: 'storage',      label: 'Test Record & Report Finalized',              icon: <Database size={16} />,   status: 'pending' },
];

const FOOD_TYPES = ['Milk', 'Honey', 'Paneer'] as const;
type ValidFood = typeof FOOD_TYPES[number];

export function NewTestPage() {
  const navigate = useNavigate();
  const { currentOperator, operators: contextOps, setCurrentOperator } = useOperator();
  const { isConnected, device, setIsModalOpen } = useBluetooth();
  const [foodType, setFoodType] = useState<ValidFood>('Milk');
  const [operatorId, setOperatorId] = useState(currentOperator?.id ?? 'default-operator');
  const [operators, setOperators] = useState<Operator[]>(contextOps);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cartridge' | 'result' | 'spectrum' | 'channels' | 'pca'>('cartridge');
  const [spectralMode, setSpectralMode] = useState<'3d' | '2d'>('3d');

  // Keep operatorId in sync with current context operator
  useEffect(() => {
    if (currentOperator?.id) {
      setOperatorId(currentOperator.id);
    }
  }, [currentOperator?.id]);

  // Load operators if context doesn't have them
  useEffect(() => {
    if (contextOps.length > 0) {
      setOperators(contextOps);
    } else {
      getOperators()
        .then(ops => {
          setOperators(ops);
          if (ops.length > 0 && !currentOperator) {
            setOperatorId(ops[0].id);
          }
        })
        .catch(() => { /* fallback */ });
    }
  }, [contextOps, currentOperator]);

  const setStepStatus = (key: string, status: StepStatus) => {
    setSteps(prev => prev.map(s => s.key === key ? { ...s, status } : s));
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const handleRunTest = async () => {
    if (!isConnected) {
      setIsModalOpen(true);
      return;
    }

    setRunning(true);
    setResult(null);
    setError(null);
    setSteps(INITIAL_STEPS);

    try {
      // Animate physical detection steps
      for (const step of INITIAL_STEPS.slice(0, 6)) {
        setStepStatus(step.key, 'active');
        await sleep(350);
        setStepStatus(step.key, 'done');
      }

      // Actual API call (runs the real pipeline)
      const testResult = await runTest(foodType, operatorId);
      setStepStatus('storage', 'active');
      await sleep(200);
      setStepStatus('storage', 'done');

      setResult(testResult);
      setActiveTab('cartridge');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err.message ?? 'Test failed';
      setError(msg);
      setSteps(prev => prev.map(s => s.status === 'active' ? { ...s, status: 'error' } : s));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Test</h1>
          <div className="page-subtitle">AS7265x · 18-channel spectral acquisition</div>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left: Controls + Pipeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header"><div className="card-title">Test Configuration</div></div>

              {/* Hardware Connection Guard Banner */}
              {!isConnected ? (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 10,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>
                      Hardware Reader Offline
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Pair your NanoSense ESP32 reader via Bluetooth to acquire cartridge readings.
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 10,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Bluetooth size={16} color="#10b981" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                        {device?.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>
                        BLE Connected · Battery: {device?.battery}% · Chamber: Ready
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Manage
                  </button>
                </div>
              )}

              <div className="form-group mb-4">
                <label className="form-label">Food Type (Universal Cartridge)</label>
                <select
                  className="form-select"
                  value={foodType}
                  onChange={e => setFoodType(e.target.value as ValidFood)}
                  disabled={running}
                >
                  {FOOD_TYPES.map(f => (
                    <option key={f} value={f}>
                      {f === 'Milk' ? '🥛 Milk' : f === 'Honey' ? '🍯 Honey' : '🧀 Paneer'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mb-4">
                <label className="form-label"><User size={12} style={{ display: 'inline', marginRight: 4 }} />Operator</label>
                {operators.length > 0 ? (
                  <select
                    className="form-select"
                    value={operatorId}
                    onChange={e => {
                      setOperatorId(e.target.value);
                      const found = operators.find(o => o.id === e.target.value);
                      if (found) setCurrentOperator(found);
                    }}
                    disabled={running}
                  >
                    {operators.map(op => (
                      <option key={op.id} value={op.id}>{op.name} ({op.id})</option>
                    ))}
                  </select>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      className="form-input"
                      value={operatorId}
                      onChange={e => setOperatorId(e.target.value)}
                      disabled={running}
                      placeholder="operator-id"
                    />
                    <a href="/admin" style={{ fontSize: 11, color: 'var(--accent)', whiteSpace: 'nowrap' }}>Add operator</a>
                  </div>
                )}
              </div>
              <div className="form-group mb-4">
                <label className="form-label">Data Source</label>
                <div style={{ padding: '9px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text-secondary)' }}>
                  {isConnected
                    ? (device?.mode === 'HARDWARE_BLE' ? 'Bluetooth Low Energy (ESP32 Live Stream)' : 'Virtual Hardware Simulator (BLE Bridge)')
                    : 'Device Disconnected — Connect via Bluetooth'}
                </div>
              </div>

              {!isConnected ? (
                <button
                  className="btn btn-primary btn-large"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <Bluetooth size={16} /> Connect Reader via Bluetooth
                </button>
              ) : (
                <button
                  className="btn btn-primary btn-large"
                  style={{ width: '100%' }}
                  onClick={handleRunTest}
                  disabled={running}
                >
                  {running ? (
                    <><span className="loading-spinner" /> Acquiring Cartridge Data…</>
                  ) : (
                    <><FlaskConical size={16} /> Acquire & Test Cartridge</>
                  )}
                </button>
              )}

              {error && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--adulterated-bg)', border: '1px solid var(--adulterated)', borderRadius: 8, color: 'var(--adulterated)', fontSize: 13 }}>
                  {error}
                </div>
              )}
            </div>

            {/* Pipeline steps */}
            <div className="card">
              <div className="card-header"><div className="card-title">Processing Pipeline</div></div>
              <div className="pipeline-steps">
                {steps.map(step => (
                  <div key={step.key} className={`pipeline-step ${step.status}`}>
                    {step.status === 'done' && <CheckCircle size={16} color="var(--safe)" />}
                    {step.status === 'active' && <span className="loading-spinner" style={{ width: 16, height: 16 }} />}
                    {step.status === 'error' && <XCircle size={16} color="var(--adulterated)" />}
                    {step.status === 'pending' && <span style={{ width: 16, height: 16, display: 'inline-block', borderRadius: '50%', border: '1px solid var(--border)' }} />}
                    {step.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Results & Cartridge View */}
          <div>
            {!result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <CartridgeZoneView
                  selectedFood={foodType}
                  onFoodChange={(f) => setFoodType(f)}
                />

                {!isConnected && (
                  <div className="card" style={{ textAlign: 'center', padding: '16px', border: '1px dashed #334155', background: 'transparent' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                      Hardware Device Connection Required
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 12 }}>
                      Cartridge test results will only appear once the Bluetooth reader is connected and scans the 16 sensing zones.
                    </div>
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: 12, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      onClick={() => setIsModalOpen(true)}
                    >
                      <Bluetooth size={14} /> Pair Reader Now
                    </button>
                  </div>
                )}
                {running && (
                  <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                    <div className="loading-spinner" style={{ margin: '0 auto 12px auto' }} />
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      Executing 3-Step Physical Detection Sequence…
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                      1. Nanozymes Activation → 2. Chemical Capillary Mixing → 3. Reaction & 18-Channel Spectral Scan
                    </div>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
                  {(['cartridge', 'result', 'spectrum', 'channels', 'pca'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={activeTab === tab ? 'btn btn-primary' : 'btn btn-outline'}
                      style={{ flex: 1, padding: '6px 8px', fontSize: 12, textTransform: 'capitalize' }}
                    >
                      {tab === 'cartridge' ? 'Cartridge Zones' : tab === 'pca' ? 'PCA' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {activeTab === 'cartridge' && (
                  <CartridgeZoneView
                    selectedFood={result.foodType as ValidFood}
                    onFoodChange={(f) => setFoodType(f)}
                    isAdulterated={result.finalLabel === 'ADULTERATED'}
                    detectedAdulterants={result.detectedAdulterants || (result.possibleIssue ? [result.possibleIssue] : [])}
                  />
                )}

                {activeTab === 'result' && <ResultCard result={result} />}

                {activeTab === 'spectrum' && (
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div className="card-title">Spectral Fingerprint</div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className={spectralMode === '3d' ? 'btn btn-primary' : 'btn btn-outline'}
                          onClick={() => setSpectralMode('3d')}
                          style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Box size={12} /> 3D View
                        </button>
                        <button
                          className={spectralMode === '2d' ? 'btn btn-primary' : 'btn btn-outline'}
                          onClick={() => setSpectralMode('2d')}
                          style={{ padding: '4px 10px', fontSize: 11 }}
                        >
                          2D Curve
                        </button>
                      </div>
                    </div>
                    {spectralMode === '3d' ? (
                      <SpectralChart3D channels={result.channels} />
                    ) : (
                      <>
                        <SpectralChart channels={result.channels} />
                        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                          Blue: Raw sensor counts · Green dashed: Processed (SNV normalized)
                        </div>
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'channels' && (
                  <div className="card">
                    <div className="card-title mb-4">18-Channel Spectral Data</div>
                    <ChannelTable channels={result.channels} />
                  </div>
                )}

                {activeTab === 'pca' && result.pca && (
                  <div className="card">
                    <PCAChart
                      trainingPoints={result.pca.trainingScatter ?? []}
                      newSample={result.pca.components.length >= 2
                        ? { x: result.pca.components[0], y: result.pca.components[1] }
                        : null}
                      explainedVariance={result.pca.explainedVarianceRatio}
                      isDevelopment={result.isDevelopmentResult}
                    />
                  </div>
                )}

                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/test/${result.testId}`)}
                  style={{ width: '100%' }}
                >
                  View Full Test Record →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
