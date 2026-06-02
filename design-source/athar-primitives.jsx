// athar-primitives.jsx — Athar Eye design-system primitives
// Tokens from SPEC §6.2/6.3. Exports to window.
// Dark, navy + teal, SF system font, 4-pt grid.

const T = {
  bg: '#0B1622',
  surface: '#11212F',
  surface2: '#16293A',
  hairline: 'rgba(255,255,255,0.08)',
  text: '#F1F5F8',
  muted: '#93A6B6',
  accent: '#14B8C0',
  accentPress: '#0F949B',
  success: '#2FBF71',
  warning: '#E8A33D',
  danger: '#E5484D',
  font: '-apple-system, system-ui, "SF Pro", sans-serif',
};

// Status → dot color + label. Calm: teal = positive/brand, amber = the one
// caution accent (Needs Review only). Badges are quiet neutral chips with a
// small colored dot — no saturated fills competing across the screen.
const STATUS = {
  'On Track':     { c: T.accent,  label: 'On track' },
  'Needs Review': { c: T.warning, label: 'Needs review' },
  'Complete':     { c: T.accent,  label: 'Complete', check: true },
};

// ── Safe-area screen wrapper. IOSDevice renders the real status bar (zIndex 10)
//    absolutely over content; we pad the top to clear island + bar.
function AppScreen({ children, tabbar, scroll = true, style = {}, padTop = 59, contentRef }) {
  return (
    <div style={{
      height: '100%', background: T.bg, color: T.text,
      display: 'flex', flexDirection: 'column', position: 'relative',
      fontFamily: T.font, WebkitFontSmoothing: 'antialiased', ...style,
    }}>
      <div ref={contentRef} style={{
        flex: 1, overflowY: scroll ? 'auto' : 'hidden', overflowX: 'hidden',
        paddingTop: padTop, WebkitOverflowScrolling: 'touch',
      }}>{children}</div>
      {tabbar}
    </div>
  );
}

// ── Large title block (iOS large title, navy)
function LargeTitle({ children, trailing, sub }) {
  return (
    <div style={{ padding: '4px 20px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.6,
          lineHeight: '38px', color: T.text,
        }}>{children}</h1>
        {trailing}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: T.muted }}>{sub}</div>}
    </div>
  );
}

// ── Filter chips
function Chips({ items, active, onPick }) {
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '6px 20px 10px', overflowX: 'auto',
      scrollbarWidth: 'none',
    }}>
      {items.map(it => {
        const on = it === active;
        return (
          <button key={it} onClick={() => onPick && onPick(it)} style={{
            flexShrink: 0, border: 'none', cursor: 'pointer',
            padding: '8px 14px', borderRadius: 11,
            fontFamily: T.font, fontSize: 14, fontWeight: 600, letterSpacing: -0.1,
            background: on ? T.accent : T.surface2,
            color: on ? '#04222B' : T.muted,
            boxShadow: on ? '0 1px 8px rgba(20,184,192,0.3)' : 'none',
            transition: 'all .2s cubic-bezier(.32,.72,0,1)',
          }}>{it}</button>
        );
      })}
    </div>
  );
}

// ── Status badge — quiet neutral chip + small colored dot
function StatusBadge({ status, small = false }) {
  const s = STATUS[status] || STATUS['On Track'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: small ? '3px 9px 3px 8px' : '4px 11px 4px 9px', borderRadius: 8,
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${T.hairline}`,
      color: T.text, fontSize: small ? 11.5 : 12.5, fontWeight: 600, letterSpacing: -0.1,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: s.c }} />
      {s.label}
    </span>
  );
}

// ── Linear progress bar. Default fill is teal (the one accent). Pass `color`
//    only for deliberate exceptions (e.g. a behind room flagged red).
function ProgressBar({ value, height = 6, color }) {
  const col = color || T.accent;
  return (
    <div style={{ height, borderRadius: height, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div style={{
        width: `${value}%`, height: '100%', borderRadius: height,
        background: col, transition: 'width .8s cubic-bezier(.32,.72,0,1)',
      }} />
    </div>
  );
}

// ── Coverage donut (the hero). Covered = teal (brand). Missing = soft red.
function CoverageDonut({ value = 0, size = 168, stroke = 16, label = 'Covered', showMissing = true }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cov = Math.max(0, Math.min(100, value));
  const covLen = (cov / 100) * c;
  const col = T.accent;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* missing track (soft red, quiet) */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={showMissing ? 'rgba(229,72,77,0.22)' : 'rgba(255,255,255,0.07)'} strokeWidth={stroke} />
        {/* covered arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={col} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${covLen} ${c}`}
          style={{ transition: 'stroke-dasharray .2s linear' }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size * 0.27, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>
          {Math.round(cov)}<span style={{ fontSize: size * 0.13, fontWeight: 700 }}>%</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

// ── Mini coverage ring (for project cards). Always teal — one accent.
function CoverageRing({ value = 0, size = 52, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const col = T.accent;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${(v/100)*c} ${c}`} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.30, fontWeight: 800, letterSpacing: -0.5,
      }}>{Math.round(v)}</div>
    </div>
  );
}

// ── Blueprint tile — branded thumbnail placeholder (not a fake photo).
//    Navy ground + isometric line motif + a type glyph. Reads as intentional.
const TYPE_GLYPH = {
  'Shop refit': 'storefront', 'Residential extension': 'home', 'Residential': 'home',
  'Commercial · Level 3': 'office', 'Industrial': 'warehouse', 'Hospitality': 'cup',
  default: 'building',
};
function BlueprintTile({ type = 'default', w = 56, h = 56, radius = 13, accent = T.accent }) {
  const id = 'bp' + Math.random().toString(36).slice(2, 8);
  return (
    <div style={{
      width: w, height: h, borderRadius: radius, flexShrink: 0, position: 'relative',
      overflow: 'hidden', background: `linear-gradient(150deg, ${T.surface2}, #0E1C28)`,
      border: `1px solid ${T.hairline}`,
    }}>
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={id} width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
            <path d="M0 11L11 0M-2 2L2 -2M9 13L13 9" stroke={accent} strokeOpacity="0.16" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id})`} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, opacity: 0.85 }}>
        <TypeGlyph name={TYPE_GLYPH[type] || TYPE_GLYPH.default} size={Math.round(w * 0.42)} />
      </div>
    </div>
  );
}

// ── Simple line glyphs for blueprint tiles (geometric only)
function TypeGlyph({ name, size = 24, stroke = 1.8, color = 'currentColor' }) {
  const p = {
    storefront: <><path d="M4 9l1.4-4h13.2L20 9M4 9v10h16V9M4 9h16M9 19v-5h6v5"/></>,
    home: <><path d="M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5"/></>,
    office: <><rect x="6" y="4" width="12" height="16"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
    warehouse: <><path d="M3 10l9-5 9 5v9H3zM3 19v-9M21 19v-9M8 19v-6h8v6"/></>,
    cup: <><path d="M6 8h10v5a5 5 0 01-10 0zM16 9h2.5a2 2 0 010 4H16M7 5v1.5M11 5v1.5"/></>,
    building: <><rect x="6" y="4" width="12" height="16"/><path d="M10 8h4M10 12h4M10 16h4"/></>,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{p}</svg>
  );
}

// ── Generic 24px line icon set
function Icon({ name, size = 24, stroke = 2, color = 'currentColor', style = {} }) {
  const p = {
    projects: <><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></>,
    reports: <><path d="M6 3h9l4 4v14H6zM15 3v4h4"/><path d="M9 12h7M9 16h7"/></>,
    scan: <><path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16"/><path d="M4 12h16"/></>,
    settings: <><circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.5M12 18.5V21M21 12h-2.5M5.5 12H3M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4L5.6 5.6"/></>,
    chevron: <path d="M9 5l7 7-7 7"/>,
    chevronL: <path d="M15 5l-7 7 7 7"/>,
    pin: <><path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></>,
    share: <><path d="M12 3v13M12 3L8 7M12 3l4 4"/><path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4"/></>,
    pdf: <><path d="M6 3h9l4 4v14H6zM15 3v4h4"/><path d="M9 13h1.5a1.5 1.5 0 010 3H9zM9 13v6M14 13v6M14 13h2M14 16h1.5"/></>,
    layers: <><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5"/></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></>,
    clock: <><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></>,
    area: <><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9 4v16"/></>,
    alert: <><path d="M12 4l9 16H3l9-16zM12 10v4M12 17v.5"/></>,
    check: <path d="M5 13l4 4L19 7"/>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/></>,
    chevronDown: <path d="M6 9l6 6 6-6"/>,
    close: <path d="M6 6l12 12M18 6L6 18"/>,
    scans: <><path d="M3 7l9-4 9 4-9 4-9-4zM3 7v6l9 4 9-4V7M3 13v0M21 13v0"/></>,
    team: <><circle cx="9" cy="9" r="3.2"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5"/><path d="M16 6.2A3.2 3.2 0 0118 12M21 19c0-2.4-1.5-4.2-3.5-4.8"/></>,
  }[name] || null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>{p}</svg>
  );
}

// ── Bottom tab bar — Projects · Reports · Scan(center) · Settings
function TabBar({ active = 'Projects', onTab, onScan }) {
  const item = (name, icon) => {
    const on = active === name;
    return (
      <button onClick={() => onTab && onTab(name)} style={{
        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '8px 0 0',
        color: on ? T.accent : T.muted,
      }}>
        <Icon name={icon} size={25} stroke={on ? 2.3 : 2} />
        <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, letterSpacing: -0.1 }}>{name}</span>
      </button>
    );
  };
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'flex-start',
      padding: '0 6px 22px', paddingBottom: 'max(22px, env(safe-area-inset-bottom))',
      background: 'rgba(11,22,34,0.86)', backdropFilter: 'blur(20px) saturate(160%)',
      WebkitBackdropFilter: 'blur(20px) saturate(160%)',
      borderTop: `1px solid ${T.hairline}`,
    }}>
      {item('Projects', 'projects')}
      {item('Reports', 'reports')}
      {/* center scan */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => onScan && onScan()} style={{
          marginTop: -16, width: 58, height: 58, borderRadius: 19, border: 'none', cursor: 'pointer',
          background: `linear-gradient(160deg, ${T.accent}, ${T.accentPress})`,
          boxShadow: '0 6px 18px rgba(20,184,192,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: '#04222B',
        }}>
          <Icon name="scan" size={27} stroke={2.4} color="#04222B" />
        </button>
      </div>
      {item('Settings', 'settings')}
    </div>
  );
}

Object.assign(window, {
  T, STATUS, AppScreen, LargeTitle, Chips, StatusBadge, ProgressBar,
  CoverageDonut, CoverageRing, BlueprintTile, TypeGlyph, Icon, TabBar, TYPE_GLYPH,
});
