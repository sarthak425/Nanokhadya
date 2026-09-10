import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  BarChart3, 
  Package, 
  Beaker, 
  Box, 
  Waves, 
  Camera, 
  Globe2,
  Menu,
  X
} from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  connectedDevicesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, connectedDevicesCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleTab = (tab: string) => {
    sound.click();
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: <Activity size={15} /> },
    { key: 'new-test', label: 'Run Test', icon: <Beaker size={15} /> },
    { key: '3d-twin', label: '3D Digital Twin', icon: <Box size={15} color="#60a5fa" /> },
    { key: '3d-spectrum', label: 'LSPR Spectrum', icon: <Waves size={15} color="#34d399" /> },
    { key: 'scanner', label: 'Live Camera', icon: <Camera size={15} color="#fbbf24" /> },
    { key: 'geomap', label: 'Geo-Map', icon: <Globe2 size={15} color="#38bdf8" /> },
    { key: 'history', label: 'History', icon: <Clock size={15} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
    { key: 'inventory', label: 'Hardware', icon: <Package size={15} /> },
  ];

  return (
    <nav style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(6, 9, 19, 0.95)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '10px 16px'
    }}>
      <div style={{
        maxWidth: '1420px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Brand Logo & Gov Badge */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} 
          onClick={() => handleTab('dashboard')}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
            flexShrink: 0
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                NanoKhadya<span style={{ color: '#10b981' }}>-Check</span>
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>SIH 26235</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>
              MoFPI Rapid Food Testing Kit
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile via CSS) */}
        <div className="desktop-nav-links">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleTab(item.key)}
              className={activeTab === item.key ? 'btn-primary' : 'btn-secondary'}
              style={{
                fontSize: '0.8rem',
                padding: '7px 12px',
                borderRadius: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        {/* Right Status & Mobile Hamburger Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="glass-card" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot dot-safe"></span>
            <Cpu size={13} color="var(--text-muted)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-main)', fontWeight: 600 }}>
              ESP32 ({connectedDevicesCount})
            </span>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => { sound.click(); setMobileMenuOpen(prev => !prev); }}
            className="btn-secondary mobile-nav-toggle"
            style={{
              padding: '8px',
              borderRadius: '8px',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Horizontal Touch Scroll Track for Mobile Phones */}
      <div 
        className="nav-scroll-track" 
        style={{ 
          marginTop: '8px', 
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          overflowX: 'auto',
          display: 'flex',
          gap: '6px'
        }}
      >
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => handleTab(item.key)}
            style={{
              fontSize: '0.74rem',
              padding: '5px 10px',
              borderRadius: '6px',
              border: activeTab === item.key ? '1px solid var(--color-primary)' : '1px solid var(--border-subtle)',
              background: activeTab === item.key ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)',
              color: activeTab === item.key ? '#fff' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              flexShrink: 0
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Slide-Down Full Mobile Menu Modal */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '12px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px'
        }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => handleTab(item.key)}
              className={activeTab === item.key ? 'btn-primary' : 'btn-secondary'}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                fontSize: '0.82rem',
                padding: '10px 12px',
                borderRadius: '8px'
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};
