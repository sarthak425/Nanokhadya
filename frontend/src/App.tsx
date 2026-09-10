import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { NewTestRunner } from './components/NewTestRunner';
import { TestResultView } from './components/TestResultView';
import { HistoryView } from './components/HistoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { DeviceCartridgeView } from './components/DeviceCartridgeView';
import { Cartridge3DViewer } from './components/Cartridge3DViewer';
import { Plasmonic3DSpectrum } from './components/Plasmonic3DSpectrum';
import { LiveCameraScanner } from './components/LiveCameraScanner';
import { NationalGeoMapView } from './components/NationalGeoMapView';
import { INITIAL_TEST_SESSIONS, INITIAL_DEVICES, INITIAL_CARTRIDGES } from './mockData';
import { TestSessionRecord } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sessions, setSessions] = useState<TestSessionRecord[]>(INITIAL_TEST_SESSIONS);
  const [devices] = useState(INITIAL_DEVICES);
  const [cartridges] = useState(INITIAL_CARTRIDGES);
  const [selectedTest, setSelectedTest] = useState<TestSessionRecord | null>(null);

  const handleSelectTest = (test: TestSessionRecord) => {
    setSelectedTest(test);
    setActiveTab('result');
  };

  const handleCompleteTest = (newRecord: TestSessionRecord) => {
    setSessions(prev => [newRecord, ...prev]);
    setSelectedTest(newRecord);
    setActiveTab('result');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectedDevicesCount={devices.filter(d => d.status === 'ACTIVE').length}
      />

      <main className="layout-container" style={{ flex: 1, paddingBottom: '60px' }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            sessions={sessions}
            devices={devices}
            onSelectTest={handleSelectTest}
            onLaunchNewTest={() => setActiveTab('new-test')}
          />
        )}

        {activeTab === 'new-test' && (
          <NewTestRunner
            onCompleteTest={handleCompleteTest}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === '3d-twin' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Cartridge3DViewer />
          </div>
        )}

        {activeTab === '3d-spectrum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Plasmonic3DSpectrum />
          </div>
        )}

        {activeTab === 'scanner' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <LiveCameraScanner
              onScanComplete={handleCompleteTest}
            />
          </div>
        )}

        {activeTab === 'result' && selectedTest && (
          <TestResultView
            test={selectedTest}
            onBack={() => setActiveTab('dashboard')}
            onNewTest={() => setActiveTab('new-test')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={sessions}
            onSelectTest={handleSelectTest}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            sessions={sessions}
            onOpenGeoMap={() => setActiveTab('geomap')}
          />
        )}

        {activeTab === 'geomap' && (
          <NationalGeoMapView />
        )}

        {activeTab === 'inventory' && (
          <DeviceCartridgeView
            devices={devices}
            cartridges={cartridges}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        background: 'rgba(6, 9, 19, 0.95)'
      }}>
        <div style={{ maxWidth: '1420px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <strong>NanoKhadya-Check v1.0</strong> | Developed for Smart India Hackathon (SIH PS 26235)
          </div>
          <div>
            Ministry of Food Processing Industries (MoFPI) | Hardware Category | Agriculture &amp; FoodTech
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
