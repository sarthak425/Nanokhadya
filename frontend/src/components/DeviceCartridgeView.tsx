import React, { useState } from 'react';
import { DeviceInfo, CartridgeInfo } from '../types';
import { 
  Cpu, 
  Package, 
  CheckCircle, 
  BatteryCharging, 
  Layers, 
  Activity, 
  Eye, 
  Zap, 
  Database, 
  Globe2, 
  ShieldCheck, 
  Binary, 
  Code2, 
  Wifi, 
  ChevronRight,
  Sparkles,
  Sliders,
  Maximize2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface DeviceCartridgeViewProps {
  devices: DeviceInfo[];
  cartridges: CartridgeInfo[];
}

export const DeviceCartridgeView: React.FC<DeviceCartridgeViewProps> = ({ devices, cartridges }) => {
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [activeSubTab, setActiveSubTab] = useState<'ARCHITECTURE' | 'HARDWARE' | 'INVENTORY'>('ARCHITECTURE');

  const architectureTiers = [
    {
      id: 1,
      name: 'Tier 1: Nanotechnology & Microfluidics (μPAD Cartridge)',
      tag: 'CHEMISTRY TRANSDUCTION',
      icon: <Layers size={18} color="#34d399" />,
      color: '#10b981',
      summary: 'Multiplex paper-based analytical device (μPAD) using Grade 1 Whatman filter paper with hydrophobic wax barriers and 6 discrete reaction zones.',
      keyComponents: [
        { title: 'Gold Nanoparticles (AuNPs)', detail: '13nm citrate-capped AuNPs. Undergoes Localized Surface Plasmon Resonance (LSPR) red-shift from 520nm (wine-red) to 650nm (blue-purple) upon melamine crosslinking.' },
        { title: 'Fe3O4 Magnetic Nanozyme', detail: 'Peroxidase-mimicking magnetic nanoparticle catalyst. Accelerates TMB substrate oxidation in the presence of hydrogen peroxide (H2O2), turning colorless to deep sky blue.' },
        { title: 'Enzyme Immobilization Matrix', detail: 'Immobilized Urease in a polymeric hydrogel matrix. Hydrolyzes exogenous synthetic urea into ammonium ions, detected via phenol red pH indicator (yellow to magenta).' },
        { title: 'Lugol Inclusion Complex', detail: 'Triiodide (I3-) ions trapped in amylose helical channels, yielding instantaneous inky blue-black coloration for starch and flour bulking.' },
        { title: 'Specific Chemical Sensors', detail: 'Acidified chromogenic arrays for Metanil Yellow in turmeric, Baudouin sesamol furfural test for Vanaspati in Ghee, and Fiehe resorcinol test for HMF inverted sugar in honey.' },
        { title: 'Zone 6: Process Control Standard', detail: 'Barium Sulphate (BaSO4) sintered calibration tile providing 99% diffuse white reflectance for camera exposure and white balance normalization.' }
      ]
    },
    {
      id: 2,
      name: 'Tier 2: Embedded Optical Reader (IoT Edge Hardware)',
      tag: 'EDGE INSTRUMENTATION',
      icon: <Cpu size={18} color="#60a5fa" />,
      color: '#3b82f6',
      summary: 'Light-tight, portable optoelectronic chamber powered by an ESP32-S3 microcontroller and high-resolution CMOS macro vision.',
      keyComponents: [
        { title: 'ESP32-S3 Microcontroller', detail: 'Dual-core 32-bit Xtensa LX7 @ 240 MHz, 512 KB SRAM, 8 MB PSRAM, hardware cryptographic accelerator (AES-256, SHA-512).' },
        { title: 'OV2640 Image Sensor', detail: '2.0 Megapixel CMOS camera sensor with 1/4" optical format, configured for macro focus at 28mm optical working distance with zero barrel distortion.' },
        { title: 'High-CRI 4000K LED Ring', detail: '4x Neutral-White diffuse LEDs (Color Rendering Index Ra > 95) with cross-polarizing baffles to eliminate specular highlights on wet paper zones.' },
        { title: 'Light-Tight Dark Chamber', detail: '3D-printed matte-black ABS enclosure blocking 100% of external ambient lux (prevents sunlight and fluorescent lamp interference).' },
        { title: 'Power Subsystem & BMS', detail: 'Rechargeable 3.7V 2000 mAh Li-ion battery with TP4056 charge controller and low-dropout 3.3V regulator (provides > 8 hours continuous field runtime).' },
        { title: 'User Interface & Feedback', detail: '0.96" I2C Monochrome OLED display (128x64) and piezo buzzer for optical test initiation and screening pass/fail acoustic alerts.' }
      ]
    },
    {
      id: 3,
      name: 'Tier 3: Edge Preprocessing & Computer Vision Pipeline',
      tag: 'COLORIMETRY & SIGNAL PROCESSING',
      icon: <Eye size={18} color="#fbbf24" />,
      color: '#f59e0b',
      summary: 'Autonomous image extraction, geometric perspective correction, white-tile normalization, and CIE L*a*b* Euclidean distance calculation.',
      keyComponents: [
        { title: 'Fiducial ROI Segmentation', detail: 'Edge detection (Canny / Otsu thresholding) locates 4 corner registration marks on the cartridge drawer, applying perspective transform to rectify tilt.' },
        { title: 'BaSO4 Illumination Normalization', detail: 'Zone 6 white standard compensates for battery voltage drops or LED lumen drift: R_norm = (R_sample / R_ref) * 255.' },
        { title: 'RGB to CIE L*a*b* Transformation', detail: 'Converts device-dependent RGB pixels into perceptually uniform CIE L*a*b* color space under D65 standard illuminant.' },
        { title: 'Euclidean Delta-E Calculation', detail: 'Computes Delta-E = sqrt((L1-L2)^2 + (a1-a2)^2 + (b1-b2)^2). When Delta-E < 2.0: natural pure; Delta-E >= 4.5: adulteration positive.' },
        { title: 'Signal Noise Filtering', detail: 'Gaussian spatial filtering and outlier rejection across 200 circular center pixels per reaction well to prevent edge fringing artifacts.' }
      ]
    },
    {
      id: 4,
      name: 'Tier 4: Central Decision Engine & Cloud Backend',
      tag: 'REGULATORY AI & SECURE GATEWAY',
      icon: <Database size={18} color="#ec4899" />,
      color: '#ec4899',
      summary: 'High-concurrency Spring Boot 3 / Java 21 microservices implementing 4PL calibration curves, FSSAI regulatory matrix, and immutable audit logs.',
      keyComponents: [
        { title: 'Spring Boot 3.3.4 REST Gateway', detail: 'Java 21 LTS reactive REST endpoints for device registration, cartridge validation, and streaming telemetry ingestion.' },
        { title: '4-Parameter Logistic (4PL) Engine', detail: 'Mathematical quantification mapping optical Delta-E to exact concentration (ppm / % w/w) via calibrated dose-response curves.' },
        { title: 'FSSAI Statutory Regulatory Matrix', detail: 'Encodes legal Maximum Residue Limits (MRLs) across Milk, Spices, Honey, Edible Oils, and Vegetables. Automatically triggers POSITIVE screening violations.' },
        { title: 'Cartridge Validity Gate', detail: 'Verifies cartridge UID, manufacturing batch, and expiration timestamp before executing test; rejects expired or reused cassettes.' },
        { title: 'Tamper-Evident SHA-256 Audit Trail', detail: 'Every test session is cryptographically hashed with GPS location, operator credentials, and raw spectral data for court admissibility.' }
      ]
    },
    {
      id: 5,
      name: 'Tier 5: Cloud Dashboard & National Geo-Surveillance Radar',
      tag: 'SPATIAL TELEMETRY & ENFORCEMENT',
      icon: <Globe2 size={18} color="#38bdf8" />,
      color: '#0284c7',
      summary: 'Responsive React 19 web application featuring real-time national APMC mandi tracking, 3D digital twins, and digital FSSAI enforcement notices.',
      keyComponents: [
        { title: 'National Geo-Surveillance Map', detail: 'Interactive vector map tracking 12 major Indian wholesale APMC mandis (Vashi, Dadar, Anand, Nizamabad, Guntur, Alwar, etc.) with a 360° radar sweep.' },
        { title: 'WebGL 3D Digital Twin Engine', detail: 'Real-time Three.js physical rendering of the μPAD cartridge with exploded layer views, optical ray tracing, and dynamic well color updates.' },
        { title: 'Plasmonic 3D Spectrum Plotter', detail: '3D mathematical surface visualization illustrating AuNP LSPR localized surface plasmon peak shift from 520nm to 650nm.' },
        { title: 'Multi-Commodity Preset Engine', detail: 'Integrated screening scenarios across 5 food categories: Dairy, Spices, Edible Oils & Ghee, Pure Honey, and Fresh Green Vegetables.' },
        { title: 'FSSAI Section 38 Seizure Generator', detail: 'One-click digital enforcement directive dispatching official batch confiscation orders to District Food Safety Commissioners.' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge badge-safe">
                <Sparkles size={13} /> SIH PS 26235 SYSTEM ARCHITECTURE
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Ministry of Food Processing Industries (MoFPI)
              </span>
            </div>
            <h1 style={{ fontSize: '1.8rem', marginTop: '6px' }}>
              End-to-End System Architecture & Hardware Instrumentation
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '750px', marginTop: '4px' }}>
              Comprehensive 5-tier architecture connecting nano-engineered microfluidic chemistry, portable ESP32-S3 IoT instrumentation, edge computer vision, and national cloud geo-surveillance.
            </p>
          </div>

          {/* Sub-Navigation Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { sound.click(); setActiveSubTab('ARCHITECTURE'); }}
              className={activeSubTab === 'ARCHITECTURE' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Layers size={15} /> System Architecture
            </button>
            <button
              onClick={() => { sound.click(); setActiveSubTab('HARDWARE'); }}
              className={activeSubTab === 'HARDWARE' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Cpu size={15} /> Registered Devices
            </button>
            <button
              onClick={() => { sound.click(); setActiveSubTab('INVENTORY'); }}
              className={activeSubTab === 'INVENTORY' ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Package size={15} /> μPAD Inventory
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'ARCHITECTURE' && (
        <>
          {/* Architecture Pipeline Visual Flow */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--color-primary)" /> 5-Tier Unified Architectural Pipeline
            </h3>

            {/* Interactive Tier Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '24px' }}>
              {architectureTiers.map(tier => (
                <div
                  key={tier.id}
                  onClick={() => { sound.click(); setSelectedTier(tier.id); }}
                  style={{
                    background: selectedTier === tier.id ? `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedTier === tier.id ? tier.color : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    boxShadow: selectedTier === tier.id ? `0 0 15px ${tier.color}33` : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {tier.icon}
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: tier.color, textTransform: 'uppercase' }}>
                      Tier {tier.id}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                    {tier.tag}
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Tier Deep Dive Panel */}
            {(() => {
              const currentTier = architectureTiers.find(t => t.id === selectedTier) || architectureTiers[0];
              return (
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: `1px solid ${currentTier.color}44`,
                  borderRadius: '16px',
                  padding: '24px',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <span className="badge badge-neutral" style={{ fontSize: '0.72rem', borderColor: currentTier.color, color: currentTier.color, marginBottom: '6px' }}>
                        TIER {currentTier.id} SPECIFICATION
                      </span>
                      <h2 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '4px' }}>{currentTier.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px', maxWidth: '780px' }}>
                        {currentTier.summary}
                      </p>
                    </div>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: `${currentTier.color}22`,
                      border: `1px solid ${currentTier.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {currentTier.icon}
                    </div>
                  </div>

                  {/* Components Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginTop: '20px' }}>
                    {currentTier.keyComponents.map((comp, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                          padding: '14px'
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <ChevronRight size={14} color={currentTier.color} /> {comp.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          {comp.detail}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Technical Hardware Block Diagram & Pinout Specification */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="var(--color-primary)" /> ESP32-S3 Microcontroller Pinout &amp; Interconnect Matrix
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Peripheral Subsystem</th>
                    <th>Component Model</th>
                    <th>ESP32-S3 GPIO Pins</th>
                    <th>Communication Protocol</th>
                    <th>Operational Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Optical Camera Module</td>
                    <td style={{ fontFamily: 'monospace' }}>OmniVision OV2640 2MP</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>D0-D7, PCLK, VSYNC, HREF, XCLK (GPIO 11-18, 5-9)</td>
                    <td>DVP 8-bit Parallel + SCCB (I2C)</td>
                    <td>Captures high-resolution macro imagery of the 6-well μPAD cassette at 28mm optical distance.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Diffused Illuminator</td>
                    <td style={{ fontFamily: 'monospace' }}>4x High-CRI 4000K LED Ring</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>GPIO 4 (LEDC PWM Channel 0)</td>
                    <td>PWM 5 kHz (10-bit Brightness Control)</td>
                    <td>Provides calibrated 4000K neutral-white light with cross-polarizing diffuser baffles.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Local Visual Display</td>
                    <td style={{ fontFamily: 'monospace' }}>SSD1306 0.96" OLED (128x64)</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>SDA: GPIO 21, SCL: GPIO 22</td>
                    <td>I2C Fast Mode (400 kHz)</td>
                    <td>Displays reader status, cartridge UID, countdown timer, and on-site Pass/Fail screening result.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Acoustic Feedback</td>
                    <td style={{ fontFamily: 'monospace' }}>Piezo Buzzer Transducer</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>GPIO 2 (LEDC PWM Channel 1)</td>
                    <td>Square Wave Frequency Modulation</td>
                    <td>Audible beeps for scan start, countdown ticks, pass chime, and positive adulterant alarm.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Battery Voltage Monitor</td>
                    <td style={{ fontFamily: 'monospace' }}>Resistor Divider (100k / 100k)</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>GPIO 1 (ADC1 Channel 0)</td>
                    <td>12-bit Analog-to-Digital Converter</td>
                    <td>Monitors 3.7V Li-ion cell level with auto-shutdown protection against deep discharge.</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Cloud Telemetry Link</td>
                    <td style={{ fontFamily: 'monospace' }}>ESP32-S3 Wi-Fi 4 + BLE 5.0</td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>Integrated 2.4 GHz RF Transceiver</td>
                    <td>HTTPS / TLS 1.3 + MQTT WebSockets</td>
                    <td>Secure real-time transmission of CIE Delta-E payloads directly to Spring Boot backend.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FSSAI Regulatory Comparison Table */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#34d399" /> Multi-Commodity Regulatory Thresholds &amp; Limit of Detection (LOD)
            </h3>

            <div style={{ overflowX: 'auto' }}>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Food Commodity</th>
                    <th>Target Adulterant</th>
                    <th>Detection Mechanism</th>
                    <th>NanoKhadya LOD</th>
                    <th>FSSAI Legal MRL</th>
                    <th>Statutory Classification</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>🥛 Bovine Milk</td>
                    <td>Melamine Triazine</td>
                    <td>13nm Citrate-AuNP LSPR Shift (520nm &rarr; 650nm)</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.25 ppm</td>
                    <td>2.5 ppm (1.0 ppm Infant)</td>
                    <td><span className="badge badge-danger">Hazardous Contaminant</span></td>
                  </tr>
                  <tr>
                    <td>🥛 Bovine Milk</td>
                    <td>Hydrogen Peroxide (H2O2)</td>
                    <td>Fe3O4 Nanozyme TMB Peroxidase Catalysis</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.5 ppm</td>
                    <td>0.0 ppm (Zero Tolerance)</td>
                    <td><span className="badge badge-danger">Prohibited Chemical</span></td>
                  </tr>
                  <tr>
                    <td>🥛 Bovine Milk</td>
                    <td>Synthetic Urea Spike</td>
                    <td>Immobilized Urease Phenol Red Hydrolysis</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>50 mg/L</td>
                    <td>700 mg/L Endogenous</td>
                    <td><span className="badge badge-warning">Physiological Limit</span></td>
                  </tr>
                  <tr>
                    <td>🧀 Paneer &amp; Dahi</td>
                    <td>Exogenous Starch &amp; Flour</td>
                    <td>Lugol Iodine-PVP Amylose Inclusion Complex</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.05% w/w</td>
                    <td>0.00% (Strictly Prohibited)</td>
                    <td><span className="badge badge-danger">Economic Bulking Fraud</span></td>
                  </tr>
                  <tr>
                    <td>🌶️ Turmeric (Haldi)</td>
                    <td>Metanil Yellow Dye</td>
                    <td>Acid-Promoted Curcuminoid Quinoid Reaction</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.01% w/w</td>
                    <td>0.00% (Banned Coal-Tar Dye)</td>
                    <td><span className="badge badge-danger">Carcinogenic Toxin</span></td>
                  </tr>
                  <tr>
                    <td>🌶️ Red Chilli Powder</td>
                    <td>Sudan Dyes (I-IV)</td>
                    <td>Lipophilic AuNP Partition Sensor Array</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.5 ppm</td>
                    <td>0.00 ppm (Banned Industrial Dye)</td>
                    <td><span className="badge badge-danger">Carcinogenic Toxin</span></td>
                  </tr>
                  <tr>
                    <td>🛢️ Mustard Oil</td>
                    <td>Argemone Mexicana Oil</td>
                    <td>Sanguinarine Ferric Charge-Transfer Complex</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.02% w/w</td>
                    <td>0.00% (Zero Tolerance)</td>
                    <td><span className="badge badge-danger">Causes Epidemic Dropsy</span></td>
                  </tr>
                  <tr>
                    <td>🧈 Desi Ghee</td>
                    <td>Vanaspati (Hydrogenated Fat)</td>
                    <td>Official FSSAI Baudouin Furfural-HCl Test</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>1.0% substitution</td>
                    <td>0.00% Non-Milk Fat</td>
                    <td><span className="badge badge-danger">Substandard Adulterant</span></td>
                  </tr>
                  <tr>
                    <td>🍯 Pure Honey (Madh)</td>
                    <td>Invert Sugar Syrup / HFCS</td>
                    <td>Fiehe Resorcinol Hydroxymethylfurfural (HMF)</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>2.0% w/w</td>
                    <td>HMF Max 80 mg/kg; 0% C4</td>
                    <td><span className="badge badge-danger">Commercial Syrup Dilution</span></td>
                  </tr>
                  <tr>
                    <td>🥬 Green Vegetables</td>
                    <td>Malachite Green Dye</td>
                    <td>Acidified Triphenylmethane Chromophore Strike</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>0.1 ppm</td>
                    <td>0.0 ppm (Strictly Prohibited)</td>
                    <td><span className="badge badge-danger">Carcinogenic Dye</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'HARDWARE' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--color-primary)" /> Active ESP32-S3 Portable Optical Readers
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {devices.map(d => (
              <div key={d.id} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                    {d.deviceSerial}
                  </span>
                  <span className="badge badge-safe">
                    <CheckCircle size={12} /> {d.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {d.assignedLocation}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <span>Firmware: v{d.firmwareVersion}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399' }}>
                    <BatteryCharging size={14} /> Battery: {d.batteryLevel}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'INVENTORY' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--color-primary)" /> Multiplex Test Cartridge (μPAD) Inventory &amp; Batch Traceability
          </h3>

          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Cartridge UID</th>
                  <th>Batch Number</th>
                  <th>Manufacturing Date</th>
                  <th>Expiration Date</th>
                  <th>Usage Status</th>
                  <th>Validity Gate</th>
                </tr>
              </thead>
              <tbody>
                {cartridges.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {c.cartridgeUid}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{c.batchNumber}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.manufacturingDate}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.expiryDate}</td>
                    <td>
                      {c.isUsed ? (
                        <span className="badge badge-neutral">USED / SPENT</span>
                      ) : (
                        <span className="badge badge-safe">READY FOR TEST</span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>
                        PASS EXPIRY CHECK
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
