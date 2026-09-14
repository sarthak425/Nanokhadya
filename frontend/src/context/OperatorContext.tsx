/**
 * OperatorContext & Device Authentication
 * 
 * Implements strict "1-Device = 1-User" hardware binding:
 * - Each physical device / client can only register ONE user.
 * - All testing, history, telemetry, and reports are private to that user.
 * - No other user can register or access this device unless authorized unbind occurs.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Operator } from '../services/api';

export interface DeviceUser {
  id: string;
  name: string;
  role: string;
  email?: string;
  pin: string;
  deviceId: string;
  registeredAt: string;
}

interface OperatorContextValue {
  deviceId: string;
  deviceBoundUser: DeviceUser | null;
  isAuthenticated: boolean;
  currentOperator: Operator | null;
  isLoading: boolean;
  userTestCount: number;
  registerDeviceUser: (name: string, role: string, email: string, pin: string) => { success: boolean; error?: string };
  login: (pin: string) => { success: boolean; error?: string };
  logout: () => void;
  unbindDevice: (pin: string) => { success: boolean; error?: string };
  operators: Operator[];
  reloadOperators: () => Promise<void>;
  setCurrentOperator: (op: Operator) => void;
}

const OperatorContext = createContext<OperatorContextValue>({
  deviceId: '',
  deviceBoundUser: null,
  isAuthenticated: false,
  currentOperator: null,
  isLoading: true,
  userTestCount: 0,
  registerDeviceUser: () => ({ success: false }),
  login: () => ({ success: false }),
  logout: () => {},
  unbindDevice: () => ({ success: false }),
  operators: [],
  reloadOperators: async () => {},
  setCurrentOperator: () => {},
});

function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem('nanotech_device_id');
    if (!id) {
      const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      id = `DEV-${p1}-${p2}`;
      localStorage.setItem('nanotech_device_id', id);
    }
    return id;
  } catch {
    return 'DEV-LOCAL-001';
  }
}

function computeUserStats(operatorId: string) {
  try {
    const raw = localStorage.getItem('nanotech_sim_tests');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const matching = list.filter((t: any) => t.operatorId?.toLowerCase() === operatorId.toLowerCase());
        return {
          count: matching.length,
          lastTestAt: matching[0]?.timestamp || null,
        };
      }
    }
  } catch {}
  return { count: 0, lastTestAt: null };
}

export function OperatorProvider({ children }: { children: ReactNode }) {
  const [deviceId] = useState<string>(getOrCreateDeviceId);
  const [deviceBoundUser, setDeviceBoundUser] = useState<DeviceUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<{ count: number; lastTestAt: string | null }>({ count: 0, lastTestAt: null });

  // Initialize from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('nanotech_device_bound_user');
      const storedSession = localStorage.getItem('nanotech_session_auth');

      if (storedUser) {
        const user: DeviceUser = JSON.parse(storedUser);
        setDeviceBoundUser(user);
        setStats(computeUserStats(user.id));
        if (storedSession === 'true') {
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.error('Error loading device user:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for tests saved and update live stats
  useEffect(() => {
    if (!deviceBoundUser?.id) return;
    const updateStats = () => {
      setStats(computeUserStats(deviceBoundUser.id));
    };
    updateStats();
    window.addEventListener('nanotech_test_saved', updateStats);
    return () => window.removeEventListener('nanotech_test_saved', updateStats);
  }, [deviceBoundUser?.id]);

  // Compute currentOperator compatible with existing application pages
  const currentOperator: Operator | null = deviceBoundUser && isAuthenticated ? {
    id: deviceBoundUser.id,
    name: deviceBoundUser.name,
    role: deviceBoundUser.role,
    testCount: stats.count,
    createdAt: deviceBoundUser.registeredAt,
    lastTestAt: stats.lastTestAt,
  } : null;

  // 1. Register Single Device User
  const registerDeviceUser = (name: string, role: string, email: string, pin: string) => {
    if (deviceBoundUser) {
      return {
        success: false,
        error: `Device is already locked to ${deviceBoundUser.name}. Policy allows only 1 user per device.`,
      };
    }

    if (!name.trim() || !pin.trim() || pin.length < 4) {
      return { success: false, error: 'Name and 4+ digit PIN are required.' };
    }

    const cleanId = 'OP-' + name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 16);
    const newUser: DeviceUser = {
      id: cleanId,
      name: name.trim(),
      role: role.trim() || 'Quality Analyst',
      email: email.trim() || undefined,
      pin: pin.trim(),
      deviceId,
      registeredAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('nanotech_device_bound_user', JSON.stringify(newUser));
      localStorage.setItem('nanotech_session_auth', 'true');
      localStorage.setItem('nanotech-operator', newUser.id);
      setDeviceBoundUser(newUser);
      setIsAuthenticated(true);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to save user.' };
    }
  };

  // 2. Login / Unlock Device
  const login = (pin: string) => {
    if (!deviceBoundUser) {
      return { success: false, error: 'No user registered on this device yet.' };
    }
    if (deviceBoundUser.pin !== pin.trim()) {
      return { success: false, error: 'Incorrect Security PIN. Access denied.' };
    }

    try {
      localStorage.setItem('nanotech_session_auth', 'true');
      localStorage.setItem('nanotech-operator', deviceBoundUser.id);
      setIsAuthenticated(true);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to authenticate.' };
    }
  };

  // 3. Logout / Lock Device
  const logout = () => {
    try {
      localStorage.removeItem('nanotech_session_auth');
    } catch {}
    setIsAuthenticated(false);
  };

  // 4. Authorized Device Wipe / Factory Reset
  const unbindDevice = (pin: string) => {
    if (!deviceBoundUser) return { success: true };
    if (deviceBoundUser.pin !== pin.trim()) {
      return { success: false, error: 'Incorrect PIN. Cannot unbind device.' };
    }

    try {
      localStorage.removeItem('nanotech_device_bound_user');
      localStorage.removeItem('nanotech_session_auth');
      localStorage.removeItem('nanotech-operator');
      setDeviceBoundUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to reset device.' };
    }
  };

  const operators = currentOperator ? [currentOperator] : [];
  const reloadOperators = async () => {};
  const setCurrentOperator = () => {};

  return (
    <OperatorContext.Provider
      value={{
        deviceId,
        deviceBoundUser,
        isAuthenticated,
        currentOperator,
        isLoading,
        userTestCount: stats.count,
        registerDeviceUser,
        login,
        logout,
        unbindDevice,
        operators,
        reloadOperators,
        setCurrentOperator,
      }}
    >
      {children}
    </OperatorContext.Provider>
  );
}

export function useOperator() {
  return useContext(OperatorContext);
}
