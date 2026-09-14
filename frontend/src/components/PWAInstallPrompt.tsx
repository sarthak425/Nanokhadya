import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed standalone app
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleMobile);

    // Check if dismissed recently (within 24h)
    const lastDismissed = localStorage.getItem('nanotech_pwa_dismissed');
    const isRecentlyDismissed = lastDismissed && Date.now() - parseInt(lastDismissed, 10) < 86400000;

    // Listen for Chrome/Android beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isRecentlyDismissed) {
        // Small delay to feel smooth after page load
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Also auto-show iOS helper if on iOS mobile and not recently dismissed
    if (isAppleMobile && !isRecentlyDismissed && !isRunningStandalone) {
      setTimeout(() => setShowPrompt(true), 3500);
    }

    // App was successfully installed
    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstalledSuccessfully(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      localStorage.setItem('nanotech_pwa_dismissed', Date.now().toString());
    } catch {}
  };

  // If already running standalone or installed, don't show
  if (isStandalone || installedSuccessfully) return null;
  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      right: '16px',
      maxWidth: '440px',
      margin: '0 auto',
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(56, 189, 248, 0.2)',
      padding: '16px 18px',
      animation: 'slideUpBounce 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* App Icon preview */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #0b1120 0%, #1e293b 100%)',
          border: '1px solid #38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)',
          flexShrink: 0,
        }}>
          <img src="/icon-192.png" alt="NanoTech" style={{ width: 36, height: 36, borderRadius: 8 }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>
              Install NanoTech App
            </div>
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: '4px',
              }}
              title="Dismiss"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 1.4 }}>
            {isIOS ? (
              <span>Add icon directly to your phone screen for full-screen testing like a native app.</span>
            ) : (
              <span>Add shortcut icon directly to your phone home screen like Instagram!</span>
            )}
          </div>

          {/* iOS Safari instructions */}
          {isIOS ? (
            <div style={{
              marginTop: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: 11,
              color: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <Share size={14} color="#38bdf8" />
              <span>Tap <strong>Share (⎋)</strong> then select <strong>'Add to Home Screen' (➕)</strong></span>
            </div>
          ) : (
            /* Android / Chrome One-Tap Install */
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={handleInstallClick}
                style={{
                  flex: 1,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
                }}
              >
                <Download size={14} /> Install on Phone
              </button>
              <button
                className="btn btn-outline"
                onClick={handleDismiss}
                style={{
                  padding: '8px 12px',
                  fontSize: 12,
                  borderColor: '#334155',
                  color: '#94a3b8',
                }}
              >
                Later
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUpBounce {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Small standalone button that can be embedded anywhere (Header, Sidebar)
 * so users can trigger the install anytime if they previously dismissed the popup.
 */
export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isRunningStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (isStandalone) return null;

  const triggerInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
    } else {
      // If iOS or prompt already handled
      alert("To install on your phone:\n• iPhone: Tap the Share icon (⎋) and choose 'Add to Home Screen'\n• Android: Tap the 3 dots (⋮) in Chrome and select 'Install app'");
    }
  };

  return (
    <button
      onClick={triggerInstall}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 8,
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        color: '#38bdf8',
        fontSize: 11,
        fontWeight: 600,
        cursor: 'pointer',
      }}
      title="Install App Shortcut to Mobile Home Screen"
    >
      <Smartphone size={13} />
      <span>Install App</span>
    </button>
  );
}
