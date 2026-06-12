/* OptiSync UI kit — small shared bits (icons, phone chrome, status bar). */
const KitIc = {
  projects: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 9.5 12 4l9 5.5M5 11v8h14v-8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/><path d="M10 19v-4h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  reports: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="3" width="14" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.7"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  scan: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8.5" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  chevL: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevR: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15V4M8.5 7.5 12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m5 12.5 4.5 4.5L19 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
};

function StatusBar() {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 30px 8px', pointerEvents: 'none' }}>
      <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>9:41</div>
      <div className="row gap6">
        <svg width="17" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor"/><rect x="4.5" y="4.5" width="3" height="7.5" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
        <svg width="25" height="12" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity=".5"/><rect x="2.6" y="2.6" width="16" height="7.8" rx="1.6" fill="currentColor"/><rect x="23.4" y="4.2" width="1.8" height="4.6" rx="1" fill="currentColor" fillOpacity=".5"/></svg>
      </div>
    </div>
  );
}

function TabBar({ active, onTab }) {
  const Item = ({ id, icon, label }) => (
    <button onClick={() => onTab(id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active === id ? 'var(--navy)' : 'var(--muted)', fontSize: 10.5, fontWeight: 600 }}>
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 30, borderRadius: 9, background: active === id ? 'var(--navy-08)' : 'transparent' }}>{React.cloneElement(icon, { width: 23, height: 23 })}</span>
      {label}
    </button>
  );
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, zIndex: 40, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--hairline)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '10px 8px 22px' }}>
      <Item id="projects" icon={<KitIc.projects />} label="Projects" />
      <Item id="reports" icon={<KitIc.reports />} label="Reports" />
      <button onClick={() => onTab('scan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--navy)', fontSize: 10.5, fontWeight: 600 }}>
        <span style={{ width: 52, height: 34, borderRadius: 11, background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 14px rgba(30,58,102,.32)' }}><KitIc.scan width={23} height={23} style={{ color: '#fff' }} /></span>
        Scan
      </button>
      <Item id="account" icon={<KitIc.user />} label="Account" />
    </div>
  );
}

function MiniDonut({ value, size = 46, stroke = 5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const color = value >= 100 ? 'var(--teal)' : 'var(--navy)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flex: 'none' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--navy-08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value/100)} />
      <text x="50%" y="50%" transform={`rotate(90 ${size/2} ${size/2})`} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="700" fill="var(--ink)" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</text>
    </svg>
  );
}

Object.assign(window, { KitIc, StatusBar, TabBar, MiniDonut });
