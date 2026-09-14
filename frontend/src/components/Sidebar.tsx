import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Bluetooth, FlaskConical,
  History, Database, Brain, Settings, Sun, Moon,
  LogOut, X, MapPin, GitCompare, Volume2, VolumeX
} from 'lucide-react';
import { useOperator } from '../context/OperatorContext';
import { useBluetooth } from '../context/BluetoothContext';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallPrompt';

interface SidebarProps {
  isDev: boolean;
  connected: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  to?: string;
  icon?: any;
  label: string;
  labelHi?: string;
  divider?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड' },
  { to: '/test', icon: FlaskConical, label: 'New Test', labelHi: 'नया परीक्षण' },
  { to: '/map', icon: MapPin, label: 'Field Heatmap', labelHi: 'क्षेत्रीय मैप', badge: 'RADAR' },
  { to: '/comparator', icon: GitCompare, label: 'Purity Comparator', labelHi: 'शुद्धता तुलना', badge: 'NEW' },
  { to: '/history', icon: History, label: 'Test History', labelHi: 'जांच इतिहास' },
  { to: '/device', icon: Bluetooth, label: 'Device', labelHi: 'डिवाइस' },
  { divider: true, label: 'Data & Models', labelHi: 'डेटा और एआई' },
  { to: '/datasets', icon: Database, label: 'Datasets', labelHi: 'डेटासेट' },
  { to: '/models', icon: Brain, label: 'ML Models', labelHi: 'एआई मॉडल' },
  { to: '/settings', icon: Settings, label: 'Settings', labelHi: 'सेटिंग्स' },
];

// ── Theme persistence ────────────────────────────────────────────────
function getInitialTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem('nanotech-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

function applyTheme(theme: 'dark' | 'light') {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  try { localStorage.setItem('nanotech-theme', theme); } catch {}
}

export function Sidebar({ isDev: _isDev, connected: _connected, mobileOpen = false, onClose }: SidebarProps) {
  const { currentOperator, logout, deviceId } = useOperator();
  const { isConnected, setIsModalOpen, device } = useBluetooth();
  const { locale, setLocale, voiceEnabled, setVoiceEnabled, speakText } = useLanguage();
  const [theme, setTheme]         = useState<'dark' | 'light'>(getInitialTheme);
  const isHi = locale === 'hi';

  useEffect(() => { applyTheme(theme); }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  const toggleLanguage = (lang: 'en' | 'hi') => {
    setLocale(lang);
    if (lang === 'hi') {
      speakText('हिंदी भाषा सक्रिय की गई है।', 'hi');
    } else {
      speakText('English language activated.', 'en');
    }
  };

  const statusDot  = isConnected ? 'blue' : 'red';
  const statusText = isConnected ? (device?.mode === 'HARDWARE_BLE' ? 'BLE Hardware' : 'BLE Connected') : 'BLE Disconnected';
  const badgeClass = isConnected ? 'ble' : 'development';

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="logo-mark">NanoTech</div>
              <div className="logo-name">{isHi ? 'खाद्य सुरक्षा प्रणाली' : 'Food Safety System'}</div>
              <div className="logo-sub">AS7265x · 18-Channel · PCA+SVM</div>
            </div>
            {/* Mobile close button */}
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Bound Operator Profile Card ────────────────────────────── */}
        <div style={{
          margin: '12px 12px 8px',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}>
              {currentOperator ? currentOperator.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentOperator ? currentOperator.name : 'Device Operator'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 500 }}>
                {currentOperator?.role || 'Quality Analyst'}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            paddingTop: 6,
            marginTop: 2,
          }}>
            <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              🔒 {deviceId}
            </span>
            <button
              onClick={() => { logout(); onClose?.(); }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f87171',
                fontSize: 10,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 4px',
                fontWeight: 600,
              }}
              title="Lock Terminal"
            >
              <LogOut size={11} /> Lock
            </button>
          </div>
        </div>

        {/* ── Language & Audio Bar ────────────────────────────── */}
        <div style={{
          margin: '0 12px 10px',
          padding: '6px 8px',
          borderRadius: 8,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 6,
        }}>
          {/* Language Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 6, padding: 2, border: '1px solid var(--border)' }}>
            <button
              onClick={() => toggleLanguage('en')}
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                border: 'none',
                background: locale === 'en' ? 'var(--accent)' : 'transparent',
                color: locale === 'en' ? '#fff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: locale === 'en' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              EN
            </button>
            <button
              onClick={() => toggleLanguage('hi')}
              style={{
                padding: '3px 8px',
                borderRadius: 4,
                border: 'none',
                background: locale === 'hi' ? 'var(--accent)' : 'transparent',
                color: locale === 'hi' ? '#fff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: locale === 'hi' ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              हिन्दी
            </button>
          </div>

          {/* Voice Audio Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: voiceEnabled ? 'rgba(56, 139, 253, 0.12)' : 'transparent',
              color: voiceEnabled ? '#58a6ff' : 'var(--text-muted)',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title={voiceEnabled ? 'Voice readouts enabled' : 'Voice readouts muted'}
          >
            {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{voiceEnabled ? (isHi ? 'आवाज चालू' : 'Voice On') : (isHi ? 'म्यूट' : 'Mute')}</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('divider' in item) {
              return <div key={i} className="nav-section-label">{isHi && item.labelHi ? item.labelHi : item.label}</div>;
            }
            const Icon = item.icon!;
            const displayLabel = isHi && item.labelHi ? item.labelHi : item.label;
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === '/'}
                onClick={() => onClose?.()}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{displayLabel}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: item.badge === 'RADAR' ? 'rgba(56, 189, 248, 0.2)' : 'var(--accent-dim)',
                    color: item.badge === 'RADAR' ? '#38bdf8' : 'var(--accent)',
                    border: item.badge === 'RADAR' ? '1px solid rgba(56, 189, 248, 0.3)' : 'none',
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
            <PWAInstallButton />
          </div>

          <div
            className={`source-badge ${badgeClass}`}
            onClick={() => setIsModalOpen(true)}
            style={{ cursor: 'pointer' }}
            title="Click to manage Bluetooth connection"
          >
            <span className={`dot ${statusDot}`} />
            {statusText}
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            id="theme-toggle-btn"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <span className={`theme-toggle-track${theme === 'light' ? ' active' : ''}`}>
              <span className="theme-toggle-thumb" />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
