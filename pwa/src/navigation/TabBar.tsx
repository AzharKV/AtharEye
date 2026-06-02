// TabBar.tsx — bottom tab bar: Projects · Reports · [Scan] · Settings.
// Center Scan is the emphasized teal action. Ported from design-source/app/app-nav.jsx.
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';

export type TabName = 'Projects' | 'Reports' | 'Settings';

export function TabBar({
  active,
  onTab,
  onScan,
}: {
  active: TabName;
  onTab: (name: TabName) => void;
  onScan: () => void;
}) {
  const item = (name: TabName, icon: IconName) => {
    const on = active === name;
    return (
      <button
        onClick={() => {
          haptic();
          onTab(name);
        }}
        style={{
          flex: 1,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          padding: '9px 0 0',
          color: on ? T.accent : T.muted,
        }}
      >
        <Icon name={icon} size={25} stroke={on ? 2.3 : 2} />
        <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, letterSpacing: -0.1 }}>{name}</span>
      </button>
    );
  };
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        padding: '0 6px 24px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        background: 'rgba(12,15,18,0.82)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)',
        borderTop: `1px solid ${T.hairline}`,
      }}
    >
      {item('Projects', 'projects')}
      {item('Reports', 'reports')}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => {
            haptic();
            onScan();
          }}
          style={{
            marginTop: -16,
            width: 58,
            height: 58,
            borderRadius: 19,
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(160deg, ${T.accent2}, ${T.accentPress})`,
            boxShadow: '0 6px 20px rgba(20,184,192,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.onAccent,
          }}
        >
          <Icon name="scan" size={27} stroke={2.4} color={T.onAccent} />
        </button>
      </div>
      {item('Settings', 'settings')}
    </div>
  );
}
