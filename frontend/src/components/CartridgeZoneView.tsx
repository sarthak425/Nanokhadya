import { useState } from 'react';
import { ShieldCheck, Layers } from 'lucide-react';

export interface ZoneData {
  zoneIndex: number;
  targetName: string;
  category: string;
  status: 'SAFE' | 'SUSPICIOUS' | 'ADULTERATED' | 'CONTROL_OK';
  absorbance: number;
  reactionColor: string;
}

interface Props {
  selectedFood: 'Milk' | 'Honey' | 'Paneer';
  onFoodChange?: (food: 'Milk' | 'Honey' | 'Paneer') => void;
  isAdulterated?: boolean;
  detectedAdulterants?: string[];
  compact?: boolean;
}

export const CARTRIDGE_ZONES_CONFIG: Record<'Milk' | 'Honey' | 'Paneer', { name: string; category: string; defaultColor: string; activeColor: string }[]> = {
  Milk: [
    { name: 'Starch', category: 'Adulterant', defaultColor: '#e0e7ff', activeColor: '#312e81' }, // Iodine blue
    { name: 'Urea', category: 'Adulterant', defaultColor: '#fef3c7', activeColor: '#d97706' }, // Yellow-orange
    { name: 'Detergent/Surfactant', category: 'Adulterant', defaultColor: '#cffafe', activeColor: '#0891b2' },
    { name: 'Peroxide', category: 'Chemical', defaultColor: '#f3e8ff', activeColor: '#7c3aed' },
    { name: 'Neutralizer (Alkaline)', category: 'Neutralizer', defaultColor: '#ecfdf5', activeColor: '#059669' },
    { name: 'Antibiotic (selected)', category: 'Contaminant', defaultColor: '#fce7f3', activeColor: '#db2777' },
    { name: 'Formalin', category: 'Preservative', defaultColor: '#ede9fe', activeColor: '#6d28d9' },
    { name: 'Melamine', category: 'Adulterant', defaultColor: '#fee2e2', activeColor: '#dc2626' },
    { name: 'Protein (non-dairy)', category: 'Adulterant', defaultColor: '#e0e7ff', activeColor: '#4338ca' },
    { name: 'Added water', category: 'Dilution', defaultColor: '#e0f2fe', activeColor: '#0284c7' },
    { name: 'Salt / Mineral balance', category: 'Electrolyte', defaultColor: '#fef9c3', activeColor: '#ca8a04' },
    { name: 'Preservatives', category: 'Preservative', defaultColor: '#ffedd5', activeColor: '#ea580c' },
    { name: 'pH indicator', category: 'Physical', defaultColor: '#f0fdf4', activeColor: '#16a34a' },
    { name: 'Viscosity modifier', category: 'Physical', defaultColor: '#f5f3ff', activeColor: '#8b5cf6' },
    { name: 'Color/clarity marker', category: 'Optical', defaultColor: '#fae8ff', activeColor: '#c026d3' },
    { name: 'Control', category: 'Validation', defaultColor: '#dcfce7', activeColor: '#15803d' },
  ],
  Honey: [
    { name: 'Added sugar (syrup)', category: 'Adulterant', defaultColor: '#fef3c7', activeColor: '#b45309' },
    { name: 'Fructose/Glucose ratio', category: 'Purity', defaultColor: '#fef9c3', activeColor: '#eab308' },
    { name: 'HMF (overheating)', category: 'Degradation', defaultColor: '#fed7aa', activeColor: '#ea580c' },
    { name: 'Rice syrup marker', category: 'Adulterant', defaultColor: '#fce7f3', activeColor: '#be185d' },
    { name: 'Invert sugar', category: 'Adulterant', defaultColor: '#ffe4e6', activeColor: '#e11d48' },
    { name: 'C4 sugar (adulterant)', category: 'Adulterant', defaultColor: '#fee2e2', activeColor: '#b91c1c' },
    { name: 'Sulfite', category: 'Preservative', defaultColor: '#f1f5f9', activeColor: '#475569' },
    { name: 'Antibiotic (selected)', category: 'Contaminant', defaultColor: '#fae8ff', activeColor: '#a21caf' },
    { name: 'Pesticide residue', category: 'Contaminant', defaultColor: '#f3e8ff', activeColor: '#6b21a8' },
    { name: 'Heavy metals (basic)', category: 'Toxin', defaultColor: '#e2e8f0', activeColor: '#334155' },
    { name: 'Colorant (artificial)', category: 'Adulterant', defaultColor: '#fef08a', activeColor: '#ca8a04' },
    { name: 'Moisture level', category: 'Quality', defaultColor: '#e0f2fe', activeColor: '#0369a1' },
    { name: 'pH indicator', category: 'Physical', defaultColor: '#f0fdf4', activeColor: '#15803d' },
    { name: 'Viscosity marker', category: 'Physical', defaultColor: '#fef3c7', activeColor: '#d97706' },
    { name: 'Floral origin marker', category: 'Origin', defaultColor: '#fdf4ff', activeColor: '#c026d3' },
    { name: 'Control', category: 'Validation', defaultColor: '#dcfce7', activeColor: '#15803d' },
  ],
  Paneer: [
    { name: 'Starch', category: 'Adulterant', defaultColor: '#e0e7ff', activeColor: '#312e81' },
    { name: 'Non-dairy protein', category: 'Adulterant', defaultColor: '#f3e8ff', activeColor: '#7e22ce' },
    { name: 'Vegetable fat/oil', category: 'Adulterant', defaultColor: '#fef3c7', activeColor: '#b45309' },
    { name: 'Detergent', category: 'Chemical', defaultColor: '#cffafe', activeColor: '#0e7490' },
    { name: 'Preservatives', category: 'Preservative', defaultColor: '#ffedd5', activeColor: '#c2410c' },
    { name: 'Urea', category: 'Adulterant', defaultColor: '#fef9c3', activeColor: '#ca8a04' },
    { name: 'Formalin', category: 'Preservative', defaultColor: '#ede9fe', activeColor: '#5b21b6' },
    { name: 'Salt excess', category: 'Electrolyte', defaultColor: '#f1f5f9', activeColor: '#475569' },
    { name: 'Milk adulterant marker', category: 'Marker', defaultColor: '#fae8ff', activeColor: '#a21caf' },
    { name: 'Acid neutralizer', category: 'Chemical', defaultColor: '#ecfdf5', activeColor: '#047857' },
    { name: 'Colorant', category: 'Adulterant', defaultColor: '#fef08a', activeColor: '#a16207' },
    { name: 'Texture modifier', category: 'Physical', defaultColor: '#e0f2fe', activeColor: '#0284c7' },
    { name: 'pH indicator', category: 'Physical', defaultColor: '#f0fdf4', activeColor: '#166534' },
    { name: 'Calcium level', category: 'Mineral', defaultColor: '#ede9fe', activeColor: '#4c1d95' },
    { name: 'Moisture content', category: 'Quality', defaultColor: '#dbeafe', activeColor: '#1d4ed8' },
    { name: 'Control', category: 'Validation', defaultColor: '#dcfce7', activeColor: '#15803d' },
  ],
};

export function CartridgeZoneView({
  selectedFood,
  onFoodChange,
  isAdulterated = false,
  detectedAdulterants = [],
  compact = false,
}: Props) {
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);
  const zones = CARTRIDGE_ZONES_CONFIG[selectedFood];

  return (
    <div className="cartridge-container card" style={{ padding: compact ? '16px' : '24px', background: 'var(--bg-card, #121824)' }}>
      {/* Header with Title & Food Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={18} color="var(--accent, #38bdf8)" />
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
              Universal Nano-Cartridge Architecture
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)', marginTop: 2 }}>
            16 Chemically Functionalized Sensing Zones · Paper Microfluidics & Nanozyme Catalysts
          </div>
        </div>

        {/* 3 Food Categories Toggle */}
        {onFoodChange && (
          <div style={{ display: 'flex', background: 'var(--bg-secondary, #0f172a)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
            {(['Milk', 'Honey', 'Paneer'] as const).map(food => (
              <button
                key={food}
                onClick={() => onFoodChange(food)}
                className={`btn ${selectedFood === food ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  padding: '6px 14px',
                  fontSize: 12,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{food === 'Milk' ? '🥛' : food === 'Honey' ? '🍯' : '🧀'}</span>
                <span>{food}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3 Physical Detection Steps Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: 12,
        padding: '12px 16px',
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px solid rgba(56, 189, 248, 0.2)',
        borderRadius: 10,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#38bdf8', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
            1
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e0f2fe' }}>Nanozymes (Nano zma)</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Target-specific catalytic nanoparticles</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#10b981', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
            2
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#d1fae5' }}>Chemical Mixed</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Microfluidic capillary wicking (1–2 mL)</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
            3
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fef3c7' }}>Reaction (Color + AS7265x)</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Chromogenic shift & 18-channel NIR</div>
          </div>
        </div>
      </div>

      {/* Cartridge Strip Graphic Top-View */}
      <div style={{
        background: '#0b1120',
        border: '2px solid #334155',
        borderRadius: 16,
        padding: '20px 16px',
        position: 'relative',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid #1e293b', paddingBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', color: '#64748b' }}>
              CARTRIDGE CHANNEL: {selectedFood.toUpperCase()}
            </span>
            <span className="badge" style={{ fontSize: 10, background: '#1e293b', color: '#38bdf8' }}>
              16 SENSING ZONES
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#10b981' }}>
            <ShieldCheck size={14} />
            <span>Zone 16: Control Validated</span>
          </div>
        </div>

        {/* 16 Zones Track */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(16, minmax(28px, 1fr))',
          gap: 6,
          overflowX: 'auto',
          padding: '8px 4px',
        }}>
          {zones.map((z, idx) => {
            const isControl = idx === 15;
            const isHit = isAdulterated && detectedAdulterants.some(a => a.toLowerCase().includes(z.name.toLowerCase()));
            const isHovered = hoveredZone === idx;
            const zoneColor = isControl ? '#10b981' : isHit ? z.activeColor : z.defaultColor;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredZone(idx)}
                onMouseLeave={() => setHoveredZone(null)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Microfluidic Well Circle */}
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${zoneColor} 0%, rgba(15,23,42,0.8) 100%)`,
                  border: isHit ? '2px solid #ef4444' : isControl ? '2px solid #10b981' : isHovered ? '2px solid #38bdf8' : '1px solid #475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isHit ? '0 0 10px rgba(239,68,68,0.5)' : isControl ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isHit || isControl ? '#fff' : '#0f172a' }}>
                    {idx + 1}
                  </span>
                </div>

                {/* Zone Number Label */}
                <span style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: 600 }}>
                  Z{idx + 1}
                </span>

                {/* Floating Tooltip */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    bottom: '48px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#0f172a',
                    border: '1px solid #38bdf8',
                    borderRadius: 8,
                    padding: '8px 12px',
                    width: '180px',
                    zIndex: 50,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
                    pointerEvents: 'none',
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                      Zone {idx + 1}: {z.name}
                    </div>
                    <div style={{ fontSize: 10, color: '#38bdf8', marginTop: 2 }}>
                      Category: {z.category}
                    </div>
                    <div style={{ fontSize: 10, color: isHit ? '#ef4444' : isControl ? '#10b981' : '#94a3b8', marginTop: 4, fontWeight: 600 }}>
                      Status: {isControl ? 'CONTROL PASS' : isHit ? 'ANOMALY DETECTED' : 'NORMAL'}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Zone Legend Table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
        {zones.slice(0, 8).map((z, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '4px 8px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#334155', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700 }}>
              {i + 1}
            </span>
            <span style={{ color: '#e2e8f0', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{z.name}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>{z.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
