/**
 * SpectralChart3D — 3D isometric bar chart for 18-channel AS7265x data.
 *
 * Renders each spectral channel as a 3D CSS bar using perspective transforms.
 * Wavelength-accurate colours from UV (violet) → Vis (green/red) → NIR (dark red).
 *
 * This is the scientifically meaningful 3D visualization:
 * the spectral fingerprint looks like a real spectrograph output.
 */
import { useState } from 'react';
import type { SpectralChannel } from '../services/api';

interface Props {
  channels: SpectralChannel[];
  title?: string;
  height?: number;
}

// Approximate visible + NIR colour for each wavelength (for visual context only)
function wavelengthToColor(nm: number): string {
  if (nm < 440)       return '#8b00ff'; // UV/violet
  if (nm < 480)       return '#4b0082'; // indigo
  if (nm < 510)       return '#0000ff'; // blue
  if (nm < 540)       return '#00aa00'; // green
  if (nm < 580)       return '#aaaa00'; // yellow-green
  if (nm < 620)       return '#ff7700'; // orange
  if (nm < 680)       return '#ff2200'; // red
  if (nm < 750)       return '#cc0000'; // deep red
  if (nm < 850)       return '#880000'; // NIR dark red
  return '#440000';                      // far NIR
}

function lighten(hex: string, amt = 40): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `rgb(${r},${g},${b})`;
}

function darken(hex: string, amt = 40): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const bv = Math.max(0, (n & 0xff) - amt);
  return `rgb(${r},${g},${bv})`;
}

export function SpectralChart3D({ channels, title, height = 260 }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!channels.length) return null;

  const maxRaw = Math.max(...channels.map(c => c.rawValue), 1);
  const BAR_W  = 28;    // bar width px
  const BAR_D  = 14;    // bar depth (3D side face width) px
  const MAX_H  = height - 70;

  return (
    <div>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div className="card-title">{title}</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>3D Spectral Fingerprint</span>
        </div>
      )}

      {/* 3D scene container */}
      <div style={{
        overflowX: 'auto',
        paddingBottom: 12,
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 4,
          paddingLeft: 16,
          paddingRight: 16,
          height: height,
          minWidth: channels.length * (BAR_W + 4) + 32,
          /* 3D perspective on the whole scene */
          perspective: '900px',
          perspectiveOrigin: '50% 10%',
        }}>

          {channels.map((ch, i) => {
            const barH   = Math.max(4, (ch.rawValue / maxRaw) * MAX_H);
            const color  = wavelengthToColor(ch.wavelength);
            const isHov  = hovered === i;
            const delay  = i * 30; // staggered entrance

            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {/* Tooltip */}
                {isHov && (
                  <div style={{
                    position: 'absolute',
                    bottom: height - 10,
                    left: i * (BAR_W + 4) + 16,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '6px 10px',
                    fontSize: 11,
                    color: 'var(--text-primary)',
                    zIndex: 10,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ fontWeight: 700, color }}>{ch.wavelength} nm</div>
                    <div>Raw: <b>{Math.round(ch.rawValue)}</b> counts</div>
                    {ch.processedValue != null && (
                      <div>SNV: <b>{ch.processedValue.toFixed(3)}</b></div>
                    )}
                  </div>
                )}

                {/* 3D bar — CSS box with front, top, and side faces */}
                <div
                  style={{
                    position: 'relative',
                    width: BAR_W,
                    height: barH,
                    transformStyle: 'preserve-3d',
                    transform: `rotateX(20deg) rotateY(-10deg) ${isHov ? 'translateY(-6px) scale(1.04)' : ''}`,
                    transition: `height 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms, transform 0.2s ease`,
                    animation: `bar3dEntrance 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms both`,
                  }}
                >
                  {/* Front face */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to bottom, ${lighten(color, 30)}, ${color})`,
                    borderRadius: '3px 3px 0 0',
                    boxShadow: isHov ? `0 0 12px 2px ${color}66` : 'none',
                    transition: 'box-shadow 0.2s',
                  }} />

                  {/* Top face */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: BAR_W,
                    height: BAR_D,
                    background: lighten(color, 60),
                    transform: `rotateX(-90deg)`,
                    transformOrigin: 'top center',
                  }} />

                  {/* Right side face */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: -BAR_D,
                    width: BAR_D,
                    height: '100%',
                    background: darken(color, 30),
                    transform: `rotateY(90deg)`,
                    transformOrigin: 'left center',
                    borderRadius: '0 3px 0 0',
                  }} />
                </div>

                {/* Channel label */}
                <div style={{
                  marginTop: 4,
                  fontSize: 9,
                  color: isHov ? color : 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  transition: 'color 0.2s',
                }}>
                  {ch.wavelength}
                </div>
              </div>
            );
          })}

          {/* Floor grid lines */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: 16,
            right: 16,
            height: 1,
            background: 'var(--border)',
          }} />
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>← UV/Vis (410–680 nm)</span>
        <span style={{ width: 80, height: 8, borderRadius: 4, background: 'linear-gradient(to right, #8b00ff, #0000ff, #00aa00, #ffaa00, #ff2200, #880000, #440000)', display: 'inline-block', verticalAlign: 'middle', margin: '0 4px' }} />
        <span>NIR (730–940 nm) →</span>
      </div>

      <style>{`
        @keyframes bar3dEntrance {
          from { transform: rotateX(20deg) rotateY(-10deg) scaleY(0); opacity: 0; }
          to   { transform: rotateX(20deg) rotateY(-10deg) scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
