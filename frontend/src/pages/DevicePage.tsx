import { useEffect, useState } from 'react';
import { getDeviceStatus } from '../services/api';
import { Bluetooth, AlertTriangle, Power } from 'lucide-react';
import { SensorTriad3D } from '../components/SensorTriad3D';
import { MultimodalSensorGrid } from '../components/MultimodalSensorGrid';
import { useBluetooth } from '../context/BluetoothContext';

export function DevicePage() {
  const { isConnected, device, disconnect, isScanning, setIsModalOpen } = useBluetooth();
  const [_status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getDeviceStatus().then(setStatus).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Connection</h1>
          <div className="page-subtitle">AS7265x Triad Sensor Hardware & BLE Management</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setIsModalOpen(true)}>
            <Bluetooth size={14} /> BLE Manager
          </button>
          <button className="btn btn-outline" onClick={load}>Refresh</button>
        </div>
      </div>

      <div className="page-body">
        {loading ? (
          <div className="loading-overlay"><span className="loading-spinner" /> Loading sensor status…</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 3D Sensor Visualizer */}
            <SensorTriad3D />

            <div className="grid-2" style={{ alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">Bluetooth Connection Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isConnected ? (
                        <>
                          <span className="dot blue" />
                          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                            {device?.mode === 'HARDWARE_BLE' ? 'Hardware BLE Linked' : 'Virtual Reader Linked'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="dot red" />
                          <span style={{ fontSize: 12, color: 'var(--adulterated)' }}>Reader Offline</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      ['Connection State', isConnected ? 'CONNECTED' : 'DISCONNECTED'],
                      ['Device Identifier', isConnected ? device?.name : 'None paired'],
                      ['Hardware Link', isConnected ? (device?.mode === 'HARDWARE_BLE' ? 'Web Bluetooth (BLE 5.0)' : 'Simulated BLE Stream') : 'Offline'],
                      ['Sensor Triad', 'AS72651 + AS72652 + AS72653'],
                      ['Wavelength Range', '410 nm – 940 nm (18 Channels)'],
                      ['Optical Chamber', isConnected ? 'LOCKED & CALIBRATED' : 'WAITING FOR READER'],
                      ['Battery / Signal', isConnected ? `${device?.battery}% · ${device?.rssi} dBm` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="mono" style={{ color: isConnected && k === 'Connection State' ? '#10b981' : undefined }}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 16 }}>
                    {isConnected ? (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn btn-outline"
                          style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                          onClick={disconnect}
                        >
                          <Power size={14} /> Disconnect Device
                        </button>
                        <button
                          className="btn btn-primary"
                          style={{ flex: 1 }}
                          onClick={() => setIsModalOpen(true)}
                        >
                          <Bluetooth size={14} /> Manage Link
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        onClick={() => setIsModalOpen(true)}
                        disabled={isScanning}
                      >
                        {isScanning ? (
                          <><span className="loading-spinner" /> Scanning Bluetooth Devices…</>
                        ) : (
                          <><Bluetooth size={16} /> Connect NanoSense Smart Reader (BLE)</>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {!isConnected && (
                  <div className="dev-banner" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fef3c7' }}>
                    <AlertTriangle size={16} color="#f59e0b" />
                    <strong>Hardware Safety Guard:</strong> Without connecting the Bluetooth reader, test execution is disabled to ensure all food adulteration results originate from calibrated sensor readings.
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title mb-4">AS7265x Sensor Specification</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Sensor:</strong> AMS AS7265x Multispectral Chipset</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>ICs:</strong> AS72651 (NIR) + AS72652 (VIS) + AS72653 (UV-VIS)</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Channels:</strong> 18 calibrated optical channels</div>
                  <div><strong style={{ color: 'var(--text-primary)' }}>Range:</strong> 410–940 nm (UV through Near-Infrared)</div>
                  <div style={{ marginTop: 12 }}><strong style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Channel Map</strong></div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, marginTop: 8, color: 'var(--text-muted)', lineHeight: 2 }}>
                    {[
                      'AS72653: 410, 435, 460, 485, 510, 535 nm',
                      'AS72652: 560, 585, 610, 645, 680, 705 nm',
                      'AS72651: 730, 760, 810, 860, 900, 940 nm',
                    ].map(l => <div key={l}>{l}</div>)}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>MCU:</strong> ESP32 via Bluetooth Low Energy (BLE)
                  </div>
                </div>
              </div>
            </div>

            {/* 9 Multimodal Cartridge Sensors Architecture */}
            <MultimodalSensorGrid foodType="Milk" />
          </div>
        )}
      </div>
    </div>
  );
}
