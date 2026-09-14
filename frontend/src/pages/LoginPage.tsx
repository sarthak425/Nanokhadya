import React, { useState } from 'react';
import { Shield, Lock, Smartphone, CheckCircle, AlertTriangle, KeyRound, Eye, EyeOff, UserCheck, RefreshCw } from 'lucide-react';
import { useOperator } from '../context/OperatorContext';

export function LoginPage() {
  const {
    deviceId,
    deviceBoundUser,
    registerDeviceUser,
    login,
    unbindDevice,
    userTestCount,
  } = useOperator();

  // Registration state
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('Quality Analyst');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regPinConfirm, setRegPinConfirm] = useState('');

  // Login state
  const [loginPin, setLoginPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Unbind modal state
  const [showUnbindModal, setShowUnbindModal] = useState(false);
  const [unbindPin, setUnbindPin] = useState('');
  const [unbindError, setUnbindError] = useState<string | null>(null);

  // Handle Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regPin || regPin.length < 4) {
      setError('Security PIN must be at least 4 digits.');
      return;
    }
    if (regPin !== regPinConfirm) {
      setError('PIN numbers do not match.');
      return;
    }

    const res = registerDeviceUser(regName, regRole, regEmail, regPin);
    if (!res.success) {
      setError(res.error || 'Failed to bind device to user.');
    }
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginPin) {
      setError('Please enter your security PIN.');
      return;
    }

    const res = login(loginPin);
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
    }
  };

  // Handle Unbind / Reset Device
  const handleUnbind = (e: React.FormEvent) => {
    e.preventDefault();
    setUnbindError(null);

    const res = unbindDevice(unbindPin);
    if (res.success) {
      setShowUnbindModal(false);
      setUnbindPin('');
      setError(null);
    } else {
      setUnbindError(res.error || 'Failed to unbind device.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at 50% 10%, #0f172a 0%, #020617 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
      color: '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background ambient lighting effects */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(56, 189, 248, 0.15)',
        padding: '32px 28px',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(14, 165, 233, 0.4) 100%)',
            border: '1px solid #38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.35)',
          }}>
            <Shield size={28} color="#38bdf8" />
          </div>

          <h1 style={{
            fontSize: '22px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0,
            background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NanoTech Food Safety
          </h1>

          {/* Device ID Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            marginTop: '10px',
            borderRadius: '20px',
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#7dd3fc',
          }}>
            <Smartphone size={12} />
            <span>Hardware ID: {deviceId}</span>
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <div style={{
            marginBottom: '18px',
            padding: '10px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* SCENARIO A: Device Already Bound to User -> Show Login Flow */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {deviceBoundUser ? (
          <div>
            {/* Bound User Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                color: '#ffffff',
                border: '2px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 0 14px rgba(56, 189, 248, 0.3)',
              }}>
                {deviceBoundUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {deviceBoundUser.name}
                </div>
                <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 500, marginTop: '2px' }}>
                  {deviceBoundUser.role} · <span className="mono" style={{ color: '#94a3b8' }}>{deviceBoundUser.id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: '#10b981', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={11} /> Bound User
                  </span>
                  <span style={{ color: '#64748b' }}>•</span>
                  <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                    {userTestCount} inspection record{userTestCount !== 1 ? 's' : ''} saved
                  </span>
                </div>
              </div>
            </div>

            {/* Same User Data Assurance Notice */}
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              lineHeight: 1.45,
              marginBottom: '18px',
              padding: '10px 12px',
              background: 'rgba(56, 189, 248, 0.05)',
              borderRadius: '10px',
              borderLeft: '3px solid #38bdf8',
            }}>
              <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 2 }}>
                Welcome back, {deviceBoundUser.name}!
              </div>
              <div>
                All <strong>{userTestCount}</strong> previous food test records and dashboard metrics belong to your profile and will be restored immediately upon entering your PIN.
              </div>
            </div>

            {/* Unlock Form */}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                  Enter Security PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength={8}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '18px',
                      letterSpacing: showPin ? '2px' : '4px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                  >
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Lock size={16} />
                <span>Unlock Terminal</span>
              </button>
            </form>

            {/* Unbind Device Option */}
            <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setShowUnbindModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'underline',
                }}
              >
                <RefreshCw size={11} />
                <span>Transfer or Reset Device Ownership</span>
              </button>
            </div>
          </div>
        ) : (
          /* ═════════════════════════════════════════════════════════════ */
          /* SCENARIO B: Fresh Device -> Single Operator Registration    */
          /* ═════════════════════════════════════════════════════════════ */
          <div>
            <div style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '20px',
              fontSize: '11px',
              color: '#bae6fd',
              lineHeight: 1.45,
            }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={14} />
                <span>Device Initial Binding Setup</span>
              </div>
              Only <strong>ONE user</strong> can be bound to this device. All food testing results (Milk, Honey, Paneer) will be privately tied to your account.
            </div>

            <form onSubmit={handleRegister}>
              {/* Full Name */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Operator Full Name *
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Sarthak Khatpe"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Role */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Inspector Role / Designation
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: '#0f172a',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                >
                  <option value="Quality Analyst">Quality Analyst</option>
                  <option value="Senior Food Inspector">Senior Food Inspector</option>
                  <option value="Laboratory Chemist">Laboratory Chemist</option>
                  <option value="Field Safety Officer">Field Safety Officer</option>
                  <option value="Plant QA Manager">Plant QA Manager</option>
                </select>
              </div>

              {/* Email/Mobile (optional) */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Contact (Email or Mobile)
                </label>
                <input
                  type="text"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. analyst@nanotech.lab"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    borderRadius: '10px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              {/* PIN and Confirm PIN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Security PIN *
                  </label>
                  <input
                    type="password"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="4 digits"
                    maxLength={6}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '15px',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Confirm PIN *
                  </label>
                  <input
                    type="password"
                    value={regPinConfirm}
                    onChange={(e) => setRegPinConfirm(e.target.value)}
                    placeholder="Confirm"
                    maxLength={6}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '15px',
                      fontFamily: 'monospace',
                      letterSpacing: '2px',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  border: '1px solid #38bdf8',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
                }}
              >
                <KeyRound size={16} />
                <span>Register & Bind Device</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ── Factory Reset / Unbind Modal ────────────────────────────── */}
      {showUnbindModal && deviceBoundUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '18px',
            maxWidth: '380px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', marginBottom: '12px' }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700 }}>Reset Device Ownership</h3>
            </div>

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 16px' }}>
              This will unbind <strong>{deviceBoundUser.name}</strong> from this hardware terminal. To confirm, enter your current Security PIN.
            </p>

            {unbindError && (
              <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontSize: '11px', marginBottom: '12px' }}>
                {unbindError}
              </div>
            )}

            <form onSubmit={handleUnbind}>
              <input
                type="password"
                placeholder="Enter current PIN"
                value={unbindPin}
                onChange={(e) => setUnbindPin(e.target.value)}
                maxLength={8}
                autoFocus
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(2, 6, 23, 0.9)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontFamily: 'monospace',
                  letterSpacing: '2px',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  outline: 'none',
                }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setShowUnbindModal(false); setUnbindError(null); }}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid #334155',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#dc2626',
                    border: '1px solid #ef4444',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
