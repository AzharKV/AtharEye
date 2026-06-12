// OptiSync UI kit — Blueprint + teal, light. Coverage = donut + zone bars; issues = severity dots;
// status/stage = tinted pills; figures use tabular+lining numerals (the `mono` style + .mono class).
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { SEV, STAGE, STATUS, T } from '../theme';
import type { Severity, Stage, Status, Zone } from '../types';
import { haptic } from '../lib/haptic';
import { useBackLayer } from '../hooks/useBackLayer';
import { useCountUp } from '../hooks/useCountUp';
import { photoSrc } from '../lib/photos';
import { Icon } from './Icon';
import type { IconName } from './Icon';

/** Tabular + lining numerals for figures (matches the .mono class). */
export const mono: CSSProperties = {
  fontVariantNumeric: 'tabular-nums lining-nums',
  fontFeatureSettings: "'tnum', 'lnum'",
};

// ── Avatar — initials circle
export function Avatar({ initials, size = 32, color }: { initials: string; size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        flexShrink: 0,
        background: color ?? T.navyTint,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 700,
        color: color ? '#fff' : T.navy,
      }}
    >
      {initials}
    </div>
  );
}

// ── Generic tinted pill
export function Pill({ label, c, bg, dot = true }: { label: string; c: string; bg: string; dot?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: dot ? '3px 10px 3px 8px' : '3px 10px',
        borderRadius: 999,
        background: bg,
        color: c,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: -0.1,
        whiteSpace: 'nowrap',
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />}
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status];
  return <Pill label={s.label} c={s.c} bg={s.bg} />;
}

export function StageChip({ stage }: { stage: Stage }) {
  const s = STAGE[stage];
  return <Pill label={s.label} c={s.c} bg={s.bg} dot={false} />;
}

export function SevDot({ sev, size = 8 }: { sev: Severity; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: SEV[sev].c, flexShrink: 0, display: 'inline-block' }} />;
}

// ── Horizontal bar
export function Bar({ value, height = 7, color, track }: { value: number; height?: number; color?: string; track?: string }) {
  return (
    <div style={{ height, borderRadius: height, background: track ?? T.track, overflow: 'hidden' }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: '100%',
          borderRadius: height,
          background: color ?? T.navy,
          transition: 'width .18s cubic-bezier(.32,.72,0,1)',
        }}
      />
    </div>
  );
}

// ── Coverage ring (mini donut for list rows / inline)
export function Ring({
  value = 0,
  size = 52,
  stroke = 5,
  color = T.navy,
  label,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray .18s cubic-bezier(.32,.72,0,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...mono, fontSize: size * 0.32, fontWeight: 800, letterSpacing: -0.5, color: T.ink }}>{Math.round(v)}</div>
        {label && <div style={{ fontSize: 8, fontWeight: 700, color: T.faint, letterSpacing: 0.4 }}>{label}</div>}
      </div>
    </div>
  );
}

// ── Hero coverage donut — navy ring on a hairline track, big mono % centre
export function Donut({
  value = 0,
  size = 188,
  stroke = 16,
  color = T.navy,
  sub,
  countUp = false,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  color?: string;
  sub?: string;
  countUp?: boolean;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = Math.max(0, Math.min(100, value));
  const animated = useCountUp(target, 900, countUp);
  const cov = countUp ? animated : target;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(cov / 100) * c} ${c}`}
          style={{ transition: countUp ? 'none' : 'stroke-dasharray .18s cubic-bezier(.32,.72,0,1)' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...mono, fontSize: size * 0.27, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1, color }}>
          {Math.round(cov)}
          <span style={{ fontSize: size * 0.12, color: T.muted, fontWeight: 700 }}>%</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginTop: 5, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          verified
        </div>
        {sub && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Zone coverage bars (sorted high → low)
export function ZoneBars({ zones }: { zones: Zone[] }) {
  const sorted = [...zones].sort((a, b) => b.coverage - a.coverage);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sorted.map((z) => (
        <div key={z.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: T.ink }}>{z.name}</span>
            <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: T.muted }}>{z.coverage}%</span>
          </div>
          <Bar value={z.coverage} color={z.coverage >= 100 ? T.teal : z.coverage < 40 ? T.blue : T.navy} />
        </div>
      ))}
    </div>
  );
}

// ── Coverage-over-time sparkline — navy line, teal end dot, dates beneath
export function Sparkline({
  points,
  width = 300,
  height = 56,
  showDates = true,
}: {
  points: { date: string; coverage: number }[];
  width?: number;
  height?: number;
  showDates?: boolean;
}) {
  if (points.length === 0) return null;
  const pad = 6;
  const w = width;
  const h = height;
  const n = points.length;
  const x = (i: number) => (n === 1 ? w / 2 : pad + (i * (w - pad * 2)) / (n - 1));
  const y = (v: number) => h - pad - (v / 100) * (h - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.coverage).toFixed(1)}`).join(' ');
  const last = points[n - 1];
  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={T.hairline} strokeWidth={1} />
        <path d={d} fill="none" stroke={T.navy} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={x(n - 1)} cy={y(last.coverage)} r={4} fill={T.teal} />
      </svg>
      {showDates && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {points.map((p, i) => (
            <span key={i} style={{ ...mono, fontSize: 9.5, color: T.faint, fontWeight: 600 }}>
              {p.coverage}%
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Button
export function Button({
  children,
  primary,
  icon,
  onClick,
  style = {},
  full,
  danger,
}: {
  children: ReactNode;
  primary?: boolean;
  icon?: IconName;
  onClick?: () => void;
  style?: CSSProperties;
  full?: boolean;
  danger?: boolean;
}) {
  const [d, setD] = useState(false);
  const accent = danger ? T.red : T.navy;
  return (
    <button
      onClick={() => {
        haptic();
        onClick?.();
      }}
      onPointerDown={() => setD(true)}
      onPointerUp={() => setD(false)}
      onPointerLeave={() => setD(false)}
      style={{
        flex: full ? 1 : undefined,
        height: 50,
        padding: '0 18px',
        borderRadius: 13,
        border: primary ? 'none' : `1px solid ${T.hairline}`,
        background: primary ? accent : T.surface,
        color: primary ? '#fff' : danger ? T.red : T.ink,
        fontSize: 15.5,
        fontWeight: 700,
        fontFamily: T.font,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: primary ? '0 6px 18px rgba(30,58,102,0.22)' : 'none',
        transform: d ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform .12s, background .12s',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={19} color={primary ? '#fff' : danger ? T.red : T.ink} />}
      {children}
    </button>
  );
}

// ── Card — white surface, hairline border, soft shadow
export function Card({
  children,
  style = {},
  onClick,
  pressable,
}: {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  pressable?: boolean;
}) {
  const [d, setD] = useState(false);
  return (
    <div
      onClick={
        onClick
          ? () => {
              haptic();
              onClick();
            }
          : undefined
      }
      onPointerDown={pressable ? () => setD(true) : undefined}
      onPointerUp={() => setD(false)}
      onPointerLeave={() => setD(false)}
      style={{
        background: T.surface,
        borderRadius: 16,
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 1px 2px rgba(27,42,61,0.04), 0 6px 16px rgba(27,42,61,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transform: d ? 'scale(0.99)' : 'scale(1)',
        transition: 'transform .12s',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Section label
export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '10px 2px 10px' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{children}</div>
      {right}
    </div>
  );
}

// ── Large-title header
export function ScreenHeader({ title, sub, trailing }: { title: string; sub?: string; trailing?: ReactNode }) {
  return (
    <div style={{ padding: '4px 20px 8px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.8, lineHeight: '38px', color: T.ink }}>{title}</h1>
        {trailing}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: T.muted }}>{sub}</div>}
    </div>
  );
}

// ── Filter chips (horizontal). `tone` colors the active chip per item (e.g. amber for Needs review).
export function Chips({
  items,
  active,
  onPick,
  tones,
}: {
  items: string[];
  active: string;
  onPick?: (item: string) => void;
  tones?: Record<string, string>;
}) {
  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '2px 20px 12px', overflowX: 'auto' }}>
      {items.map((it) => {
        const on = it === active;
        const tone = tones?.[it] ?? T.navy;
        return (
          <button
            key={it}
            onClick={() => {
              haptic();
              onPick?.(it);
            }}
            style={{
              flexShrink: 0,
              border: `1px solid ${on ? tone : T.hairline}`,
              cursor: 'pointer',
              padding: '7px 13px',
              borderRadius: 999,
              fontFamily: T.font,
              fontSize: 13.5,
              fontWeight: 600,
              letterSpacing: -0.1,
              background: on ? tone : T.surface,
              color: on ? '#fff' : T.muted,
              transition: 'all .18s cubic-bezier(.32,.72,0,1)',
            }}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

// ── Meta table row (report header / facts)
export function KeyVal({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '7px 0', borderBottom: `1px solid ${T.hairline2}` }}>
      <span style={{ fontSize: 13.5, color: T.muted, fontWeight: 500 }}>{k}</span>
      <span style={{ fontSize: 13.5, color: T.ink, fontWeight: 600, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

// ── Empty state
export function EmptyState({ icon, title, sub }: { icon: IconName; title: string; sub?: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 28px', color: T.muted }}>
      <div style={{ display: 'inline-flex', padding: 16, borderRadius: 999, background: T.surface2, marginBottom: 14 }}>
        <Icon name={icon} size={26} color={T.faint} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, marginTop: 5, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

// ── Photo gallery (horizontal thumbnails) + tap-to-open lightbox
export function Gallery({ ids }: { ids: string[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const srcs = ids.map(photoSrc).filter((s): s is string => !!s);
  useBackLayer(open !== null, () => setOpen(null));
  if (srcs.length === 0) return null;
  return (
    <>
      <div className="no-scrollbar" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
        {srcs.map((src, i) => (
          <button
            key={i}
            onClick={() => {
              haptic();
              setOpen(i);
            }}
            style={{ flexShrink: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              style={{ width: 118, height: 88, objectFit: 'cover', borderRadius: 12, border: `1px solid ${T.hairline}`, display: 'block' }}
            />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox srcs={srcs} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  );
}

function Lightbox({ srcs, index, onIndex, onClose }: { srcs: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const prev = () => onIndex((index - 1 + srcs.length) % srcs.length);
  const next = () => onIndex((index + 1) % srcs.length);
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 600,
        background: 'rgba(8,12,18,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn .2s ease',
      }}
    >
      <img src={srcs[index]} alt="" style={{ maxWidth: '92%', maxHeight: '78%', borderRadius: 12, objectFit: 'contain' }} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', right: 18, border: 'none', background: 'rgba(255,255,255,0.14)', borderRadius: 999, padding: 9, cursor: 'pointer', color: '#fff', display: 'flex' }}
      >
        <Icon name="close" size={20} color="#fff" />
      </button>
      {srcs.length > 1 && (
        <>
          <NavArrow side="left" onClick={prev} />
          <NavArrow side="right" onClick={next} />
          <div style={{ ...mono, position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 20px)', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>
            {index + 1} / {srcs.length}
          </div>
        </>
      )}
    </div>
  );
}

function NavArrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ position: 'absolute', [side]: 14, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(255,255,255,0.14)', borderRadius: 999, padding: 10, cursor: 'pointer', display: 'flex' }}
    >
      <Icon name={side === 'left' ? 'chevronL' : 'chevron'} size={22} color="#fff" />
    </button>
  );
}
