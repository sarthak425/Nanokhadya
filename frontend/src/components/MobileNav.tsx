import { NavLink } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, LayoutDashboard, FlaskConical,
  MoreHorizontal, User, MapPin, GitCompare
} from 'lucide-react';
import { useOperator } from '../context/OperatorContext';
import { useBluetooth } from '../context/BluetoothContext';
import { useLanguage } from '../context/LanguageContext';
import { PWAInstallButton } from './PWAInstallPrompt';

interface MobileHeaderProps {
  isDev: boolean;
  connected: boolean;
  onToggleDrawer: () => void;
  drawerOpen: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function MobileHeader({
  isDev: _isDev,
  connected: _connected,
  onToggleDrawer,
  drawerOpen,
  theme,
  onToggleTheme,
}: MobileHeaderProps) {
  const { currentOperator } = useOperator();
  const { isConnected, setIsModalOpen } = useBluetooth();
  const { locale, setLocale, speakText } = useLanguage();
  const statusDot = isConnected ? 'blue' : 'red';
  const statusText = isConnected ? 'BLE' : 'Off';

  const toggleLanguage = () => {
    const next = locale === 'en' ? 'hi' : 'en';
    setLocale(next);
    if (next === 'hi') {
      speakText('हिंदी भाषा सक्रिय।', 'hi');
    } else {
      speakText('English language active.', 'en');
    }
  };

  return (
    <header className="mobile-header">
      <button
        className="mobile-icon-btn"
        onClick={onToggleDrawer}
        aria-label={drawerOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
        id="mobile-menu-btn"
      >
        {drawerOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="mobile-header-brand">
        <span className="mobile-header-title">NanoTech</span>
        <span className="mobile-header-subtitle">{locale === 'hi' ? 'खाद्य सुरक्षा' : 'Food Safety'}</span>
        <span
          className="mobile-status-pill"
          style={{ cursor: 'pointer' }}
          onClick={() => setIsModalOpen(true)}
          title="Manage Bluetooth reader"
        >
          <span className={`dot ${statusDot}`} />
          {statusText}
        </span>
      </div>

      <div className="mobile-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Language switch button */}
        <button
          onClick={toggleLanguage}
          style={{
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Switch language (EN / हिन्दी)"
        >
          {locale === 'en' ? 'हिन्दी' : 'EN'}
        </button>

        {currentOperator && (
          <div className="mobile-operator-pill" title={`Operator: ${currentOperator.name}`}>
            <User size={12} />
            <span className="mobile-op-name">{currentOperator.name.split(' ')[0]}</span>
          </div>
        )}

        <PWAInstallButton />

        <button
          className="mobile-icon-btn"
          onClick={onToggleTheme}
          aria-label="Toggle Dark/Light theme"
          id="mobile-theme-btn"
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    </header>
  );
}

interface MobileBottomBarProps {
  onToggleMore: () => void;
}

export function MobileBottomBar({ onToggleMore }: MobileBottomBarProps) {
  const { locale } = useLanguage();
  const isHi = locale === 'hi';

  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <LayoutDashboard size={19} />
        <span>{isHi ? 'होम' : 'Home'}</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <MapPin size={19} />
        <span>{isHi ? 'मैप' : 'Map'}</span>
      </NavLink>

      {/* Prominent Center Action for New Test */}
      <NavLink
        to="/test"
        className={({ isActive }) => `mobile-bottom-item primary-action${isActive ? ' active' : ''}`}
        aria-label="Run New Test"
      >
        <div className="action-circle">
          <FlaskConical size={20} />
        </div>
        <span>{isHi ? 'टेस्ट' : 'Test'}</span>
      </NavLink>

      <NavLink
        to="/comparator"
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <GitCompare size={19} />
        <span>{isHi ? 'तुलना' : 'Compare'}</span>
      </NavLink>

      <button
        className="mobile-bottom-item"
        onClick={onToggleMore}
        aria-label="More Navigation Options"
      >
        <MoreHorizontal size={19} />
        <span>{isHi ? 'और' : 'More'}</span>
      </button>
    </nav>
  );
}

