// InstallPrompt.tsx — gentle "add to home screen" banner shown in the browser
// (never when already installed/standalone). On Android/desktop Chromium it
// captures `beforeinstallprompt` and triggers the real install (→ standalone
// WebAPK). On iOS Safari, which has no programmatic install, it shows the
// Share → Add to Home Screen instruction instead.
import { useEffect, useState } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from './Icon';
import { Mark } from './Brand';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'optisync-install-dismissed';
const DISMISS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isStandalone = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as unknown as { standalone?: boolean }).standalone === true;

const isIOS = (): boolean =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(window as unknown as { MSStream?: unknown }).MSStream;

const recentlyDismissed = (): boolean => {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - t < DISMISS_MS;
  } catch {
    return false;
  }
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    window.addEventListener('appinstalled', onInstalled);

    // Reveal after the app has settled. Android's beforeinstallprompt may land
    // before or after this — either way `show` gates rendering and the
    // `deferred`/`ios` check below decides eligibility.
    const t = setTimeout(() => {
      if (!isStandalone() && !recentlyDismissed()) setShow(true);
    }, 2800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP);
      window.removeEventListener('appinstalled', onInstalled);
      clearTimeout(t);
    };
  }, []);

  // Eligible only when we can actually offer install: a captured prompt
  // (Android/desktop) or iOS Safari (manual instructions).
  if (!show || isStandalone() || (!deferred && !ios)) return null;

  const dismiss = () => {
    haptic();
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  const install = async () => {
    if (!deferred) return;
    haptic();
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* user dismissed */
    }
    setDeferred(null);
    setShow(false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 'calc(86px + env(safe-area-inset-bottom))',
        zIndex: 150,
        animation: 'fadeUp .34s cubic-bezier(.32,.72,0,1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: T.surface,
          border: `1px solid ${T.hairline}`,
          borderRadius: 16,
          padding: '12px 12px 12px 14px',
          boxShadow: '0 12px 32px rgba(27,42,61,0.18), 0 2px 8px rgba(27,42,61,0.10)',
        }}
      >
        <Mark size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink }}>Install OptiSync</div>
          <div
            style={{
              fontSize: 12.5,
              color: T.muted,
              marginTop: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              lineHeight: 1.35,
            }}
          >
            {ios ? (
              <>
                Tap
                <Icon name="share" size={14} color={T.accent} stroke={2} />
                then “Add to Home Screen”
              </>
            ) : (
              'Add to your home screen for the full app'
            )}
          </div>
        </div>
        {!ios && (
          <button
            onClick={install}
            style={{
              flexShrink: 0,
              height: 38,
              padding: '0 16px',
              borderRadius: 11,
              border: 'none',
              background: T.navy,
              color: '#fff',
              fontSize: 14.5,
              fontWeight: 700,
              fontFamily: T.font,
              cursor: 'pointer',
            }}
          >
            Install
          </button>
        )}
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: 9,
            border: 'none',
            background: T.surface2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={16} color={T.muted} />
        </button>
      </div>
    </div>
  );
}
