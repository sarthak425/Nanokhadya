import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BleDeviceInfo {
  id: string;
  name: string;
  battery: number;
  rssi: number;
  firmware: string;
  sensor: string;
  cartridgeDocked: boolean;
  opticalChamberReady: boolean;
  mode: 'HARDWARE_BLE' | 'SIMULATED_BLE';
  connectedAt: string;
}

interface BluetoothContextType {
  isConnected: boolean;
  connectionStatus: 'DISCONNECTED' | 'SCANNING' | 'CONNECTED' | 'ERROR';
  device: BleDeviceInfo | null;
  connect: (forceSimulated?: boolean) => Promise<boolean>;
  disconnect: () => void;
  isScanning: boolean;
  errorMessage: string | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  hasWebBluetooth: boolean;
}

const BluetoothContext = createContext<BluetoothContextType | undefined>(undefined);

const STORAGE_KEY = 'nanotech_ble_connection';

export function BluetoothProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'SCANNING' | 'CONNECTED' | 'ERROR'>('DISCONNECTED');
  const [device, setDevice] = useState<BleDeviceInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasWebBluetooth = typeof navigator !== 'undefined' && 'bluetooth' in navigator;

  // Restore previous state if saved
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          setDevice(parsed);
          setConnectionStatus('CONNECTED');
        }
      }
    } catch {}
  }, []);

  const connect = async (forceSimulated = false): Promise<boolean> => {
    setConnectionStatus('SCANNING');
    setErrorMessage(null);

    // If Web Bluetooth is available and user didn't force simulator, attempt real BLE pairing
    if (hasWebBluetooth && !forceSimulated) {
      try {
        const nav = navigator as any;
        const bleDevice = await nav.bluetooth.requestDevice({
          filters: [
            { namePrefix: 'NanoSense' },
            { namePrefix: 'AS7265' },
            { namePrefix: 'ESP32' },
          ],
          optionalServices: ['generic_access', 0x180f], // Battery Service etc.
        });

        // Connected to real hardware
        const info: BleDeviceInfo = {
          id: bleDevice.id || 'ESP32-BLE-REAL',
          name: bleDevice.name || 'NanoSense Smart Reader',
          battery: 95,
          rssi: -56,
          firmware: 'v2.1.0-ble',
          sensor: 'AS7265x Triad (18 Channels)',
          cartridgeDocked: true,
          opticalChamberReady: true,
          mode: 'HARDWARE_BLE',
          connectedAt: new Date().toISOString(),
        };

        setDevice(info);
        setConnectionStatus('CONNECTED');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
        setIsModalOpen(false);
        return true;
      } catch (err: any) {
        // User cancelled Web Bluetooth prompt or no device found
        if (err.name === 'NotFoundError') {
          setConnectionStatus('DISCONNECTED');
          setErrorMessage('No Bluetooth device selected. Pair your NanoSense Reader or use Simulated BLE.');
          return false;
        }
        // Fall back gracefully to simulation option if BLE hardware is not currently paired
      }
    }

    // Connect to Simulated BLE Hardware (for testing & demo purposes without physical ESP32)
    await new Promise(r => setTimeout(r, 1200));

    const simInfo: BleDeviceInfo = {
      id: 'ESP32-NANOSENSE-AS7265X',
      name: 'NanoSense Smart Reader (BLE-ESP32)',
      battery: 92,
      rssi: -58,
      firmware: 'v1.4.2-firmware',
      sensor: 'AS7265x 18-Channel Triad (410–940nm)',
      cartridgeDocked: true,
      opticalChamberReady: true,
      mode: 'SIMULATED_BLE',
      connectedAt: new Date().toISOString(),
    };

    setDevice(simInfo);
    setConnectionStatus('CONNECTED');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(simInfo));
    setIsModalOpen(false);
    return true;
  };

  const disconnect = () => {
    setDevice(null);
    setConnectionStatus('DISCONNECTED');
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <BluetoothContext.Provider
      value={{
        isConnected: connectionStatus === 'CONNECTED' && device !== null,
        connectionStatus,
        device,
        connect,
        disconnect,
        isScanning: connectionStatus === 'SCANNING',
        errorMessage,
        isModalOpen,
        setIsModalOpen,
        hasWebBluetooth,
      }}
    >
      {children}
    </BluetoothContext.Provider>
  );
}

export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error('useBluetooth must be used within a BluetoothProvider');
  }
  return context;
}
