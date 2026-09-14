import {
  Palette, Sparkles, Activity, Zap, Layers,
  Compass, Gauge, Thermometer, Radio, ShieldCheck, AlertCircle
} from 'lucide-react';

interface Props {
  foodType: 'Milk' | 'Honey' | 'Paneer';
  isAdulterated?: boolean;
  detectedAdulterant?: string | null;
}

export function MultimodalSensorGrid({ foodType, isAdulterated = false, detectedAdulterant }: Props) {
  // Sensor readings tailored to selected food and adulteration state
  const phValue = foodType === 'Honey' ? (isAdulterated ? 4.6 : 3.9) : foodType === 'Paneer' ? (isAdulterated ? 6.4 : 5.8) : (isAdulterated ? 7.3 : 6.68);
  const condValue = foodType === 'Honey' ? (isAdulterated ? 1.2 : 0.42) : foodType === 'Paneer' ? (isAdulterated ? 6.1 : 4.8) : (isAdulterated ? 6.8 : 4.6);
  const ionMv = foodType === 'Paneer' ? (isAdulterated ? 85 : 142) : foodType === 'Honey' ? 64 : (isAdulterated ? 180 : 125);
  const currentUa = isAdulterated ? 7.8 : 2.4;
  const tempC = 24.8;
  const rgbValues = foodType === 'Honey' ? [218, 165, 32] : foodType === 'Paneer' ? [245, 245, 240] : [240, 244, 250];

  const sensors = [
    {
      id: 'colorimetric',
      name: 'Colorimetric Chemical Sensor',
      icon: Palette,
      accentColor: '#38bdf8',
      principle: 'Color change due to chemical reaction',
      rawData: `RGB = [${rgbValues.join(', ')}] · Hue: 42° · Sat: 68%`,
      outputDisplay: `ΔE = ${isAdulterated ? '12.4 (Shift)' : '1.8 (Normal)'}`,
      contribution: 'Target / chromogenic zone response',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'nanozyme',
      name: 'Nanozyme Sensor',
      icon: Sparkles,
      accentColor: '#8b5cf6',
      principle: 'Catalytic activity of nanomaterials (nanozymes)',
      rawData: 'Kinetics: ΔAbs/Δt · Rate: 0.042 s⁻¹',
      outputDisplay: `Activity: ${isAdulterated ? 'High Catalysis (Adulterant)' : 'Baseline Active'}`,
      contribution: 'Sensitivity-enhanced chemical response',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'enzyme',
      name: 'Enzyme Sensor',
      icon: Activity,
      accentColor: '#10b981',
      principle: 'Biochemical reaction catalyzed by specific enzymes',
      rawData: 'Optical Absorbance vs Time (0–15 min)',
      outputDisplay: `Signal: ${isAdulterated ? '0.92 OD (Excess)' : '0.45 OD (Standard)'}`,
      contribution: 'Target analyte concentration',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'electrochemical',
      name: 'Electrochemical Sensor',
      icon: Zap,
      accentColor: '#f59e0b',
      principle: 'Redox reaction & ion/electron transfer (W-R-C electrodes)',
      rawData: `Current: ${currentUa} μA · Potential: 0.38 V · Imp: 1.2 kΩ`,
      outputDisplay: `${currentUa} μA Redox Peak`,
      contribution: 'Chemical / electroactive target identification',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'ion_selective',
      name: 'Ion-Selective Sensor',
      icon: Compass,
      accentColor: '#ec4899',
      principle: 'Selective ion recognition (Na⁺, K⁺, Ca²⁺, Cl⁻ membrane)',
      rawData: `Membrane Potential: ${ionMv} mV`,
      outputDisplay: `${ionMv} mV (${foodType === 'Paneer' ? 'Ca²⁺ target' : 'Mineral Balance'})`,
      contribution: 'Specific ion concentration & salt balance',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'conductivity',
      name: 'Conductivity Sensor',
      icon: Gauge,
      accentColor: '#06b6d4',
      principle: 'Ionic content changes via interdigitated electrodes',
      rawData: `Conductivity: ${condValue} mS/cm · Resistance: 238 Ω`,
      outputDisplay: `${condValue} mS/cm`,
      contribution: 'Overall ionic content & dilution detection',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'ph',
      name: 'pH Sensor',
      icon: Layers,
      accentColor: '#14b8a6',
      principle: 'H⁺ ion activity (Electrochemical / Indicator)',
      rawData: `Potential Shift → Calibrated pH: ${phValue}`,
      outputDisplay: `pH ${phValue}`,
      contribution: 'Acidity / alkalinity & neutralizer tracking',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
    {
      id: 'temperature',
      name: 'Temperature Sensor',
      icon: Thermometer,
      accentColor: '#64748b',
      principle: 'Heat/thermal response (Thermistor / RTD)',
      rawData: `Chamber Thermal: ${tempC} °C`,
      outputDisplay: `${tempC} °C (Thermal Comp: Applied)`,
      contribution: 'Spectral & kinetic temperature drift compensation',
      status: 'NORMAL',
    },
    {
      id: 'sers',
      name: 'SERS Nanostructure',
      icon: Radio,
      accentColor: '#e11d48',
      principle: 'Surface-Enhanced Raman Scattering enhancement by nanostructures',
      rawData: 'Laser 785 nm · Raman Shift (600–1800 cm⁻¹)',
      outputDisplay: 'Peaks: ~785, ~1090, ~1450 cm⁻¹',
      contribution: 'Ultra-high-specificity molecular fingerprint',
      status: isAdulterated ? 'ALERT' : 'NORMAL',
    },
  ];

  return (
    <div className="card" style={{ padding: '24px', background: 'var(--bg-card, #121824)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} color="var(--accent, #38bdf8)" />
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)', margin: 0 }}>
              9 Cartridge Sensor Modalities & Telemetry
            </h2>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)', marginTop: 4 }}>
            Multimodal sensor fusion engine feeding AI classification for {foodType}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', fontSize: 11 }}>
            9 Sensor Channels Fused
          </span>
          <span className="badge" style={{ background: isAdulterated ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: isAdulterated ? '#ef4444' : '#10b981', border: `1px solid ${isAdulterated ? '#ef4444' : '#10b981'}`, fontSize: 11 }}>
            {isAdulterated ? `Anomaly: ${detectedAdulterant || 'Adulterant Hit'}` : 'All Signatures Authentic'}
          </span>
        </div>
      </div>

      {/* Grid of 9 Sensors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 14,
      }}>
        {sensors.map((sensor) => {
          const Icon = sensor.icon;
          const isAlert = sensor.status === 'ALERT';

          return (
            <div
              key={sensor.id}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: isAlert ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border, #1e293b)',
                borderRadius: 12,
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative',
                boxShadow: isAlert ? '0 0 12px rgba(239, 68, 68, 0.15)' : 'none',
              }}
            >
              {/* Top Row: Icon + Name + Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: `rgba(${parseInt(sensor.accentColor.slice(1, 3), 16)}, ${parseInt(sensor.accentColor.slice(3, 5), 16)}, ${parseInt(sensor.accentColor.slice(5, 7), 16)}, 0.15)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: sensor.accentColor,
                    }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                        {sensor.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b', marginTop: 1 }}>
                        {sensor.principle}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: isAlert ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isAlert ? '#ef4444' : '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    {isAlert ? <AlertCircle size={10} /> : <ShieldCheck size={10} />}
                    {sensor.status}
                  </span>
                </div>

                {/* Output Pill */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginBottom: 10,
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                  <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Raw Measurement Output
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isAlert ? '#fca5a5' : '#38bdf8', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                    {sensor.outputDisplay}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    {sensor.rawData}
                  </div>
                </div>
              </div>

              {/* Bottom: Contribution to AI */}
              <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: sensor.accentColor, fontWeight: 700 }}>Contribution:</span>
                <span>{sensor.contribution}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
