import { useRef } from 'react';
import type { TestResult } from '../services/api';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  SAFE:        <CheckCircle size={42} color="#3fb950" />,
  AUTHENTIC:   <CheckCircle size={42} color="#3fb950" />,
  SUSPECTED:   <AlertTriangle size={42} color="#d29922" />,
  ADULTERATED: <XCircle size={42} color="#f85149" />,
  UNKNOWN:     <HelpCircle size={42} color="#8b949e" />,
  INSUFFICIENT_DATA: <HelpCircle size={42} color="#8b949e" />,
};

const LABEL_TEXT: Record<string, string> = {
  SAFE: 'SAFE', AUTHENTIC: 'SAFE / AUTHENTIC',
  SUSPECTED: 'SUSPECTED', ADULTERATED: 'ADULTERATED',
  UNKNOWN: 'UNKNOWN', INSUFFICIENT_DATA: 'INSUFFICIENT DATA',
};

interface ResultCardProps {
  result: TestResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const label = result.finalLabel || 'UNKNOWN';
  const pred = result.prediction;
  const model = result.model;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg) translateZ(8px)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    }
  };

  return (
    <div
      ref={cardRef}
      className={`result-card ${label}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease',
        animation: 'card3DReveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        position: 'relative',
        cursor: 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {ICONS[label] ?? ICONS.UNKNOWN}
      </div>
      <div className="result-label" style={{ marginTop: 10 }}>{LABEL_TEXT[label] ?? label}</div>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--text-primary)' }}>{result.foodType}</strong>
        {result.possibleIssue && (
          <div style={{ marginTop: 6, fontSize: 12, fontStyle: 'italic' }}>{result.possibleIssue}</div>
        )}
      </div>

      {pred?.probability !== null && pred?.probability !== undefined && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
            MODEL CONFIDENCE — {pred.confidenceTier}
          </div>
          <div className="confidence-bar">
            <div
              className={`confidence-fill ${pred.confidenceTier.toLowerCase()}`}
              style={{ width: `${(pred.probability * 100).toFixed(0)}%` }}
            />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            {(pred.probability * 100).toFixed(1)}%
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 11, color: 'var(--text-muted)' }}>
        <div>Model: {model?.type} {model?.version}</div>
        <div>Source: {result.source}</div>
        {result.isDevelopmentResult && (
          <div style={{ color: '#3fb950', marginTop: 4, fontWeight: 600 }}>
            ⚠ DEVELOPMENT DATA — Not a validated sensor measurement
          </div>
        )}
      </div>

      <style>{`
        @keyframes card3DReveal {
          from {
            opacity: 0;
            transform: perspective(800px) rotateY(40deg) translateZ(-40px);
          }
          to {
            opacity: 1;
            transform: perspective(800px) rotateY(0deg) translateZ(0);
          }
        }
      `}</style>
    </div>
  );
}
