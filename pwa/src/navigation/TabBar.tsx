// Bottom tab bar (design .tabbar): Projects · Reports · Scan · Account — 4-col grid, active tab icon
// in a navy-08 pill, the Scan action a navy button. White, blurred, hairline top, safe-area aware.
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
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: on ? T.navy : T.muted, fontSize: 10.5, fontWeight: 600 }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 30, borderRadius: 9, background: on ? T.navyTint : 'transparent', transition: 'background .18s' }}>
          <Icon name={icon} size={23} stroke={on ? 2.2 : 1.9} />
        </span>
        {name}
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
        zIndex: 40,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        padding: '10px 8px 18px',
        paddingBottom: 'max(18px, env(safe-area-inset-bottom))',
        background: 'rgba(255,255,255,0.94)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderTop: `1px solid ${T.hairline}`,
      }}
    >
      {item('Projects', 'projects')}
      {item('Reports', 'reports')}
      <button
        onClick={() => {
          haptic();
          onScan();
        }}
        aria-label="New scan"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T.navy, fontSize: 10.5, fontWeight: 600 }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 34, borderRadius: 11, background: T.navy, boxShadow: '0 5px 14px rgba(30,58,102,0.32)' }}>
          <Icon name="scan" size={23} stroke={2.2} color="#fff" />
        </span>
        Scan
      </button>
      {item('Account', 'user')}
    </div>
  );
}
