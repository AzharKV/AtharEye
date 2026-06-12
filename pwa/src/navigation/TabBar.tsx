// Bottom tab bar: Projects · Reports · [Scan] · Account. Centre Scan is the teal hero action.
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';

export type TabName = 'Projects' | 'Reports' | 'Account';

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
          color: on ? T.navy : T.muted,
        }}
      >
        <Icon name={icon} size={24} stroke={on ? 2.3 : 2} />
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
        padding: '0 6px 20px',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,0.86)',
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
          aria-label="New scan"
          style={{
            marginTop: -16,
            width: 56,
            height: 56,
            borderRadius: 18,
            border: 'none',
            cursor: 'pointer',
            background: `linear-gradient(160deg, ${T.accent2}, ${T.teal})`,
            boxShadow: '0 8px 20px rgba(24,131,126,0.40), inset 0 1px 0 rgba(255,255,255,0.30)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <Icon name="scan" size={26} stroke={2.4} color="#fff" />
        </button>
      </div>
      {item('Account', 'user')}
    </div>
  );
}
