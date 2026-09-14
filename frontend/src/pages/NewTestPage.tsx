import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Cpu, Activity,
  Database, Zap, FlaskConical, User, Box,
  Droplets, Sparkles, ShieldCheck
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
                  Development Mode (AS7265x Triad Simulator)
                </div>
              </div>
              <button
                className="btn btn-primary btn-large"
                style={{ width: '100%' }}
                onClick={handleRunTest}
                disabled={running}
              >
                {running ? (
                  <><span className="loading-spinner" /> Running Spectral Pipeline…</>
                ) : (
                  <><FlaskConical size={16} /> Start Test</>
                )}
              </button>
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
