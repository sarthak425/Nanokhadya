import { useState } from 'react';
import { Bluetooth, X, CheckCircle2, AlertTriangle, Cpu, Radio, Zap } from 'lucide-react';
import { useBluetooth } from '../context/BluetoothContext';

export function BluetoothConnectModal() {
  const { isConnected, connectionStatus, device, connect, disconnect, isModalOpen, setIsModalOpen, hasWebBluetooth, errorMessage } = useBluetooth();
  const [connectingMode, setConnectingMode] = useState<'physical' | 'simulated' | null>(null);

  if (!isModalOpen) return null;

  const handlePairPhysical = async () => {
    setConnectingMode('physical');
    await connect(false);
    setConnectingMode(null);
  };

  const handleConnectSimulated = async () => {
    setConnectingMode('simulated');
    await connect(true);
    setConnectingMode(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={() => setIsModalOpen(false)}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--bg-card, #121824)',
          border: '1px solid var(--border, #1e293b)',
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          padding: 0,
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border, #1e293b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(56, 189, 248, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: isConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isConnected ? '#10b981' : '#38bdf8',
            }}>
              <Bluetooth size={22} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #f1f5f9)' }}>
                NanoSense Smart Reader (BLE)
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
                ESP32 + AS7265x Multispectral Sensor Connection
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #64748b)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {errorMessage && (
            <div style={{
              padding: '12px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: 12,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {isConnected && device ? (
            /* Connected State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>
                    Reader Successfully Linked
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary, #94a3b8)' }}>
                    Spectral channels & optical chamber ready for testing
                  </div>
                </div>
                <span className="badge" style={{ background: '#10b981', color: '#000', fontSize: 11, fontWeight: 700 }}>
                  ACTIVE
                </span>
              </div>

              {/* Device Telemetry Table */}
              <div style={{
                background: 'var(--bg-secondary, #0b1120)',
                borderRadius: 10,
                border: '1px solid var(--border, #1e293b)',
                padding: '12px 16px',
                fontSize: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Device Identifier</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{device.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Protocol</span>
                  <span style={{ color: '#38bdf8' }}>{device.mode === 'HARDWARE_BLE' ? 'Physical Web Bluetooth (BLE 5.0)' : 'Virtual Hardware Simulator (BLE Bridge)'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Optical Sensor</span>
                  <span style={{ color: '#f1f5f9' }}>{device.sensor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Chamber Status</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>Calibrated & Closed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                  <span style={{ color: '#94a3b8' }}>Battery / Signal</span>
                  <span style={{ color: '#f1f5f9' }}>{device.battery}% · {device.rssi} dBm</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  className="btn btn-outline"
                  onClick={disconnect}
                  style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                >
                  Disconnect Reader
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Disconnected State */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '14px 16px',
                borderRadius: 10,
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: 12,
                color: '#fef3c7',
                lineHeight: 1.6,
              }}>
                <strong>Hardware Guard Active:</strong> To avoid false mock tests without physical input, data acquisition requires pairing the NanoSense Bluetooth Smart Reader.
              </div>

              {/* Physical Pairing Option */}
              <div style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px solid var(--border, #334155)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Radio size={18} color="#38bdf8" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                      Option 1: Physical ESP32 Hardware (BLE)
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      {hasWebBluetooth ? 'Scan and pair physical ESP32 + AS7265x reader via Web Bluetooth' : 'Web Bluetooth is only supported in Chrome/Edge. Use Option 2 for cross-browser testing.'}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handlePairPhysical}
                  disabled={connectionStatus === 'SCANNING' || !hasWebBluetooth}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {connectingMode === 'physical' ? (
                    <><span className="loading-spinner" /> Scanning Bluetooth Devices…</>
                  ) : (
                    <><Bluetooth size={16} /> Scan for Physical Reader (BLE)</>
                  )}
                </button>
              </div>

              {/* Simulation Bridge Option */}
              <div style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px solid var(--border, #334155)',
                background: 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Cpu size={18} color="#10b981" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
                      Option 2: Virtual Hardware Reader (Dev / Demo Mode)
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>
                      Simulates the 18-channel AS7265x BLE packets for hackathon demonstrations without physical hardware
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-outline"
                  onClick={handleConnectSimulated}
                  disabled={connectionStatus === 'SCANNING'}
                  style={{ width: '100%', borderColor: '#10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {connectingMode === 'simulated' ? (
                    <><span className="loading-spinner" /> Establishing BLE Link…</>
                  ) : (
                    <><Zap size={16} /> Connect Virtual Smart Reader</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
