// app-share.jsx — iOS-style Share sheet + Toast (shared by Report detail & Scan result).
const { T, Icon, haptic } = window;

const SHARE_TARGETS = [
  { id: 'msg', label: 'Messages', icon: 'message' },
  { id: 'mail', label: 'Mail', icon: 'mail' },
  { id: 'wa', label: 'WhatsApp', icon: 'message' },
  { id: 'air', label: 'AirDrop', icon: 'airdrop' },
  { id: 'teams', label: 'Teams', icon: 'team' },
  { id: 'copy', label: 'Copy link', icon: 'copy' },
];
const REPORT_TYPES = [
  { id: 'client', label: 'Client Progress Summary', sub: 'One-page, visual — for the client', icon: 'reports' },
  { id: 'detailed', label: 'Detailed Site Report', sub: 'Full coverage, rooms & issues', icon: 'layers' },
  { id: 'snapshot', label: 'Coverage Snapshot', sub: 'Just the numbers & donut', icon: 'target' },
  { id: 'issues', label: 'Issues List', sub: 'For the subcontractor', icon: 'alert' },
];

// ── Toast (auto-hides)
function Toast({ msg, onDone, icon = 'check' }) {
  React.useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onDone, 2200); return () => clearTimeout(t);
  }, [msg]);
  if (!msg) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 108, zIndex: 400, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(28,34,40,0.96)', backdropFilter: 'blur(20px)', border: `1px solid ${T.hairline}`,
        borderRadius: 14, padding: '12px 16px', maxWidth: '86%', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ width: 22, height: 22, borderRadius: 22, background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={14} color={T.onAccent} stroke={3} /></div>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{msg}</span>
      </div>
    </div>
  );
}

// ── Share sheet
function ShareSheet({ open, projectName, onClose, onShared }) {
  const [sel, setSel] = React.useState('client');
  const [closing, setClosing] = React.useState(false);
  React.useEffect(() => { if (open) { setSel('client'); setClosing(false); } }, [open]);
  if (!open) return null;
  const close = () => { onClose(); };
  const typeLabel = REPORT_TYPES.find(t => t.id === sel).label;
  const pick = (tg) => {
    haptic();
    const msg = tg.id === 'copy' ? 'Report link copied' : `${typeLabel} · sent via ${tg.label}`;
    onShared(msg);
  };
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 350, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', background: '#13181D', borderRadius: '22px 22px 0 0', border: `1px solid ${T.hairline}`,
        padding: '10px 16px 30px', maxHeight: '88%', overflowY: 'auto' }} className="no-scrollbar">
        <div style={{ width: 40, height: 5, borderRadius: 5, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.3 }}>Share report</div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{projectName}</div>
        </div>

        {/* report type */}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, margin: '4px 4px 8px' }}>Report type</div>
        <div style={{ background: '#181E24', borderRadius: 16, border: `1px solid ${T.hairline}`, overflow: 'hidden', marginBottom: 18 }}>
          {REPORT_TYPES.map((rt, i) => {
            const on = sel === rt.id;
            return (
              <div key={rt.id} onClick={() => { haptic(); setSel(rt.id); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer',
                borderBottom: i < REPORT_TYPES.length - 1 ? `1px solid ${T.hairline2}` : 'none', background: on ? 'rgba(20,184,192,0.08)' : 'transparent' }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: on ? 'rgba(20,184,192,0.16)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={rt.icon} size={18} color={on ? T.accent : T.muted} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{rt.label}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{rt.sub}</div>
                </div>
                <div style={{ width: 21, height: 21, borderRadius: 21, border: `2px solid ${on ? T.accent : T.faint}`, background: on ? T.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <Icon name="check" size={12} color={T.onAccent} stroke={3.4} />}</div>
              </div>
            );
          })}
        </div>

        {/* targets */}
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4, margin: '4px 4px 10px' }}>Send to</div>
        <div className="no-scrollbar" style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '0 2px 8px', marginBottom: 14 }}>
          {SHARE_TARGETS.map(tg => (
            <button key={tg.id} onClick={() => pick(tg)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0, width: 62 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: '#1C232A', border: `1px solid ${T.hairline}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={tg.icon} size={24} color={T.text} stroke={1.9} /></div>
              <span style={{ fontSize: 11, color: T.muted, fontWeight: 500 }}>{tg.label}</span>
            </button>
          ))}
        </div>

        <button onClick={close} style={{ width: '100%', height: 50, borderRadius: 14, border: 'none', background: '#1C232A', color: T.text, fontSize: 16, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

Object.assign(window, { Toast, ShareSheet, SHARE_TARGETS, REPORT_TYPES });
