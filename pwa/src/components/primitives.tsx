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

// Status = colored dot + colored label, no background (design .status).
export function StatusPill({ status }: { status: Status }) {
  const s = STATUS[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, color: s.c, whiteSpace: 'nowrap' }}>
      <span style={{ width: 7, height: 7, borderRadius: 7, background: s.c }} />
      {s.label}
    </span>
  );
}

// Stage = tinted pill with a leading dot (design .chip).
export function StageChip({ stage }: { stage: Stage }) {
  const s = STAGE[stage];
  return <Pill label={s.label} c={s.c} bg={s.bg} />;
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
        <div style={{ ...mono, fontSize: size * 0.27, fontWeight: 700, letterSpacing: -1, lineHeight: 1, color: T.ink }}>
          {Math.round(cov)}
          <span style={{ fontSize: size * 0.27 * 0.42, color: T.muted, verticalAlign: 'top' }}>%</span>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginTop: 4 }}>verified</div>
        {sub && <div style={{ ...mono, fontSize: 10.5, color: T.muted, marginTop: 1 }}>{sub}</div>}
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
            <span style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{z.name}</span>
            <span style={{ ...mono, fontSize: 12.5, fontWeight: 700, color: z.coverage >= 100 ? T.teal : T.ink }}>{z.coverage}%</span>
          </div>
          <Bar value={z.coverage} height={8} color={z.coverage >= 100 ? T.teal : T.navy} />
        </div>
      ))}
    </div>
  );
}

// ── Coverage-over-time sparkline — navy line + soft area fill, teal end dot (design Sparkline)
export function Sparkline({
  points,
  width = 326,
  height = 70,
}: {
  points: { date: string; coverage: number }[];
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const padX = 6;
  const padY = 8;
  const w = width;
  const h = height;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const xy = points.map((p, i) => [padX + innerW * (i / (points.length - 1)), padY + innerH * (1 - p.coverage / 100)]);
  const d = xy.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${d} L${xy[xy.length - 1][0].toFixed(1)} ${h - padY} L${xy[0][0].toFixed(1)} ${h - padY} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="spk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={T.navy} stopOpacity="0.14" />
          <stop offset="1" stopColor={T.navy} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spk)" />
      <path d={d} fill="none" stroke={T.navy} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {xy.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={i === xy.length - 1 ? 4 : 2.4} fill={i === xy.length - 1 ? T.teal : T.navy} stroke="#fff" strokeWidth={1.4} />
      ))}
    </svg>
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
        borderRadius: 14,
        border: `1px solid ${T.hairline}`,
        boxShadow: '0 1px 2px rgba(27,42,61,0.04), 0 1px 1px rgba(27,42,61,0.03)',
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

// ── App bar — white, 2px navy underline, compact 22px title (design .appbar). Sticky so it stays
//    put while the body scrolls; children below render the search / filter rows.
export function ScreenHeader({ title, sub, trailing, children }: { title: string; sub?: string; trailing?: ReactNode; children?: ReactNode }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: T.surface,
        borderBottom: `2px solid ${T.navy}`,
        padding: 'calc(env(safe-area-inset-top) + 14px) 20px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: T.ink }}>{title}</h1>
          {sub && <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500, color: T.muted }}>{sub}</div>}
        </div>
        {trailing}
      </div>
      {children}
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

export function Lightbox({ srcs, index, onIndex, onClose }: { srcs: string[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
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
