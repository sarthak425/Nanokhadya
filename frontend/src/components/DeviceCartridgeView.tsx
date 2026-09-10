import React from 'react';
import { DeviceInfo, CartridgeInfo } from '../types';
import { Cpu, Package, CheckCircle, BatteryCharging, AlertTriangle, ShieldAlert } from 'lucide-react';

interface DeviceCartridgeViewProps {
  devices: DeviceInfo[];
  cartridges: CartridgeInfo[];
}

export const DeviceCartridgeView: React.FC<DeviceCartridgeViewProps> = ({ devices, cartridges }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Devices Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={20} color="var(--color-primary)" /> Registered ESP32-S3 Portable Optical Readers
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

      {/* Cartridge Inventory Section */}
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
    </div>
  );
};
