import { NavLink } from 'react-router-dom';
import {
  Menu, X, Sun, Moon, LayoutDashboard, FlaskConical,
  History, Bluetooth, MoreHorizontal, User
} from 'lucide-react';
import { useOperator } from '../context/OperatorContext';

interface MobileHeaderProps {
  isDev: boolean;
  connected: boolean;
  onToggleDrawer: () => void;
  drawerOpen: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function MobileHeader({
  isDev,
  connected,
  onToggleDrawer,
  drawerOpen,
  theme,
  onToggleTheme,
}: MobileHeaderProps) {
  const { currentOperator } = useOperator();
  const statusDot = isDev ? 'yellow' : connected ? 'blue' : 'red';
  const statusText = isDev ? 'Dev' : connected ? 'BLE' : 'Off';

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
        <span className="mobile-header-subtitle">Food Safety</span>
        <span className="mobile-status-pill">
          <span className={`dot ${statusDot}`} />
          {statusText}
        </span>
      </div>

      <div className="mobile-header-actions">
        {currentOperator && (
          <div className="mobile-operator-pill" title={`Operator: ${currentOperator.name}`}>
            <User size={12} />
            <span className="mobile-op-name">{currentOperator.name.split(' ')[0]}</span>
          </div>
        )}

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
  return (
    <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/history"
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <History size={20} />
        <span>History</span>
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
        <span>New Test</span>
      </NavLink>

      <NavLink
        to="/device"
        className={({ isActive }) => `mobile-bottom-item${isActive ? ' active' : ''}`}
      >
        <Bluetooth size={20} />
        <span>Device</span>
      </NavLink>

      <button
        className="mobile-bottom-item"
        onClick={onToggleMore}
        aria-label="More Navigation Options"
      >
        <MoreHorizontal size={20} />
        <span>More</span>
      </button>
    </nav>
  );
}
