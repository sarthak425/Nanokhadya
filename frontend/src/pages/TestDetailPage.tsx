import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTest, downloadReport } from '../services/api';
import type { TestResult } from '../services/api';
import { ResultCard } from '../components/ResultCard';
import { SpectralChart } from '../components/SpectralChart';
import { SpectralChart3D } from '../components/SpectralChart3D';
import { ChannelTable } from '../components/ChannelTable';
import { PCAChart } from '../components/PCAChart';
import { CartridgeZoneView } from '../components/CartridgeZoneView';
import { MultimodalSensorGrid } from '../components/MultimodalSensorGrid';
import { AnimalViewer3D } from '../components/AnimalViewer3D';
import { useOperator } from '../context/OperatorContext';
import { ArrowLeft, Download, Box } from 'lucide-react';

export function TestDetailPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { currentOperator } = useOperator();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spectralMode, setSpectralMode] = useState<'3d' | '2d'>('3d');

  useEffect(() => {
    if (!testId) return;
    setLoading(true);
    getTest(testId)
      .then(setResult)
      .catch(e => setError(e?.response?.data?.detail ?? 'Failed to load test'))
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) return <div className="loading-overlay"><span className="loading-spinner" /> Loading test record…</div>;
  if (error)   return <div style={{ padding: 32, color: 'var(--adulterated)' }}>Error: {error}</div>;
  if (!result) return null;

  const operatorDisplay = currentOperator && (currentOperator.id === result.operatorId || currentOperator.id.toLowerCase() === result.operatorId.toLowerCase())
    ? `${currentOperator.name} (${result.operatorId})`
    : result.operatorId;

  return (
    <div>
      <div className="page-header">
        <div>
          <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 8, fontSize: 12 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title">Test Detail</h1>
          <div className="page-subtitle mono">{result.testId}</div>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => downloadReport(result.testId)}
          id={`download-report-${result.testId}`}
          title="Download structured text report for this test"
        >
          <Download size={14} /> Download Report
        </button>
      </div>

      <div className="page-body">
        {/* 3D Holographic Bio-Specimen Chamber */}
        <div style={{ marginBottom: 16 }}>
          <AnimalViewer3D foodType={result.foodType as 'Milk' | 'Honey' | 'Paneer'} />
        </div>

        <div className="grid-2 mb-4">
          <ResultCard result={result} />

          <div className="card">
            <div className="card-title mb-4">Test Metadata</div>
            {[
              ['Test ID',    result.testId],
              ['Food Type',  result.foodType],
              ['Device',     result.deviceId],
              ['Operator',   operatorDisplay],
              ['Source',     result.source],
              ['Timestamp',  new Date(result.timestamp).toLocaleString()],
              ['Validation', result.validation.status],
              ['Model',      result.model ? `${result.model.type} ${result.model.version}` : '—'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span className="mono" style={{ color: 'var(--text-primary)' }}>{v}</span>
              </div>
            ))}
            {result.validation.warnings.length > 0 && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--suspected)' }}>
                Warnings: {result.validation.warnings.join('; ')}
              </div>
            )}
          </div>
        </div>

        {/* 16-Zone Cartridge Architecture View */}
        <div style={{ marginBottom: 16 }}>
          <CartridgeZoneView
            selectedFood={result.foodType as 'Milk' | 'Honey' | 'Paneer'}
            isAdulterated={result.finalLabel === 'ADULTERATED'}
            detectedAdulterants={result.detectedAdulterants || (result.possibleIssue ? [result.possibleIssue] : [])}
          />
        </div>

        {/* 9 Multimodal Cartridge Sensors & Telemetry Grid */}
        <div style={{ marginBottom: 16 }}>
          <MultimodalSensorGrid
            foodType={result.foodType as 'Milk' | 'Honey' | 'Paneer'}
            isAdulterated={result.finalLabel === 'ADULTERATED'}
            detectedAdulterant={result.possibleIssue}
          />
        </div>

        <div className="card mb-4">
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

        {result.pca && (
          <div className="card mb-4">
            <div className="card-title mb-4">PCA Analysis</div>
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

        <div className="card">
          <div className="card-title mb-4">18-Channel Spectral Data</div>
          <ChannelTable channels={result.channels} />
        </div>
      </div>
    </div>
  );
}
