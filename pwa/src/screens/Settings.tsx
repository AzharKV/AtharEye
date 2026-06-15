// Settings — units, date format, LiDAR quality, auto-align to BIM, notifications, about. Writes
// data.settings. State is persisted to localStorage; reset = clear the browser cache.
import { T } from '../theme';
import type { Settings as SettingsType } from '../types';
import { useStore } from '../lib/store';
import { Screen } from '../navigation/Navigator';
import { PushHeader } from '../navigation/PushHeader';
import { Card, SectionLabel } from '../components/primitives';
import { Icon } from '../components/Icon';

export function Settings() {
  const { data, patch } = useStore();
  const s = data.settings;
  const set = (partial: Partial<SettingsType>) => patch({ settings: { ...s, ...partial } });

  return (
    <Screen padTop={0}>
      <PushHeader title="Settings" />
      <div style={{ padding: '14px 16px 28px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <SectionLabel>Measurement</SectionLabel>
        <Card style={{ padding: '4px 14px' }}>
          <Segmented label="Units" value={s.units} options={['Metric (m²)', 'Imperial (ft²)']} onPick={(v) => set({ units: v as SettingsType['units'] })} />
          <Segmented label="Date format" value={s.dateFormat} options={['DD MMM YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} onPick={(v) => set({ dateFormat: v as SettingsType['dateFormat'] })} last />
        </Card>

        <SectionLabel>Scanning</SectionLabel>
        <Card style={{ padding: '4px 14px' }}>
          <Segmented label="LiDAR quality" value={s.lidarQuality} options={['Standard', 'High', 'Maximum']} onPick={(v) => set({ lidarQuality: v as SettingsType['lidarQuality'] })} />
          <Toggle label="Auto-align to BIM" on={s.autoAlign} onToggle={() => set({ autoAlign: !s.autoAlign })} last />
        </Card>

        <SectionLabel>Notifications</SectionLabel>
        <Card style={{ padding: '4px 14px' }}>
          <Toggle label="Scan & report alerts" on={s.notifications} onToggle={() => set({ notifications: !s.notifications })} last />
        </Card>

        <SectionLabel>About</SectionLabel>
        <Card style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="info" size={18} color={T.muted} />
            <div style={{ fontSize: 13.5, color: T.ink }}>OptiSync</div>
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 13, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>v1.0.0</div>
          </div>
          <div style={{ fontSize: 12, color: T.faint, marginTop: 8, lineHeight: 1.5 }}>
            iPhone-LiDAR + BIM progress &amp; coverage reporting.
            <br />
            Scan. Compare. Prove. · © 2026 Athar Robotics
          </div>
        </Card>
      </div>
    </Screen>
  );
}

function Segmented({ label, value, options, onPick, last }: { label: string; value: string; options: string[]; onPick: (v: string) => void; last?: boolean }) {
  return (
    <div style={{ padding: '11px 0', borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      <div style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, marginBottom: 9 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, background: T.surface2, borderRadius: 10, padding: 3 }}>
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              onClick={() => onPick(o)}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? T.surface : 'transparent', color: on ? T.navy : T.muted, fontWeight: on ? 700 : 600, fontSize: 12.5, fontFamily: T.font, boxShadow: on ? '0 1px 3px rgba(27,42,61,0.12)' : 'none' }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ label, on, onToggle, last }: { label: string; on: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      <span style={{ flex: 1, fontSize: 13.5, color: T.ink, fontWeight: 600 }}>{label}</span>
      <button
        onClick={onToggle}
        aria-pressed={on}
        style={{ width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? T.teal : T.track, position: 'relative', transition: 'background .2s' }}
      >
        <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}
