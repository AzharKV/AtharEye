// ShareSheet — share / export a report (screen 13). Pick a report type, then Save as PDF (with an
// export progress bar → success), Copy link, or Email to client. Light, Sheet-based.
import { useState } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Sheet } from './Sheet';
import { Button } from './primitives';
import { Icon } from './Icon';
import type { IconName } from './Icon';

const REPORT_TYPES: { id: string; label: string; sub: string; icon: IconName }[] = [
  { id: 'client', label: 'Client progress summary', sub: 'One-page, visual — for the client', icon: 'reports' },
  { id: 'detailed', label: 'Detailed site report', sub: 'Full coverage, zones & issues', icon: 'layers' },
  { id: 'snapshot', label: 'Coverage snapshot', sub: 'Just the numbers & donut', icon: 'target' },
  { id: 'issues', label: 'Issues list', sub: 'For the subcontractor', icon: 'alert' },
];

export function ShareSheet({ projectName, onClose }: { projectName: string; onClose: () => void }) {
  const [sel, setSel] = useState('client');
  const [phase, setPhase] = useState<'pick' | 'exporting' | 'done'>('pick');
  const [prog, setProg] = useState(0);
  const [doneMsg, setDoneMsg] = useState('Report exported · saved to Files');

  const runExport = (msg: string) => {
    haptic();
    setDoneMsg(msg);
    setPhase('exporting');
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - start) / 1100) * 100));
      setProg(p);
      if (p >= 100) {
        clearInterval(id);
        setPhase('done');
      }
    }, 40);
  };

  const copyLink = () => {
    const url = `https://app.optisync.co/r/${projectName.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    runExport('Report link copied');
  };

  if (phase !== 'pick') {
    return (
      <Sheet title="Export report" onClose={onClose} footer={phase === 'done' ? <Button primary full icon="check" onClick={onClose}>Done</Button> : undefined}>
        <div style={{ padding: '24px 6px 12px', textAlign: 'center' }}>
          {phase === 'exporting' ? (
            <>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Preparing report…</div>
              <div style={{ height: 8, borderRadius: 8, background: T.track, overflow: 'hidden' }}>
                <div style={{ width: `${prog}%`, height: '100%', background: T.navy, borderRadius: 8, transition: 'width .04s linear' }} />
              </div>
              <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: T.muted, marginTop: 8 }}>{prog}%</div>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', padding: 14, borderRadius: 999, background: T.tealTint, marginBottom: 12 }}>
                <Icon name="checkCircle" size={30} color={T.teal} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{doneMsg}</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{projectName}</div>
            </>
          )}
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      title="Share report"
      onClose={onClose}
      footer={
        <>
          <Button onClick={copyLink} icon="copy">Copy link</Button>
          <Button primary full icon="pdf" onClick={() => runExport('Report exported · saved to Files')}>Save as PDF</Button>
        </>
      }
    >
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 2px 8px' }}>Report type</div>
      <div style={{ background: T.surface, borderRadius: 14, border: `1px solid ${T.hairline}`, overflow: 'hidden', marginBottom: 16 }}>
        {REPORT_TYPES.map((rt, i) => {
          const on = sel === rt.id;
          return (
            <button
              key={rt.id}
              onClick={() => {
                haptic();
                setSel(rt.id);
              }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer', border: 'none', borderBottom: i < REPORT_TYPES.length - 1 ? `1px solid ${T.hairline2}` : 'none', background: on ? T.navyTint : T.surface, textAlign: 'left' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 9, background: on ? T.navy : T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={rt.icon} size={18} color={on ? '#fff' : T.muted} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: T.ink }}>{rt.label}</div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{rt.sub}</div>
              </div>
              <div style={{ width: 21, height: 21, borderRadius: 21, border: `2px solid ${on ? T.navy : T.faint}`, background: on ? T.navy : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {on && <Icon name="check" size={12} color="#fff" stroke={3.4} />}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => runExport('Emailed to client')}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 12, border: `1px solid ${T.hairline}`, background: T.surface, cursor: 'pointer', textAlign: 'left' }}
      >
        <Icon name="mail" size={19} color={T.navy} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Email to client</span>
        <Icon name="chevron" size={16} color={T.faint} />
      </button>
    </Sheet>
  );
}
