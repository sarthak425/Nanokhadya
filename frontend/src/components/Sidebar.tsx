import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bluetooth, FlaskConical, BarChart3,
  History, Database, Brain, Settings, Sun, Moon, Shield,
  ChevronDown, UserCircle, Plus, X,
} from 'lucide-react';
import { useOperator } from '../context/OperatorContext';

interface SidebarProps {
  isDev: boolean;
  connected: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/device', icon: Bluetooth, label: 'Device' },
  { to: '/test', icon: FlaskConical, label: 'New Test' },
  { to: '/analysis', icon: BarChart3, label: 'Analysis' },
  { to: '/history', icon: History, label: 'Test History' },
  { divider: true, label: 'Data & Models' },
  { to: '/datasets', icon: Database, label: 'Datasets' },
  { to: '/models', icon: Brain, label: 'ML Models' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { divider: true, label: 'Administration' },
  { to: '/admin', icon: Shield, label: 'Admin Panel', badge: 'UNIVERSAL' },
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

export function Sidebar({ isDev, connected, mobileOpen = false, onClose }: SidebarProps) {
  const { currentOperator, operators, setCurrentOperator } = useOperator();
  const [theme, setTheme]         = useState<'dark' | 'light'>(getInitialTheme);
  const [opDropOpen, setOpDropOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { applyTheme(theme); }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
  };

  const statusDot  = isDev ? 'yellow' : connected ? 'blue' : 'red';
  const statusText = isDev ? 'Dev Mode' : connected ? 'BLE Connected' : 'BLE Offline';
  const badgeClass = isDev ? 'development' : 'ble';

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
              <div className="logo-name">Food Safety System</div>
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

        {/* ── Operator Switcher ────────────────────────────── */}
        <div style={{ margin: '12px 12px 8px', position: 'relative' }}>
          <button
            onClick={() => setOpDropOpen(o => !o)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--text-primary)', fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          >
            <UserCircle size={15} color="var(--accent)" />
            <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
              {currentOperator ? currentOperator.name : 'Select Operator…'}
            </span>
            <ChevronDown size={12} color="var(--text-muted)" style={{ transform: opDropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {currentOperator && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 10, fontFamily: 'var(--font-mono)' }}>
              {currentOperator.id}
            </div>
          )}

          {/* Dropdown */}
          {opDropOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              marginTop: 4, overflow: 'hidden',
            }}>
              {operators.length === 0 && (
                <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                  No operators yet.
                </div>
              )}
              {operators.map(op => (
                <button
                  key={op.id}
                  onClick={() => { setCurrentOperator(op); setOpDropOpen(false); }}
                  style={{
                    display: 'flex', flexDirection: 'column', width: '100%', textAlign: 'left',
                    padding: '8px 12px', border: 'none', cursor: 'pointer', gap: 2,
                    background: op.id === currentOperator?.id ? 'var(--accent-dim)' : 'transparent',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{op.name}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{op.id}</span>
                </button>
              ))}
              <div style={{ borderTop: '1px solid var(--border-light)' }}>
                <button
                  onClick={() => { setOpDropOpen(false); onClose?.(); navigate('/admin'); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, width: '100%',
                    padding: '8px 12px', border: 'none', cursor: 'pointer',
                    background: 'transparent', color: 'var(--accent)', fontSize: 12,
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <Plus size={12} /> Manage Operators
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ('divider' in item) {
              return <div key={i} className="nav-section-label">{item.label}</div>;
            }
            const Icon = item.icon!;
            return (
              <NavLink
                key={item.to}
                to={item.to!}
                end={item.to === '/'}
                onClick={() => onClose?.()}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <Icon size={16} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    padding: '1px 5px',
                    borderRadius: 4,
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                  }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className={`source-badge ${badgeClass}`}>
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
