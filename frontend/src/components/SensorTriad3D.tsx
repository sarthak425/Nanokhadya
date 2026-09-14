/**
 * SensorTriad3D — Isometric 3D visualization of the AMS AS7265x Triad Sensor.
 *
 * Shows the 3 optical ICs (AS72651 Master NIR, AS72652 Slave VIS, AS72653 Slave UV-VIS)
 * arranged on the sensor board in a 3D isometric plane with illuminated optical apertures,
 * pin headers, and live spectral wavelength indicators.
 */
import { useState } from 'react';

interface SensorIC {
  id: string;
  name: string;
  role: string;
  range: string;
  color: string;
  channels: number[];
  x: number; // grid pos
  y: number;
}

const ICS: SensorIC[] = [
  {
    id: 'as72653',
    name: 'AS72653',
    role: 'UV-VIS Sensor (Slave 2)',
    range: '410 – 535 nm',
    color: '#8b00ff',
    channels: [410, 435, 460, 485, 510, 535],
    x: 40,
    y: 35,
  },
  {
    id: 'as72652',
    name: 'AS72652',
    role: 'Visible Sensor (Slave 1)',
    range: '560 – 705 nm',
    color: '#00cc66',
    channels: [560, 585, 610, 645, 680, 705],
    x: 180,
    y: 35,
  },
  {
    id: 'as72651',
    name: 'AS72651',
    role: 'NIR Master Sensor (I2C/UART)',
    range: '730 – 940 nm',
    color: '#ff3344',
    channels: [730, 760, 810, 860, 900, 940],
    x: 320,
    y: 35,
  },
];

export function SensorTriad3D() {
  const [selectedIC, setSelectedIC] = useState<SensorIC>(ICS[0]);
  const [hoveredIC, setHoveredIC] = useState<string | null>(null);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="card-title">3D Optical Sensor Triad</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AMS AS7265x Tri-Sensor Multispectral Architecture</div>
        </div>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 600 }}>
          3D Perspective
        </span>
      </div>

      {/* 3D Scene viewport */}
      <div style={{
        perspective: '1000px',
        padding: '20px 10px',
        display: 'flex',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(22,27,34,0.7) 0%, rgba(13,17,23,0.9) 100%)',
        borderRadius: 8,
        border: '1px solid var(--border)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        <div style={{
          position: 'relative',
          width: 480,
          minWidth: 460,
          height: 180,
          margin: '0 auto',
          transform: 'rotateX(26deg) rotateY(-8deg) rotateZ(2deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s ease',
          background: 'rgba(18, 24, 38, 0.95)',
          borderRadius: 12,
          border: '2px solid rgba(56, 139, 253, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 25px rgba(56,139,253,0.15)',
        }}>
          {/* PCB Grid silkscreen lines */}
          <div style={{
            position: 'absolute', inset: 8,
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 8,
            pointerEvents: 'none',
          }} />

          {/* PCB Branding */}
          <div style={{
            position: 'absolute', bottom: 12, left: 16,
            fontSize: 10, fontFamily: 'var(--font-mono)',
            color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em',
          }}>
            NANOTECH · AS7265X TRIAD · REV 1.2
          </div>

          {/* 3 Physical IC Packages */}
          {ICS.map(ic => {
            const isSel = selectedIC.id === ic.id;
            const isHov = hoveredIC === ic.id;
            return (
              <div
                key={ic.id}
                onClick={() => setSelectedIC(ic)}
                onMouseEnter={() => setHoveredIC(ic.id)}
                onMouseLeave={() => setHoveredIC(null)}
                style={{
                  position: 'absolute',
                  left: ic.x,
                  top: ic.y,
                  width: 100,
                  height: 90,
                  cursor: 'pointer',
                  transform: (isSel || isHov) ? 'translateZ(18px) scale(1.04)' : 'translateZ(6px)',
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              >
                {/* IC Body */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: isSel
                    ? 'linear-gradient(145deg, #1c2638, #0e1522)'
                    : 'linear-gradient(145deg, #161c28, #0a0e17)',
                  borderRadius: 6,
                  border: isSel ? `2px solid ${ic.color}` : '1px solid rgba(255,255,255,0.15)',
                  boxShadow: isSel
                    ? `0 10px 20px rgba(0,0,0,0.5), 0 0 16px ${ic.color}44`
                    : '0 6px 12px rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 8,
                }}>
                  {/* Optical Lens Aperture with Glowing Ring */}
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #000 40%, #1a1a2e 90%)',
                    border: `2px solid ${ic.color}`,
                    boxShadow: `0 0 10px 2px ${ic.color}66`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    position: 'relative',
                  }}>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: ic.color,
                      boxShadow: `0 0 6px ${ic.color}`,
                      animation: 'aperturePulse 2s infinite ease-in-out',
                    }} />
                  </div>

                  <div style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: isSel ? ic.color : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {ic.name}
                  </div>
                  <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 2 }}>
                    {ic.channels.length} Channels
                  </div>
                </div>

                {/* 3D Side Depth Face */}
                <div style={{
                  position: 'absolute',
                  bottom: -6,
                  left: 0,
                  width: '100%',
                  height: 6,
                  background: '#05070a',
                  transform: 'rotateX(-90deg)',
                  transformOrigin: 'top center',
                  borderRadius: '0 0 6px 6px',
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected IC Detail Inspector */}
      <div style={{
        marginTop: 16,
        padding: '12px 16px',
        borderRadius: 8,
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedIC.color, display: 'inline-block', boxShadow: `0 0 6px ${selectedIC.color}` }} />
            <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{selectedIC.name} — {selectedIC.role}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Spectral Coverage: <span className="mono" style={{ color: selectedIC.color, fontWeight: 600 }}>{selectedIC.range}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {selectedIC.channels.map(wl => (
            <span
              key={wl}
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                padding: '3px 7px',
                borderRadius: 4,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {wl} nm
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes aperturePulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
