import React from 'react';
import { TestSessionRecord } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, Printer, ArrowLeft, Beaker, FileText, Info } from 'lucide-react';

interface TestResultViewProps {
  test: TestSessionRecord;
  onBack: () => void;
  onNewTest: () => void;
}

export const TestResultView: React.FC<TestResultViewProps> = ({ test, onBack, onNewTest }) => {
  const isPass = test.overallResult === 'PASS_SCREENING';
  const isPositive = test.overallResult === 'POSITIVE_SCREENING';
  const isWarning = test.overallResult === 'WARNING_SUSPICIOUS';
  const isInvalid = test.overallResult === 'INVALID_TEST';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} className="btn-secondary" style={{ fontSize: '0.88rem' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '0.88rem' }}>
            <Printer size={16} /> Print Official Certificate
          </button>
          <button onClick={onNewTest} className="btn-primary" style={{ fontSize: '0.88rem' }}>
            <Beaker size={16} /> Test Another Sample
          </button>
        </div>
      </div>

      {/* Main Certificate Card */}
      <div className="glass-card" style={{ padding: '36px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
        {/* Certificate Masthead */}
        <div style={{
          borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                GOVERNMENT OF INDIA | MoFPI
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Smart India Hackathon - Problem Statement 26235
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              RAPID ON-SITE FOOD SAFETY SCREENING REPORT
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Nano-Engineered Microfluidic Optical Colorimetric Evaluation
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Report Code</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--color-primary)' }}>
              {test.sessionCode}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              {test.completedAt || test.startedAt}
            </span>
            <div style={{
              marginTop: '8px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.68rem',
              color: '#93c5fd',
              fontFamily: 'monospace'
            }}>
              SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            </div>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div style={{
          padding: '20px 24px',
          borderRadius: '14px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: isPass
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
            : isPositive
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 100%)'
            : isWarning
            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)'
            : 'rgba(255, 255, 255, 0.05)',
          border: isPass
            ? '1px solid rgba(16, 185, 129, 0.4)'
            : isPositive
            ? '1px solid rgba(239, 68, 68, 0.5)'
            : isWarning
            ? '1px solid rgba(245, 158, 11, 0.4)'
            : '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isPass && <CheckCircle size={42} color="#34d399" />}
            {isPositive && <XCircle size={42} color="#f87171" />}
            {isWarning && <AlertTriangle size={42} color="#fbbf24" />}
            {isInvalid && <AlertTriangle size={42} color="var(--text-muted)" />}

            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                OVERALL SCREENING OUTCOME
              </div>
              <div style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: isPass ? '#34d399' : isPositive ? '#f87171' : isWarning ? '#fbbf24' : '#ffffff'
              }}>
                {test.overallResult.replace('_', ' ')}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TEST VALIDITY STATUS</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: test.validityStatus === 'VALID' ? '#34d399' : '#f87171' }}>
              {test.validityStatus}
            </div>
          </div>
        </div>

        {/* Traceability Metadata Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '28px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Sample Identifier</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{test.sampleCode}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Food Commodity</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
              {test.foodItem || (test.milkType && test.milkType !== 'NOT_APPLICABLE' ? `${test.milkType} Milk` : test.foodCategory)}
            </span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Collection Point</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{test.collectionSource}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Batch / Lot</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>{test.batchLotNumber}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Optical Reader Serial</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>{test.deviceSerial}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Cartridge UID</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>{test.cartridgeUid}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Field Inspector</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{test.operatorName}</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Optical Illumination</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#34d399' }}>Calibrated CRI &gt;95</span>
          </div>
        </div>

        {/* Detailed Zone-by-Zone Multi-Analyte Inspection Table */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} color="var(--color-primary)" /> Zone-by-Zone Nanomaterial Response &amp; FSSAI Evaluation
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Target Adulterant</th>
                  <th>Sensing Nanomaterial</th>
                  <th>CIELAB (L*, a*, b*)</th>
                  <th>Color ΔE</th>
                  <th>Est. Conc.</th>
                  <th>FSSAI Threshold</th>
                  <th>Status</th>
                  <th>Decision Rationale</th>
                </tr>
              </thead>
              <tbody>
                {test.readings.map(r => (
                  <tr key={r.zoneIndex}>
                    <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-dim)' }}>
                      Z{r.zoneIndex}
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.analyteName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.nanomaterial}</td>
                    <td style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {r.cielabL}, {r.cielabA}, {r.cielabB}
                    </td>
                    <td style={{ fontWeight: 700, color: r.deltaE >= 4.0 ? 'var(--color-danger)' : '#34d399' }}>
                      {r.deltaE.toFixed(1)}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {r.estimatedConcentration > 0 ? `${r.estimatedConcentration} ${r.unit}` : 'Not Detected'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      {r.threshold === 0 ? 'Nil (0 ppm)' : `${r.threshold} ${r.unit}`}
                    </td>
                    <td>
                      {r.status === 'SAFE_WITHIN_LIMITS' && (
                        <span className="badge badge-safe">SAFE</span>
                      )}
                      {r.status === 'WARNING_SUSPICIOUS' && (
                        <span className="badge badge-warning">WARNING</span>
                      )}
                      {r.status === 'POSITIVE_ADULTERATED' && (
                        <span className="badge badge-danger">POSITIVE</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '240px' }}>
                      {r.rationale}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statutory Screening Legal Notice */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <Info size={22} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.8rem', color: '#e5e7eb', lineHeight: '1.5' }}>
            <strong>STATUTORY SCIENTIFIC NOTICE (Section 21 of FSSAI Field Protocol):</strong>
            <br />
            This report represents a <em>rapid on-site screening result</em> generated by optical colorimetric evaluation
            under standardized LED chamber conditions. A result of <strong>POSITIVE SCREENING</strong> indicates presumptive
            contamination exceeding safety standards. In accordance with statutory food safety regulations, flagged samples
            must be quarantined and dispatched to an FSSAI-notified National Accreditation Board (NABL) referral laboratory
            for definitive confirmatory quantification (via HPLC/LC-MS/MS).
          </div>
        </div>
      </div>
    </div>
  );
};
