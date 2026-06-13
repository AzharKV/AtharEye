// ShareSheet — share / export a report (Task C). Generates a real multipage PDF client-side
// (jsPDF, lazy import) and hands the file to the OS share sheet via the Web Share API on iOS,
// or triggers a download on desktop. Per-zone export when scope = 'zone'.
import { useState } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { generatePdf } from '../lib/pdf';
import type { ReportModel } from '../lib/reports';
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

export function ShareSheet({
  report,
  scope,
  activeZoneId,
  onClose,
}: {
  report: ReportModel;
  scope: 'project' | 'zone';
  activeZoneId?: string;
  onClose: () => void;
}) {
  const [sel, setSel] = useState('client');
  const [phase, setPhase] = useState<'pick' | 'exporting' | 'done' | 'error'>('pick');
  const [prog, setProg] = useState(0);
  const [doneMsg, setDoneMsg] = useState('');

  const runExport = async () => {
    haptic();
    setPhase('exporting');

    // Fake progress up to 80% while generating
    const iv = setInterval(() => {
      setProg((p) => Math.min(80, p + 8));
    }, 120);

    try {
      const blob = await generatePdf(report, scope, activeZoneId);
      clearInterval(iv);
      setProg(100);

      const filename = `optisync-${report.project.id}-${scope === 'zone' && activeZoneId ? activeZoneId : 'report'}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `${report.project.name} — OptiSync Report` });
        setDoneMsg('Report shared');
      } else {
        // Desktop fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setDoneMsg('PDF downloaded');
      }
      setPhase('done');
    } catch (err) {
      clearInterval(iv);
      // navigator.share throws if the user cancels — treat that as "done" silently
      if (err instanceof Error && err.name === 'AbortError') {
        setPhase('pick');
        setProg(0);
      } else {
        setDoneMsg('Export failed — please try again');
        setPhase('error');
      }
    }
  };

  const copyLink = () => {
    const slug = report.project.name.toLowerCase().replace(/[^a-z]+/g, '-');
    const url = `https://app.optisync.co/r/${slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    haptic();
    setDoneMsg('Report link copied');
    setPhase('done');
  };

  if (phase === 'exporting') {
    return (
      <Sheet title="Export PDF" onClose={onClose}>
        <div style={{ padding: '24px 6px 12px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.ink, marginBottom: 16 }}>Preparing PDF…</div>
          <div style={{ height: 8, borderRadius: 8, background: T.track, overflow: 'hidden' }}>
            <div style={{ width: `${prog}%`, height: '100%', background: T.navy, borderRadius: 8, transition: 'width .12s linear' }} />
          </div>
          <div style={{ fontVariantNumeric: 'tabular-nums', fontSize: 13, color: T.muted, marginTop: 8 }}>{prog}%</div>
        </div>
      </Sheet>
    );
  }

  if (phase === 'done' || phase === 'error') {
    return (
      <Sheet title="Export PDF" onClose={onClose} footer={<Button primary full icon="check" onClick={onClose}>Done</Button>}>
        <div style={{ padding: '24px 6px 12px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: 14, borderRadius: 999, background: phase === 'done' ? T.tealTint : T.redTint, marginBottom: 12 }}>
            <Icon name={phase === 'done' ? 'checkCircle' : 'alert'} size={30} color={phase === 'done' ? T.teal : T.red} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{doneMsg}</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{report.project.name}</div>
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
          <Button primary full icon="pdf" onClick={runExport}>Export PDF</Button>
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
              onClick={() => { haptic(); setSel(rt.id); }}
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
        onClick={() => { haptic(); copyLink(); }}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 12, border: `1px solid ${T.hairline}`, background: T.surface, cursor: 'pointer', textAlign: 'left' }}
      >
        <Icon name="mail" size={19} color={T.navy} />
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: T.ink }}>Email to client</span>
        <Icon name="chevron" size={16} color={T.faint} />
      </button>
    </Sheet>
  );
}
