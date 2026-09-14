import { useEffect, useState } from 'react';
import { getDeviceStatus, connectDevice } from '../services/api';
import { Bluetooth, Activity } from 'lucide-react';
import { SensorTriad3D } from '../components/SensorTriad3D';

export function DevicePage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const load = () => {
    setLoading(true);
    getDeviceStatus().then(setStatus).catch(() => {}).finally(() => setLoading(false));
  };

  const handleConnect = async () => {
    setConnecting(true);
    try { const r = await connectDevice(); setStatus(r); } catch {}
    finally { setConnecting(false); }
  };

  useEffect(() => { load(); }, []);

  const info = status?.deviceInfo ?? {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Connection</h1>
          <div className="page-subtitle">AS7265x Triad Sensor Hardware & BLE Management</div>
        </div>
        <button className="btn btn-outline" onClick={load}>Refresh</button>
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
                    <div className="card-title">Connection Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {status?.isDevelopmentMode ? (
                        <>
                          <span className="dot yellow" />
                          <span style={{ fontSize: 12, color: 'var(--suspected)' }}>Dev Mode</span>
                        </>
                      ) : status?.connected ? (
                        <>
                          <span className="dot blue" />
                          <span style={{ fontSize: 12, color: 'var(--accent)' }}>Connected</span>
                        </>
                      ) : (
                        <>
                          <span className="dot red" />
                          <span style={{ fontSize: 12, color: 'var(--adulterated)' }}>Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      ['Source Type', status?.sourceType],
                      ['Device ID', info.device_id ?? '—'],
                      ['Sensor', info.sensor_type ?? 'AS7265x'],
                      ['Channels', `${info.channel_count ?? 18} channels`],
                      ['Wavelength Range', info.wavelength_range ?? '410–940 nm'],
                      ['Firmware', info.firmware_version ?? '—'],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="mono">{v}</span>
                      </div>
                    ))}
                  </div>

                  {status?.sourceType === 'BLE' && !status?.connected && (
                    <button
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 16 }}
                      onClick={handleConnect}
                      disabled={connecting}
                    >
                      {connecting
                        ? <><span className="loading-spinner" /> Scanning…</>
                        : <><Bluetooth size={15} /> Connect to ESP32</>
                      }
                    </button>
                  )}
                </div>

                {info.warning && (
                  <div className="dev-banner">
                    <Activity size={14} />
                    {info.warning as string}
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
          </div>
        )}
      </div>
    </div>
  );
}
