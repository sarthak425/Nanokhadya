import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Cpu, Activity,
  Database, Zap, FlaskConical, User, Box,
  Droplets, Sparkles, ShieldCheck, Bluetooth,
  ShieldAlert, Layers, HeartPulse
} from 'lucide-react';
import { runTest } from '../services/api';
import type { TestResult } from '../services/api';
import { ResultCard } from '../components/ResultCard';
import { SpectralChart } from '../components/SpectralChart';
import { SpectralChart3D } from '../components/SpectralChart3D';
import { PCAChart } from '../components/PCAChart';
import { CartridgeZoneView } from '../components/CartridgeZoneView';
import { MultimodalSensorGrid } from '../components/MultimodalSensorGrid';
import { AnimalViewer3D } from '../components/AnimalViewer3D';
import { ChemicalBodyImpactView } from '../components/ChemicalBodyImpactView';
import { useOperator } from '../context/OperatorContext';
import { useBluetooth } from '../context/BluetoothContext';

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface Step { label: string; key: string; icon: React.ReactNode; status: StepStatus; }

const INITIAL_STEPS: Step[] = [
  { key: 'nanozymes',    label: '1. Nanozymes Activation (Zone functionalization)', icon: <Sparkles size={16} />,   status: 'pending' },
  { key: 'mixing',       label: '2. Chemical Capillary Mixing (Microfluidic flow)', icon: <Droplets size={16} />,   status: 'pending' },
  { key: 'reaction',     label: '3. Reaction & 18-Channel Spectral NIR Scan',      icon: <Activity size={16} />,   status: 'pending' },
  { key: 'control_val',  label: 'Control Validation (Zone 16 verified)',            icon: <ShieldCheck size={16} />, status: 'pending' },
  { key: 'preprocess',   label: 'Preprocessing (SNV baseline norm)',                icon: <Zap size={16} />,        status: 'pending' },
  { key: 'ai_eval',      label: 'Multimodal AI (PCA + SVM classification)',         icon: <Cpu size={16} />,        status: 'pending' },
  { key: 'storage',      label: 'Test Record & Report Finalized',                   icon: <Database size={16} />,   status: 'pending' },
];

const FOOD_TYPES = ['Milk', 'Honey', 'Paneer'] as const;
type ValidFood = typeof FOOD_TYPES[number];

export function NewTestPage() {
  const navigate = useNavigate();
  const { currentOperator } = useOperator();
  const { isConnected, device, setIsModalOpen } = useBluetooth();
  const [foodType, setFoodType] = useState<ValidFood>('Milk');
  const [operatorId, setOperatorId] = useState(currentOperator?.id ?? 'default-operator');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mobile segmented view mode when result is null
  const [mobileMode, setMobileMode] = useState<'chamber' | 'cartridge' | 'health'>('chamber');

  // Result tabs when result is ready
  const [activeTab, setActiveTab] = useState<'result' | 'health' | 'cartridge' | 'multimodal' | 'spectrum' | 'channels' | 'pca'>('result');
  const [spectralMode, setSpectralMode] = useState<'3d' | '2d'>('3d');

  // Keep operatorId in sync with current context operator
  useEffect(() => {
    if (currentOperator?.id) {
      setOperatorId(currentOperator.id);
    }
  }, [currentOperator?.id]);

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

      // Actual API call (uses bound operatorId)
      const testResult = await runTest(foodType, currentOperator?.id || operatorId);
      setStepStatus('storage', 'active');
      await sleep(200);
      setStepStatus('storage', 'done');

      setResult(testResult);
      setActiveTab('result');
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
      {/* Mobile-Friendly Page Header */}
      <div className="page-header" style={{ paddingBottom: '8px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FlaskConical size={22} color="var(--accent)" />
            <span>Food Authenticity Test</span>
          </h1>
          <div className="page-subtitle" style={{ fontSize: '12px' }}>
            AS7265x 18-channel tri-spectral analysis & 3D bio-specimen chamber
          </div>
        </div>

        {/* Quick Hardware Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline"
            style={{
              padding: '5px 12px',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              borderColor: isConnected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
              color: isConnected ? '#10b981' : '#f87171',
              background: isConnected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <Bluetooth size={14} />
            <span>{isConnected ? (device?.name || 'Reader Paired') : 'Pair BLE Reader'}</span>
          </button>
        </div>
      </div>

      <div className="page-body" style={{ paddingTop: '8px' }}>
        {/* If test has NOT run yet, show the unified mobile-optimized workspace */}
        {!result ? (
          <div>
            {/* Mobile Segmented Navigation Switcher (Chamber / Cartridge / Chemical Health) */}
            <div style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '4px',
              borderRadius: '14px',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              marginBottom: '12px',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              {[
                { key: 'chamber',   label: '3D Specimen',  icon: <Box size={13} /> },
                { key: 'cartridge', label: '16-Zone Chip', icon: <Layers size={13} /> },
                { key: 'health',    label: 'Body Impact',  icon: <HeartPulse size={13} /> },
              ].map(tab => {
                const isSel = mobileMode === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setMobileMode(tab.key as any)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      padding: '8px 4px',
                      fontSize: '12px',
                      fontWeight: isSel ? 700 : 500,
                      color: isSel ? '#ffffff' : '#94a3b8',
                      background: isSel ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
                      border: isSel ? '1px solid #38bdf8' : 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSel ? '0 2px 10px rgba(56, 189, 248, 0.35)' : 'none',
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: 3D SPECIMEN & INTEGRATED SCANNER CONTROLS */}
            {mobileMode === 'chamber' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 3D Holographic Bio-Specimen Chamber */}
                <AnimalViewer3D foodType={foodType} isScanning={running} compact={true} />

                {/* Tactile Food Matrix Selector (Cow / Bee / Buffalo) */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Select Food Matrix to Inspect
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 600 }}>
                      Live 3D Specimen
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '6px',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}>
                    {FOOD_TYPES.map(f => {
                      const isSel = foodType === f;
                      const meta = {
                        Milk:   { icon: '🥛', animal: '🐄 Cow', color: '#38bdf8' },
                        Honey:  { icon: '🍯', animal: '🐝 Bee', color: '#f59e0b' },
                        Paneer: { icon: '🧀', animal: '🐃 Buffalo', color: '#10b981' },
                      }[f];
                      return (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFoodType(f)}
                          disabled={running}
                          style={{
                            width: '100%',
                            minWidth: 0,
                            padding: '8px 2px',
                            boxSizing: 'border-box',
                            borderRadius: '12px',
                            background: isSel ? `${meta.color}20` : 'rgba(15, 23, 42, 0.6)',
                            border: `1.5px solid ${isSel ? meta.color : 'var(--border)'}`,
                            cursor: running ? 'not-allowed' : 'pointer',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '2px',
                            transition: 'all 0.15s ease',
                            boxShadow: isSel ? `0 4px 14px ${meta.color}35` : 'none',
                          }}
                        >
                          <span style={{ fontSize: '20px', lineHeight: 1 }}>{meta.icon}</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: isSel ? '#ffffff' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {f}
                          </span>
                          <span style={{ fontSize: '9px', color: isSel ? meta.color : 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {meta.animal}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact Operator & Hardware Status Chip Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '6px',
                    marginTop: '10px',
                    padding: '6px 10px',
                    background: 'rgba(15, 23, 42, 0.4)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-light)',
                    fontSize: '11px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                      <User size={12} color="var(--accent)" />
                      <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentOperator?.name || 'Inspector'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isConnected ? '#10b981' : '#ef4444' }} />
                      <span style={{ color: isConnected ? '#10b981' : '#f87171', fontWeight: 600, fontSize: '10px' }}>
                        {isConnected ? 'Reader Ready' : 'BLE Disconnected'}
                      </span>
                    </div>
                  </div>

                  {/* Primary Trigger Button */}
                  <div style={{ marginTop: '12px' }}>
                    {!isConnected ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '13px',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          border: '1px solid #38bdf8',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: 'pointer',
                        }}
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Bluetooth size={16} />
                        <span>Pair Bluetooth Reader to Scan</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-large"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '14px',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          border: '1px solid #34d399',
                          borderRadius: '12px',
                          boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          cursor: running ? 'not-allowed' : 'pointer',
                        }}
                        onClick={handleRunTest}
                        disabled={running}
                      >
                        {running ? (
                          <><span className="loading-spinner" /> Scanning {foodType} Microfluidic Zones…</>
                        ) : (
                          <><FlaskConical size={16} /> Scan & Acquire {foodType} Sample</>
                        )}
                      </button>
                    )}
                  </div>

                  {error && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--adulterated-bg)', border: '1px solid var(--adulterated)', borderRadius: 8, color: 'var(--adulterated)', fontSize: 12 }}>
                      {error}
                    </div>
                  )}
                </div>

                {/* 3-Step Physical Detection Pipeline (Shown cleanly during or before scan) */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '12px',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={14} color="var(--accent)" />
                    <span>3-Step Physical Microfluidic Sequence</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {steps.slice(0, 3).map(step => (
                      <div
                        key={step.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: step.status === 'active' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                          border: `1px solid ${step.status === 'active' ? '#38bdf8' : 'var(--border-light)'}`,
                          fontSize: '12px',
                          color: step.status === 'done' ? 'var(--safe)' : step.status === 'active' ? '#38bdf8' : 'var(--text-secondary)',
                        }}
                      >
                        {step.status === 'done' && <CheckCircle size={14} color="var(--safe)" />}
                        {step.status === 'active' && <span className="loading-spinner" style={{ width: 14, height: 14 }} />}
                        {step.status === 'error' && <XCircle size={14} color="var(--adulterated)" />}
                        {step.status === 'pending' && <span style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid var(--border)' }} />}
                        <span style={{ fontWeight: step.status === 'active' ? 700 : 500 }}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: 16-ZONE MICROFLUIDIC CARTRIDGE */}
            {mobileMode === 'cartridge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <CartridgeZoneView
                  selectedFood={foodType}
                  onFoodChange={(f) => setFoodType(f)}
                />
              </div>
            )}

            {/* TAB 3: CHEMICAL & HUMAN BODY HEALTH IMPACT (The Requested Feature) */}
            {mobileMode === 'health' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <ChemicalBodyImpactView
                  foodType={foodType}
                  selectedChemical={foodType === 'Milk' ? 'Formalin' : foodType === 'Honey' ? 'C4 sugar (adulterant)' : 'Vegetable fat/oil'}
                />
              </div>
            )}
          </div>
        ) : (
          /* RESULT WORKSPACE WITH EMBEDDED HUMAN BODY HEALTH IMPACT */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Urgent Adulteration Health Alert Banner if positive */}
            {result.finalLabel === 'ADULTERATED' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.25) 100%)',
                border: '1.5px solid #ef4444',
                borderRadius: '16px',
                padding: '12px 14px',
                color: '#fee2e2',
                boxShadow: '0 8px 24px rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={22} color="#ef4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#fca5a5' }}>
                      Adulterant Detected: {result.possibleIssue || result.detectedAdulterants?.[0] || 'Hazardous Compound'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: 2 }}>
                      Severe health hazard identified. Tap "Body Impact" to view affected organs and risks.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11px',
                    background: '#ef4444',
                    border: '1px solid #f87171',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => setActiveTab('health')}
                >
                  View Human Body Impact →
                </button>
              </div>
            )}

            {/* Results Tab Bar */}
            <div style={{
              display: 'flex',
              gap: 4,
              background: 'var(--bg-secondary)',
              padding: 4,
              borderRadius: 12,
              border: '1px solid var(--border)',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}>
              {[
                { key: 'result',     label: 'Verdict' },
                { key: 'health',     label: '🧬 Body Impact' },
                { key: 'cartridge',  label: '16 Zones' },
                { key: 'multimodal', label: '9 Sensors' },
                { key: 'spectrum',   label: 'Spectrum' },
                { key: 'pca',        label: 'PCA AI' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={activeTab === tab.key ? 'btn btn-primary' : 'btn btn-outline'}
                  style={{
                    flex: 1,
                    minWidth: '78px',
                    padding: '6px 8px',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Verdict Result Card */}
            {activeTab === 'result' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <ResultCard result={result} />
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '10px' }}
                  onClick={() => setActiveTab('health')}
                >
                  🧬 Check Chemical Effect on Human Body →
                </button>
              </div>
            )}

            {/* Tab: Human Body Health Impact */}
            {activeTab === 'health' && (
              <ChemicalBodyImpactView
                foodType={result.foodType as ValidFood}
                selectedChemical={result.possibleIssue || result.detectedAdulterants?.[0] || 'Formalin'}
              />
            )}

            {/* Tab: 16-Zone Cartridge */}
            {activeTab === 'cartridge' && (
              <CartridgeZoneView
                selectedFood={result.foodType as ValidFood}
                onFoodChange={(f) => setFoodType(f)}
                isAdulterated={result.finalLabel === 'ADULTERATED'}
                detectedAdulterants={result.detectedAdulterants || (result.possibleIssue ? [result.possibleIssue] : [])}
              />
            )}

            {/* Tab: 9 Multimodal Sensors */}
            {activeTab === 'multimodal' && (
              <MultimodalSensorGrid
                foodType={result.foodType as ValidFood}
                isAdulterated={result.finalLabel === 'ADULTERATED'}
                detectedAdulterant={result.possibleIssue}
              />
            )}

            {/* Tab: Spectrum */}
            {activeTab === 'spectrum' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div className="card-title">Spectral Fingerprint</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      className={spectralMode === '3d' ? 'btn btn-primary' : 'btn btn-outline'}
                      onClick={() => setSpectralMode('3d')}
                      style={{ padding: '4px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <Box size={12} /> 3D
                    </button>
                    <button
                      className={spectralMode === '2d' ? 'btn btn-primary' : 'btn btn-outline'}
                      onClick={() => setSpectralMode('2d')}
                      style={{ padding: '4px 10px', fontSize: 11 }}
                    >
                      2D
                    </button>
                  </div>
                </div>
                {spectralMode === '3d' ? (
                  <SpectralChart3D channels={result.channels} />
                ) : (
                  <SpectralChart channels={result.channels} />
                )}
              </div>
            )}

            {/* Tab: PCA */}
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

            {/* Bottom Reset / Retest Actions */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-outline"
                onClick={() => setResult(null)}
                style={{ flex: 1 }}
              >
                Scan Another Sample
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/test/${result.testId}`)}
                style={{ flex: 1 }}
              >
                Full Inspection File →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
