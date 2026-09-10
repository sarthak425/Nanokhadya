import React, { useState, useEffect, useRef } from 'react';
import { Activity, Sparkles, Sliders, Info, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

export const Plasmonic3DSpectrum: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyteMode, setAnalyteMode] = useState<'MELAMINE_AUNP' | 'H2O2_NANOZYME' | 'STARCH_POLYIODIDE'>('MELAMINE_AUNP');
  const [concentration, setConcentration] = useState<number>(3.5); // ppm or %

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Dark Tech Grid Background
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 60; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 20);
        ctx.lineTo(x, height - 40);
        ctx.stroke();
      }
      for (let y = 30; y < height - 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(width - 20, y);
        ctx.stroke();
      }

      // X-Axis Wavelength Markers (400nm - 750nm)
      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      const wavelengths = [400, 450, 500, 520, 550, 600, 650, 700, 750];
      wavelengths.forEach(wl => {
        const x = 60 + ((wl - 400) / 350) * (width - 90);
        ctx.fillText(`${wl}nm`, x - 14, height - 18);
        ctx.strokeStyle = wl === 520 || wl === 650 ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.06)';
        ctx.beginPath();
        ctx.moveTo(x, height - 36);
        ctx.lineTo(x, height - 42);
        ctx.stroke();
      });

      // Y-Axis Absorbance
      ctx.fillText('Abs (A)', 14, 25);
      [1.5, 1.0, 0.5, 0.0].forEach((val, i) => {
        const y = 40 + i * 65;
        ctx.fillText(val.toFixed(1), 26, y + 4);
      });

      // Compute Spectral Curve Data Points
      const points: { x: number; y: number }[] = [];
      const c = concentration;

      for (let wl = 400; wl <= 750; wl += 2) {
        const x = 60 + ((wl - 400) / 350) * (width - 90);
        let absorbance = 0.1;

        if (analyteMode === 'MELAMINE_AUNP') {
          // Unaggregated AuNP 520nm peak (diminishes as melamine crosslinks)
          const peak520 = Math.exp(-Math.pow((wl - 520) / 30, 2)) * (1.35 - (c / 10.0) * 0.95);
          // Melamine Aggregation 650nm LSPR red-shift peak (grows with concentration)
          const peak650 = Math.exp(-Math.pow((wl - 655) / 45, 2)) * ((c / 10.0) * 1.4);
          absorbance = peak520 + peak650 + 0.08 + Math.sin(time + wl * 0.05) * 0.015;
        } else if (analyteMode === 'H2O2_NANOZYME') {
          // TMB oxidation peak at 652 nm
          const peak652 = Math.exp(-Math.pow((wl - 652) / 35, 2)) * ((c / 10.0) * 1.5);
          absorbance = 0.05 + peak652 + Math.sin(time + wl * 0.04) * 0.01;
        } else {
          // Starch-iodine polyiodide peak at 610 nm
          const peak610 = Math.exp(-Math.pow((wl - 610) / 40, 2)) * ((c / 10.0) * 1.55);
          absorbance = 0.06 + peak610;
        }

        const y = (height - 40) - (absorbance / 1.6) * (height - 80);
        points.push({ x, y });
      }

      // Draw Glowing 3D Area Fill Gradient
      const grad = ctx.createLinearGradient(0, 40, 0, height - 40);
      if (analyteMode === 'MELAMINE_AUNP') {
        grad.addColorStop(0, c > 2.5 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(239, 68, 68, 0.45)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
      } else {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, height - 40);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, height - 40);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Draw Main Spectral Line
      ctx.beginPath();
      points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.lineWidth = 3;
      ctx.strokeStyle = analyteMode === 'MELAMINE_AUNP' 
        ? (c > 2.5 ? '#3b82f6' : '#ef4444') 
        : '#10b981';
      ctx.stroke();

      // 520nm & 650nm Peak Annotation Markers
      if (analyteMode === 'MELAMINE_AUNP') {
        const x520 = 60 + ((520 - 400) / 350) * (width - 90);
        const x650 = 60 + ((655 - 400) / 350) * (width - 90);

        // Marker 520nm
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(x520, points.find(p => Math.abs(p.x - x520) < 3)?.y || 150, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('520nm Monodisperse AuNP', x520 - 50, 45);

        // Marker 650nm
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(x650, points.find(p => Math.abs(p.x - x650) < 3)?.y || 150, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillText('650nm Melamine Aggregates', x650 - 60, 65);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [analyteMode, concentration]);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-safe" style={{ fontSize: '0.7rem' }}>
              <Zap size={13} /> Optical Physics Engine
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Surface Plasmon Resonance (LSPR) Shift</span>
          </div>
          <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginTop: '4px' }}>
            UV-Vis Absorbance &amp; Plasmonic Spectral Simulation
          </h3>
        </div>

        {/* Analyte Mode Selector */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { sound.click(); setAnalyteMode('MELAMINE_AUNP'); }}
            className={analyteMode === 'MELAMINE_AUNP' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            Zone 1: Melamine AuNPs
          </button>
          <button
            onClick={() => { sound.click(); setAnalyteMode('H2O2_NANOZYME'); }}
            className={analyteMode === 'H2O2_NANOZYME' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            Zone 2: H2O2 Nanozyme
          </button>
          <button
            onClick={() => { sound.click(); setAnalyteMode('STARCH_POLYIODIDE'); }}
            className={analyteMode === 'STARCH_POLYIODIDE' ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
          >
            Zone 4: Starch Lugol
          </button>
        </div>
      </div>

      {/* Interactive Concentration Slider */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sliders size={18} color="var(--color-primary)" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Simulated Spiked Analyte Concentration:</span>
          <span className="badge badge-warning" style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
            {concentration.toFixed(1)} {analyteMode === 'STARCH_POLYIODIDE' ? '% w/v' : 'ppm'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '260px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>0.0</span>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={concentration}
            onChange={e => setConcentration(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>10.0</span>
        </div>
      </div>

      {/* 3D Wave Canvas */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#0a0f1d' }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={260}
          style={{ width: '100%', height: '260px', display: 'block' }}
        />
      </div>

      {/* Scientific Theory Callout */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        marginTop: '16px',
        background: 'rgba(59, 130, 246, 0.06)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        padding: '12px 16px',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          {analyteMode === 'MELAMINE_AUNP' && (
            <span>
              <strong>Scientific Principle:</strong> Unaggregated 13nm AuNPs exhibit a strong Localized Surface Plasmon Resonance (LSPR) band centered at <strong>520 nm</strong> (wine-red). Triazine nitrogens in Melamine coordinate with Au, displacing citrate and reducing interparticle separation, which triggers dipole plasmon coupling and shifts absorbance to <strong>650 nm</strong> (blue/purple).
            </span>
          )}
          {analyteMode === 'H2O2_NANOZYME' && (
            <span>
              <strong>Scientific Principle:</strong> Fe3O4 inorganic nanozymes possess intrinsic peroxidase-like catalytic activity. In the presence of H2O2, the Fenton redox cycle generates hydroxyl radicals (•OH) that oxidize colorless TMB into a charge-transfer radical cation ($oxTMB$) with an intense absorption peak at <strong>652 nm</strong>.
            </span>
          )}
          {analyteMode === 'STARCH_POLYIODIDE' && (
            <span>
              <strong>Scientific Principle:</strong> Polyiodide ions (I3- / I5-) enter the hydrophobic cavity of amylose helices, inducing a charge-transfer excitation with a deep inky-black absorption band centered at <strong>610 nm</strong>.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
