// app-ui.jsx — Athar Eye · Minimal Mono UI kit (tokens + atoms). Exports to window.
// Discipline: ONE teal hero per screen (donut / headline % / primary button /
// active tab). Everything structural is grey. Red only for missing/critical.

const T = {
  bg: '#0C0F12', surface: '#15191E', surface2: '#1B2026', surfaceHi: '#20262E',
  hairline: 'rgba(255,255,255,0.07)', hairline2: 'rgba(255,255,255,0.04)',
  text: '#F4F6F8', muted: '#8A949E', faint: '#5B646D',
  accent: '#14B8C0', accent2: '#45D6DD', accentPress: '#0F949B', onAccent: '#04222B',
  bar: '#AEB8C2', track: 'rgba(255,255,255,0.09)',
  warning: '#E8A33D', danger: '#E5484D', glow: 'rgba(20,184,192,0.20)',
  font: '-apple-system, system-ui, "SF Pro", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, monospace',
};

// Status: teal = positive, amber = the one caution accent (Needs Review only).
const STATUS = {
  'On Track':     { c: T.accent,  label: 'On track' },
  'Needs Review': { c: T.warning, label: 'Needs review' },
  'Complete':     { c: T.accent,  label: 'Complete' },
};
const SEV = { high: T.danger, med: T.warning, low: T.faint };

const haptic = () => { try { navigator.vibrate && navigator.vibrate(8); } catch (e) {} };

// ── 24px line icons
function Icon({ name, size = 24, stroke = 2, color = 'currentColor', style = {} }) {
  const p = {
    projects: <><rect x="3" y="4" width="18" height="6" rx="1.6"/><rect x="3" y="14" width="18" height="6" rx="1.6"/></>,
    reports: <><path d="M6 3h9l4 4v14H6zM15 3v4h4"/><path d="M9 12h7M9 16h7"/></>,
    scan: <><path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16"/><path d="M4 12h16"/></>,
    settings: <><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6"/></>,
    chevron: <path d="M9 5l7 7-7 7"/>,
    chevronL: <path d="M15 5l-7 7 7 7"/>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    pin: <><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    share: <><path d="M12 3v13M12 3L8 7M12 3l4 4"/><path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    pdf: <><path d="M6 3h9l4 4v14H6zM15 3v4h4"/><path d="M9 13h1.4a1.4 1.4 0 010 2.8H9zM9 13v6M13.5 13v6M13.5 13h2.2M13.5 16h1.6"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/></>,
    clock: <><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></>,
    area: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16"/></>,
    alert: <><path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.4"/></>,
    check: <path d="M5 13l4 4L19 7"/>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></>,
    close: <path d="M6 6l12 12M18 6L6 18"/>,
    scans: <><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v6l9 4 9-4V7"/></>,
    team: <><circle cx="9" cy="9" r="3.2"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6.2A3.2 3.2 0 0118 12M21 19c0-2.4-1.5-4.2-3.5-4.8"/></>,
    bell: <><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 004 0"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.4"/></>,
    cube: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5"/></>,
    bolt: <path d="M13 3L5 13h6l-1 8 8-10h-6z"/>,
    ruler: <><rect x="2.5" y="8" width="19" height="8" rx="1.5" transform="rotate(0)"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/></>,
    upload: <><path d="M12 16V4M12 4L8 8M12 4l4 4"/><path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3"/></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/></>,
    message: <><path d="M4 5h16v11H9l-4 4z" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></>,
    airdrop: <><path d="M7 17a7 7 0 0110 0M10 14a3.2 3.2 0 014 0"/><circle cx="12" cy="20" r="1"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/></>,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>{p}</svg>
  );
}

// ── Brand mark (scan-aperture eye) + lockup
function Mark({ size = 30, r = 9 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r, flexShrink: 0,
      background: 'radial-gradient(120% 120% at 30% 25%, #18242B, #0C151B)',
      border: `1px solid ${T.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9.5" stroke={T.accent} strokeWidth="1.6" strokeDasharray="3 3" opacity="0.5" />
        <circle cx="12" cy="12" r="5.5" stroke={T.accent} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2" fill={T.accent} />
      </svg>
    </div>
  );
}
function Wordmark({ size = 19, sub }) {
  return (
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: -0.5, color: T.text }}>Athar<span style={{ color: T.accent }}>Eye</span></div>
      {sub && <div style={{ fontSize: 10.5, fontWeight: 600, color: T.muted, marginTop: 3, letterSpacing: 0.5 }}>{sub}</div>}
    </div>
  );
}

// ── Team avatar
function Avatar({ initials, size = 30, ring }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size, flexShrink: 0,
      background: T.surfaceHi, border: ring ? `2px solid ${T.bg}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 700, color: T.muted, fontFamily: T.font,
    }}>{initials}</div>
  );
}

// ── Status badge — quiet neutral chip + dot
function StatusBadge({ status, small = false }) {
  const s = STATUS[status] || STATUS['On Track'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 9px 3px 8px' : '4px 11px 4px 9px', borderRadius: 8,
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.hairline}`,
      color: T.text, fontSize: small ? 11.5 : 12.5, fontWeight: 600, letterSpacing: -0.1, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: s.c }} />{s.label}
    </span>
  );
}

// ── Progress bar — grey by default (data); pass color for exceptions
function Bar({ value, height = 6, color, track }) {
  return (
    <div style={{ height, borderRadius: height, background: track || T.track, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', borderRadius: height, background: color || T.bar, transition: 'width .8s cubic-bezier(.32,.72,0,1)' }} />
    </div>
  );
}

// ── Mini ring — grey default; accent for the screen hero
function Ring({ value = 0, size = 52, stroke = 5, accent = false, label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={accent ? T.accent : T.bar} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(v/100)*c} ${c}`} style={{ transition: 'stroke-dasharray .7s cubic-bezier(.32,.72,0,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.30, fontWeight: 800, letterSpacing: -0.5, color: accent ? T.accent : T.text }}>{Math.round(v)}</div>
        {label && <div style={{ fontSize: 8.5, fontWeight: 700, color: T.faint, letterSpacing: 0.3 }}>{label}</div>}
      </div>
    </div>
  );
}

// ── Hero donut — teal gradient arc + glow + teal number (the screen's focal point)
function Donut({ value = 0, size = 188, stroke = 18, label = 'Covered', sub }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const cov = Math.max(0, Math.min(100, value)), covLen = (cov / 100) * c;
  const gid = 'dg' + Math.round(size);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', inset: '10%', borderRadius: '50%', background: `radial-gradient(circle, ${T.glow}, transparent 68%)` }} />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={T.accent} /><stop offset="1" stopColor={T.accent2} /></linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(229,72,77,0.20)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${covLen} ${c}`} style={{ transition: 'stroke-dasharray .15s linear' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, color: T.accent }}>
          {Math.round(cov)}<span style={{ fontSize: size * 0.13, color: T.muted }}>%</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, marginTop: 5, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Blueprint tile — branded thumbnail placeholder
const TYPE_GLYPH = {
  'Shop refit': 'storefront', 'Residential extension': 'home', 'Residential': 'home',
  'Commercial · Level 3': 'office', 'Industrial': 'warehouse', 'Hospitality': 'cup', default: 'building',
};
function TypeGlyph({ name, size = 24, stroke = 1.8, color = 'currentColor' }) {
  const p = {
    storefront: <><path d="M4 9l1.4-4h13.2L20 9M4 9v10h16V9M4 9h16M9 19v-5h6v5"/></>,
    home: <><path d="M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5"/></>,
    office: <><rect x="6" y="4" width="12" height="16"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
    warehouse: <><path d="M3 10l9-5 9 5v9H3zM8 19v-6h8v6"/></>,
    cup: <><path d="M6 8h10v5a5 5 0 01-10 0zM16 9h2.5a2 2 0 010 4H16"/></>,
    building: <><rect x="6" y="4" width="12" height="16"/><path d="M10 8h4M10 12h4M10 16h4"/></>,
  }[name] || null;
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p}</svg>;
}
function BlueprintTile({ type = 'default', w = 52, h = 52, radius = 13 }) {
  const id = 'bp' + Math.random().toString(36).slice(2, 8);
  return (
    <div style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, position: 'relative', overflow: 'hidden', background: `linear-gradient(150deg, ${T.surface2}, #0E141A)`, border: `1px solid ${T.hairline}` }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs><pattern id={id} width="11" height="11" patternUnits="userSpaceOnUse"><path d="M0 11L11 0M-2 2L2 -2M9 13L13 9" stroke={T.accent} strokeOpacity="0.14" strokeWidth="1"/></pattern></defs>
        <rect width={w} height={h} fill={`url(#${id})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.accent, opacity: 0.8 }}>
        <TypeGlyph name={TYPE_GLYPH[type] || TYPE_GLYPH.default} size={Math.round(w * 0.42)} />
      </div>
    </div>
  );
}

// ── Banner blueprint (wide, for headers)
function BannerBlueprint({ type, style = {} }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg,#16202A,#0C141B)', overflow: 'hidden', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(48deg, transparent 0 11px, rgba(20,184,192,0.07) 11px 12px), repeating-linear-gradient(-48deg, transparent 0 11px, rgba(20,184,192,0.04) 11px 12px)' }} />
      <div style={{ position: 'absolute', right: -6, top: '50%', transform: 'translateY(-50%)', color: T.accent, opacity: 0.13 }}>
        <TypeGlyph name={TYPE_GLYPH[type] || 'building'} size={120} stroke={1.2} />
      </div>
    </div>
  );
}

// ── Filter chips
function Chips({ items, active, onPick }) {
  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '4px 20px 10px', overflowX: 'auto' }}>
      {items.map(it => {
        const on = it === active;
        return (
          <button key={it} onClick={() => { haptic(); onPick && onPick(it); }} style={{
            flexShrink: 0, border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 11,
            fontFamily: T.font, fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
            background: on ? T.accent : T.surface2, color: on ? T.onAccent : T.muted,
            transition: 'all .2s cubic-bezier(.32,.72,0,1)',
          }}>{it}</button>
        );
      })}
    </div>
  );
}

// ── Buttons
function Button({ children, primary, icon, onClick, style = {}, full }) {
  const [d, setD] = React.useState(false);
  return (
    <button onClick={() => { haptic(); onClick && onClick(); }}
      onPointerDown={() => setD(true)} onPointerUp={() => setD(false)} onPointerLeave={() => setD(false)}
      style={{
        flex: full ? 1 : undefined, height: 52, borderRadius: 14, border: primary ? 'none' : `1px solid ${T.hairline}`,
        background: primary ? (d ? T.accentPress : T.accent) : (d ? T.surfaceHi : T.surface2), color: primary ? T.onAccent : T.text,
        fontSize: 16, fontWeight: 700, fontFamily: T.font, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        boxShadow: primary ? '0 4px 16px rgba(20,184,192,0.30)' : 'none',
        transform: d ? 'scale(0.985)' : 'scale(1)', transition: 'transform .12s, background .12s', ...style,
      }}>{icon && <Icon name={icon} size={20} color={primary ? T.onAccent : T.text} />}{children}</button>
  );
}

// ── Card
function Card({ children, style = {}, onClick, pressable }) {
  const [d, setD] = React.useState(false);
  return (
    <div onClick={onClick ? () => { haptic(); onClick(); } : undefined}
      onPointerDown={pressable ? () => setD(true) : undefined} onPointerUp={() => setD(false)} onPointerLeave={() => setD(false)}
      style={{
        background: T.surface, borderRadius: 18, border: `1px solid ${T.hairline}`,
        cursor: onClick ? 'pointer' : 'default', transform: d ? 'scale(0.99)' : 'scale(1)',
        transition: 'transform .12s', ...style,
      }}>{children}</div>
  );
}

// ── Section label
function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 2px 8px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>{children}</div>
      {right}
    </div>
  );
}

// ── Large title header (with optional back chevron handled by NavStack)
function ScreenHeader({ title, sub, trailing }) {
  return (
    <div style={{ padding: '4px 20px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.6, lineHeight: '38px', color: T.text }}>{title}</h1>
        {trailing}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: T.muted }}>{sub}</div>}
    </div>
  );
}

// ── count-up hook (timer-driven — robust even where rAF is throttled)
function useCountUp(target, dur = 1100, run = true) {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!run) { setV(target); return; }
    setV(0);
    const start = Date.now();
    const ease = x => 1 - Math.pow(1 - x, 3);
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setV(target * ease(p));
      if (p >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [target, run]);
  return v;
}

Object.assign(window, {
  T, STATUS, SEV, haptic, Icon, Mark, Wordmark, Avatar, StatusBadge, Bar, Ring, Donut,
  BlueprintTile, BannerBlueprint, TypeGlyph, TYPE_GLYPH, Chips, Button, Card, SectionLabel,
  ScreenHeader, useCountUp,
});
