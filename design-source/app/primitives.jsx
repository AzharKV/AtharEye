/* OptiSync — shared primitives & icons (React, Babel) */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------- icons (stroke, 24 grid) ---------- */
const Ic = {
  projects: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 9.5 12 4l9 5.5M5 11v8h14v-8" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round"/><path d="M10 19v-4h4v4" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>,
  reports: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="3" width="14" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.7"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  scan: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  settings: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6M18.7 18.7l-1.6-1.6M6.9 6.9 5.3 5.3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  chevR: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevL: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  search: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8"/><path d="m20 20-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  plus: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  share: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 15V4M8.5 7.5 12 4l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  pdf: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6"/><path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M8.5 14h1a1.2 1.2 0 0 0 0-2.4h-1V17M16 11.6h-2.3V17M13.7 14.4H15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  link: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 13a4 4 0 0 0 5.7.3l2.5-2.5a4 4 0 0 0-5.7-5.7L10 6.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M15 11a4 4 0 0 0-5.7-.3L6.8 13.2a4 4 0 0 0 5.7 5.7L14 17.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  bim: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 7.5 12 12l9-4.5M12 12v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  team: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M4 19a5 5 0 0 1 10 0M16 6.2a3 3 0 0 1 0 5.6M18 19a5 5 0 0 0-3-4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  camera: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 8a2 2 0 0 1 2-2h2l1.4-2h7.2L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="13" r="3.4" stroke="currentColor" strokeWidth="1.6"/></svg>,
  check: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="m5 12.5 4.5 4.5L19 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  alert: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3 2.5 20h19L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M12 10v4.5M12 17.4v.1" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  clock: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7.6V12l3 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  trash: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pin: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/></svg>,
  cube: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  user: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8.5" r="4" stroke="currentColor" strokeWidth="1.7"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  bolt: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  x: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>,
  arrowUp: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 19V5M6 11l6-6 6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  layers: (p) => <svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3 3 8l9 5 9-5-9-5ZM3 13l9 5 9-5M3 16.5l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
};

/* ---------- status bar ---------- */
function StatusBar({ tone = 'dark' }) {
  return (
    <div className={"statusbar " + tone}>
      <div className="t">9:41</div>
      <div className="r">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor"/><rect x="4.5" y="4.5" width="3" height="7.5" rx="1" fill="currentColor"/><rect x="9" y="2" width="3" height="10" rx="1" fill="currentColor"/><rect x="13.5" y="0" width="3" height="12" rx="1" fill="currentColor"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none"><path d="M8.5 2.4c2 0 3.8.8 5.1 2l1.2-1.3A9 9 0 0 0 8.5.7 9 9 0 0 0 2.2 3.1L3.4 4.4a7 7 0 0 1 5.1-2Z" fill="currentColor"/><path d="M8.5 6c1 0 2 .4 2.7 1.1l1.2-1.3A6 6 0 0 0 8.5 4 6 6 0 0 0 4.6 5.8l1.2 1.3A4 4 0 0 1 8.5 6Z" fill="currentColor"/><circle cx="8.5" cy="9.6" r="1.6" fill="currentColor"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity=".5" strokeWidth="1"/><rect x="2.6" y="2.6" width="16" height="7.8" rx="1.6" fill="currentColor"/><rect x="23.4" y="4.2" width="1.8" height="4.6" rx="1" fill="currentColor" fillOpacity=".5"/></svg>
      </div>
    </div>
  );
}

/* ---------- coverage donut ---------- */
function Donut({ value, size = 132, stroke = 13, color = 'var(--navy)', label = 'verified', sub, big }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  const off = c * (1 - v / 100);
  const fs = big ? size * 0.30 : size * 0.27;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--navy-08)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: fs, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{Math.round(v)}<span style={{ fontSize: fs * 0.42, verticalAlign: 'top' }}>%</span></div>
        {label && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>}
        {sub && <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ---------- mini donut for list rows ---------- */
function MiniDonut({ value, size = 38, stroke = 4.5 }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const color = value >= 100 ? 'var(--teal)' : 'var(--navy)';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flex: 'none' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--navy-08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value/100)} />
      <text x="50%" y="50%" transform={`rotate(90 ${size/2} ${size/2})`} textAnchor="middle" dominantBaseline="central" fontFamily="var(--mono)" fontSize="10.5" fontWeight="700" fill="var(--ink)">{value}</text>
    </svg>
  );
}

/* ---------- zone bars ---------- */
function ZoneBars({ zones, scale = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {zones.map((z, i) => {
        const cov = Math.max(0, Math.min(100, Math.round(z.coverage * scale)));
        return (
          <div key={i}>
            <div className="row between" style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{z.name}</span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: cov >= 100 ? 'var(--teal)' : 'var(--ink)' }}>{cov}%</span>
            </div>
            <div className="zbar-track"><div className={"zbar-fill" + (cov >= 100 ? ' complete' : '')} style={{ width: cov + '%' }} /></div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- sparkline (coverage over time) ---------- */
function Sparkline({ scans, w = 326, h = 70 }) {
  const pts = scans.map(s => s.coverage);
  if (pts.length < 2) return null;
  const max = 100, padX = 6, padY = 8;
  const innerW = w - padX * 2, innerH = h - padY * 2;
  const xy = pts.map((p, i) => [padX + innerW * (i / (pts.length - 1)), padY + innerH * (1 - p / max)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${xy[xy.length-1][0].toFixed(1)} ${h-padY} L${xy[0][0].toFixed(1)} ${h-padY} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--navy)" stopOpacity=".14"/><stop offset="1" stopColor="var(--navy)" stopOpacity="0"/></linearGradient></defs>
      <path d={area} fill="url(#spk)" />
      <path d={d} fill="none" stroke="var(--navy)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === xy.length - 1 ? 4 : 2.4} fill={i === xy.length - 1 ? 'var(--teal)' : 'var(--navy)'} stroke="#fff" strokeWidth="1.4" />)}
    </svg>
  );
}

/* ---------- chips & pills ---------- */
function StageChip({ stage, label }) {
  const S = window.OPTISYNC.STAGE[stage];
  let cls, text;
  if (S) { cls = S.cls; text = label || S.label; }
  else { const s = (stage || '').toLowerCase(); cls = /complete/.test(s) ? 'complete' : (/mid|finish/.test(s) ? 'mid' : 'early'); text = label || stage; }
  return <span className={"chip " + cls}><span className="dot" />{text}</span>;
}
function StatusPill({ status }) {
  const map = { 'On track': 'ontrack', 'Needs review': 'review', 'Behind': 'behind', 'Complete': 'done' };
  return <span className={"status " + (map[status] || 'ontrack')}><span className="dot" />{status}</span>;
}

/* ---------- issue row ---------- */
function IssueRow({ issue, onTap }) {
  return (
    <button className="row gap10" onClick={onTap} style={{ width: '100%', textAlign: 'left', padding: '11px 0', borderBottom: '1px solid var(--hairline)' }}>
      <span className={"sev " + issue.sev} style={{ marginTop: 5 }} />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{issue.title}</span>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}><span className="mono">{issue.id}</span> · {issue.zone} · {issue.sev}{issue.status === 'Closed' ? ' · Closed' : ''}</span>
      </span>
      <Ic.chevR style={{ width: 16, height: 16, color: 'var(--muted)', flex: 'none', marginTop: 3 }} />
    </button>
  );
}

/* ---------- gallery ---------- */
function Gallery({ shots, onOpen }) {
  return (
    <div className="gallery">
      {shots.map((s, i) => (
        <button key={s.p} className="shot" onClick={() => onOpen && onOpen(i)}>
          <img src={s.src} alt={s.cap} loading="lazy" />
          <span className="cap">{s.cap}</span>
        </button>
      ))}
    </div>
  );
}

/* date format DD MMM YYYY */
const MM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fdate(iso) { if (!iso) return ''; const [y, m, d] = iso.split('-'); return `${+d} ${MM[+m - 1]} ${y}`; }
function fdateShort(iso) { const [y, m, d] = iso.split('-'); return `${+d} ${MM[+m - 1]}`; }

Object.assign(window, {
  Ic, StatusBar, Donut, MiniDonut, ZoneBars, Sparkline, StageChip, StatusPill, IssueRow, Gallery, fdate, fdateShort,
  useState, useEffect, useRef, useMemo
});
