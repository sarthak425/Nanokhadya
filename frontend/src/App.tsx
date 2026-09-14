import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { MobileHeader, MobileBottomBar } from './components/MobileNav';
import { DashboardPage } from './pages/DashboardPage';
import { DevicePage } from './pages/DevicePage';
import { NewTestPage } from './pages/NewTestPage';
import { TestDetailPage } from './pages/TestDetailPage';
import { DatasetPage } from './pages/DatasetPage';
import { HistoryPage } from './pages/HistoryPage';
import { ModelPage } from './pages/ModelPage';
import { AdminPage } from './pages/AdminPage';
import { getSystemStatus } from './services/api';
import { OperatorProvider } from './context/OperatorContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function SettingsPage() {
  return (
    <div>
      <div className="page-header"><h1 className="page-title">Settings</h1></div>
      <div className="page-body">
        <div className="card">
          <div className="card-title mb-4">Data Source Configuration</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            To switch between Development and BLE mode, set the <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>DATA_SOURCE</code> environment variable in the backend <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: 4 }}>.env</code> file:
          </p>
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, fontFamily: 'var(--font-mono)', fontSize: 12, border: '1px solid var(--border)', color: 'var(--text-secondary)', overflowX: 'auto' }}>
            <div style={{ color: '#8b949e' }}># Development mode (no hardware needed)</div>
            <div style={{ color: '#3fb950' }}>DATA_SOURCE=DEVELOPMENT</div>
            <div style={{ marginTop: 8, color: '#8b949e' }}># Real AS7265x + ESP32 via BLE</div>
            <div style={{ color: '#388bfd' }}>DATA_SOURCE=BLE</div>
          </div>
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 12 }}>
            After changing, restart the backend. The BLE UUIDs must match your ESP32 firmware — update them in .env when firmware is finalized.
          </p>
        </div>
      </div>
    </div>
  );
}


export default function App() {
  const [isDev, setIsDev] = useState(true);
  const [connected, setConnected] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('nanotech-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return 'dark';
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('nanotech-theme', next); } catch {}
  };

  useEffect(() => {
    getSystemStatus()
      .then(s => { setIsDev(s.isDevelopmentMode); setConnected(s.sensorConnected); })
      .catch(() => {});
  }, []);

  return (
    <ErrorBoundary>
      <OperatorProvider>
        <BrowserRouter>
          <div className="app-layout">
            {/* Mobile Top Bar */}
            <MobileHeader
              isDev={isDev}
              connected={connected}
              onToggleDrawer={() => setMobileDrawerOpen(o => !o)}
              drawerOpen={mobileDrawerOpen}
              theme={theme}
              onToggleTheme={toggleTheme}
            />

            {/* Sidebar Navigation */}
            <Sidebar
              isDev={isDev}
              connected={connected}
              mobileOpen={mobileDrawerOpen}
              onClose={() => setMobileDrawerOpen(false)}
            />

            {/* Main Application Content */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/device" element={<DevicePage />} />
                <Route path="/test" element={<NewTestPage />} />
                <Route path="/test/:testId" element={<TestDetailPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/datasets" element={<DatasetPage />} />
                <Route path="/models" element={<ModelPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomBar
              onToggleMore={() => setMobileDrawerOpen(o => !o)}
            />
          </div>
        </BrowserRouter>
      </OperatorProvider>
    </ErrorBoundary>
  );
}
