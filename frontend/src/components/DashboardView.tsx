import React from 'react';
import { TestSessionRecord, DeviceInfo } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, Beaker, ChevronRight, Sparkles, Sliders } from 'lucide-react';

interface DashboardViewProps {
  sessions: TestSessionRecord[];
  devices: DeviceInfo[];
  onSelectTest: (test: TestSessionRecord) => void;
  onLaunchNewTest: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sessions,
  devices,
  onSelectTest,
  onLaunchNewTest
}) => {
  const total = sessions.length;
  const passCount = sessions.filter(s => s.overallResult === 'PASS_SCREENING').length;
  const warningCount = sessions.filter(s => s.overallResult === 'WARNING_SUSPICIOUS').length;
  const positiveCount = sessions.filter(s => s.overallResult === 'POSITIVE_SCREENING').length;
  const invalidCount = sessions.filter(s => s.overallResult === 'INVALID_TEST').length;
  const activeDevices = devices.filter(d => d.status === 'ACTIVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Quick-Action Card */}
      <div className="glass-card" style={{
        padding: '32px',
        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '18px'
      }}>
        <div style={{ maxWidth: '650px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span className="badge badge-safe">
              <Sparkles size={14} /> National Multi-Commodity Food Grid
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>MoFPI SIH Problem #26235</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#ffffff' }}>
            Portable Nano-Engineered Rapid Food Testing Platform
          </h1>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Rapid on-site screening for essential daily household commodities (Milk, Paneer, Dahi, Honey, Turmeric, Red Chilli, Cooking Oil, Desi Ghee &amp; Green Vegetables)
            using multiplex paper microfluidics and closed-chamber ESP32-S3 optical colorimetry.
          </p>
        </div>
        <button
          onClick={onLaunchNewTest}
          className="btn-primary"
          style={{ padding: '14px 28px', fontSize: '1rem', borderRadius: '12px' }}
        >
          <Beaker size={20} /> Launch New Rapid Test
        </button>
      </div>

      {/* 6 Metric Dashboard Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '18px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL TESTS</span>
            <Sliders size={18} color="var(--color-primary)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {total}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Across all field collection centres</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: '#34d399', fontWeight: 600 }}>SAFE SAMPLES (PASS)</span>
            <CheckCircle size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#34d399' }}>
            {passCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            {total > 0 ? Math.round((passCount / total) * 100) : 0}% compliance rate
          </span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 600 }}>WARNING SAMPLES</span>
            <AlertTriangle size={18} color="#fbbf24" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
            {warningCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Near statutory thresholds</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: '#f87171', fontWeight: 600 }}>POSITIVE ADULTERATED</span>
            <XCircle size={18} color="#f87171" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {positiveCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Flagged for referral lab confirmation</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>INVALID TESTS</span>
            <AlertTriangle size={18} color="var(--text-dim)" />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-muted)' }}>
            {invalidCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Rejected by optical/flow gates</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600 }}>ACTIVE READERS</span>
            <span className="dot dot-safe"></span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '8px', color: '#ffffff' }}>
            {activeDevices}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>ESP32-S3 IoT units connected</span>
        </div>
      </div>

      {/* 3D Innovation Showcase Cards (SIH Jury Highlights) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}>
        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-neutral" style={{ borderColor: 'var(--color-primary)', color: '#93c5fd' }}>
                WebGL 3D Engine
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
              Interactive 3D Digital Twin
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Explore the physical cartridge architecture with the 3D Exploded-View slider, inspect the internal PES membrane, and toggle high-CRI closed-chamber optics.
            </p>
          </div>
          <button
            onClick={() => { onSelectTest(sessions[0]); }}
            className="btn-secondary"
            style={{ width: 'fit-content', fontSize: '0.85rem' }}
          >
            Launch 3D Explorer &rarr;
          </button>
        </div>

        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-safe">Nano-Optics Simulator</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
              LSPR Plasmonic Resonance
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Visualize the 520nm to 650nm localized surface plasmon resonance (LSPR) red-shift as melamine induces gold nanoparticle cross-linking in real time.
            </p>
          </div>
          <button
            onClick={onLaunchNewTest}
            className="btn-secondary"
            style={{ width: 'fit-content', fontSize: '0.85rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            Simulate Nano-Optics &rarr;
          </button>
        </div>

        <div className="glass-card" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(15, 23, 42, 0.7) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="badge badge-warning">Real-time Vision</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '8px' }}>
              Live On-Site Camera Scanner
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
              Activate device webcam or upload physical test strip photographs with live crosshair alignment reticles for instantaneous CIELAB Delta-E scoring.
            </p>
          </div>
          <button
            onClick={onLaunchNewTest}
            className="btn-secondary"
            style={{ width: 'fit-content', fontSize: '0.85rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            Open Live Camera &rarr;
          </button>
        </div>
      </div>
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Beaker size={18} color="var(--color-primary)" /> Multiplex Cartridge Sensing Channels
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zone 1: Melamine</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>LOD 0.15 ppm</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Citrate-AuNPs (13nm). Surface plasmon shift from wine-red to blue.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zone 2: H2O2</span>
              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Zero Tolerance</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Fe3O4 Peroxidase Nanozyme. Catalytic oxidation of TMB to sky-blue.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zone 3: Synthetic Urea</span>
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Limit: 700 ppm</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Urease + Phenol Red/BTB. Enzymatic hydrolysis pH shift from yellow to magenta.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zone 4: Starch</span>
              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Zero Tolerance</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Lugol Iodine-PVP. Amylose helical inclusion complex turning inky-black.</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Zone 5: Neutralizer</span>
              <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>Zero Tolerance</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Bromocresol Purple. Detects caustic alkalis (pH &gt; 6.8) &amp; surfactant detergents.</p>
          </div>
        </div>
      </div>

      {/* Recent Tests Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff' }}>Recent Field Screening Records</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any record to inspect complete spectral colorimetry and FSSAI report</span>
          </div>
          <span className="badge badge-neutral">{sessions.length} records cached</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Test Session ID</th>
                <th>Sample Code</th>
                <th>Food Commodity</th>
                <th>Collection Centre</th>
                <th>Cartridge UID</th>
                <th>Screening Result</th>
                <th>Validity</th>
                <th>Timestamp</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const icon = s.foodCategory === 'DAIRY' ? '🥛' : s.foodCategory === 'HONEY' ? '🍯' : s.foodCategory === 'SPICES' ? '🌶️' : s.foodCategory === 'EDIBLE_OILS' ? '🛢️' : s.foodCategory === 'VEGETABLES' ? '🥬' : '🥗';
                return (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => onSelectTest(s)}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {s.sessionCode}
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.sampleCode}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>{icon}</span>
                        <span>{s.foodItem || s.foodCategory}</span>
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.collectionSource}</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-dim)' }}>{s.cartridgeUid}</td>
                    <td>
                    {s.overallResult === 'PASS_SCREENING' && (
                      <span className="badge badge-safe">
                        <CheckCircle size={12} /> PASS SCREENING
                      </span>
                    )}
                    {s.overallResult === 'WARNING_SUSPICIOUS' && (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} /> WARNING
                      </span>
                    )}
                    {s.overallResult === 'POSITIVE_SCREENING' && (
                      <span className="badge badge-danger">
                        <XCircle size={12} /> POSITIVE (ADULTERATED)
                      </span>
                    )}
                    {s.overallResult === 'INVALID_TEST' && (
                      <span className="badge badge-neutral">
                        INVALID TEST
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: s.validityStatus === 'VALID' ? '#34d399' : '#f87171' }}>
                      {s.validityStatus}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>{s.startedAt}</td>
                  <td>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                      Inspect <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
