// Athar Eye UI kit atoms. ONE teal hero per screen; structural elements grey; red only for missing/critical.
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { STATUS, T } from '../theme';
import type { ProjectStatus } from '../types';
import { haptic } from '../lib/haptic';
import { Icon } from './Icon';
import type { IconName } from './Icon';
import { TYPE_GLYPH, TypeGlyph } from './Icon';

// ── Team avatar
export function Avatar({
  initials,
  size = 30,
  ring,
}: {
  initials: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        flexShrink: 0,
        background: T.surfaceHi,
        border: ring ? `2px solid ${T.bg}` : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.36,
        fontWeight: 700,
        color: T.muted,
        fontFamily: T.font,
      }}
    >
      {initials}
    </div>
  );
}

// ── Status badge — quiet neutral chip + dot
export function StatusBadge({ status, small = false }: { status: ProjectStatus; small?: boolean }) {
  const s = STATUS[status] || STATUS['On Track'];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: small ? '3px 9px 3px 8px' : '4px 11px 4px 9px',
        borderRadius: 8,
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${T.hairline}`,
        color: T.text,
        fontSize: small ? 11.5 : 12.5,
        fontWeight: 600,
        letterSpacing: -0.1,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 6, background: s.c }} />
      {s.label}
    </span>
  );
}

// ── Progress bar — grey by default (data); pass color for exceptions
export function Bar({
  value,
  height = 6,
  color,
  track,
}: {
  value: number;
  height?: number;
  color?: string;
  track?: string;
}) {
  return (
    <div style={{ height, borderRadius: height, background: track || T.track, overflow: 'hidden' }}>
      <div
        style={{
          width: `${value}%`,
          height: '100%',
          borderRadius: height,
          background: color || T.bar,
          transition: 'width .8s cubic-bezier(.32,.72,0,1)',
        }}
      />
    </div>
  );
}

// ── Mini ring — grey default; accent for the screen hero
export function Ring({
  value = 0,
  size = 52,
  stroke = 5,
  accent = false,
  label,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  accent?: boolean;
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
          stroke={accent ? T.accent : T.bar}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          style={{ transition: 'stroke-dasharray .7s cubic-bezier(.32,.72,0,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: size * 0.3,
            fontWeight: 800,
            letterSpacing: -0.5,
            color: accent ? T.accent : T.text,
          }}
        >
          {Math.round(v)}
        </div>
        {label && (
          <div style={{ fontSize: 8.5, fontWeight: 700, color: T.faint, letterSpacing: 0.3 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Hero donut — teal gradient arc + glow + teal number (the screen focal point)
export function Donut({
  value = 0,
  size = 188,
  stroke = 18,
  label = 'Covered',
  sub,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cov = Math.max(0, Math.min(100, value));
  const covLen = (cov / 100) * c;
  const gid = 'dg' + Math.round(size);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          inset: '10%',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${T.glow}, transparent 68%)`,
        }}
      />
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={T.accent} />
            <stop offset="1" stopColor={T.accent2} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(229,72,77,0.20)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${covLen} ${c}`}
          style={{ transition: 'stroke-dasharray .15s linear' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: size * 0.28,
            fontWeight: 800,
            letterSpacing: -1.5,
            lineHeight: 1,
            color: T.accent,
          }}
        >
          {Math.round(cov)}
          <span style={{ fontSize: size * 0.13, color: T.muted }}>%</span>
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: T.muted,
            marginTop: 5,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </div>
        {sub && <div style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Blueprint tile — branded thumbnail placeholder (not a fake photo)
let _bpSeq = 0;
export function BlueprintTile({
  type = 'default',
  w = 52,
  h = 52,
  radius = 13,
}: {
  type?: string;
  w?: number;
  h?: number;
  radius?: number;
}) {
  // stable per-instance pattern id (no Math.random → deterministic SSR/markup)
  const id = 'bp' + useState(() => ++_bpSeq)[0];
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(150deg, ${T.surface2}, #0E141A)`,
        border: `1px solid ${T.hairline}`,
      }}
    >
      <svg width={w} height={h} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={id} width="11" height="11" patternUnits="userSpaceOnUse">
            <path
              d="M0 11L11 0M-2 2L2 -2M9 13L13 9"
              stroke={T.accent}
              strokeOpacity="0.14"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${id})`} />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: T.accent,
          opacity: 0.8,
        }}
      >
        <TypeGlyph name={TYPE_GLYPH[type] || TYPE_GLYPH.default} size={Math.round(w * 0.42)} />
      </div>
    </div>
  );
}

// ── Banner blueprint (wide, for headers)
export function BannerBlueprint({ type, style = {} }: { type?: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(150deg,#16202A,#0C141B)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(48deg, transparent 0 11px, rgba(20,184,192,0.07) 11px 12px), repeating-linear-gradient(-48deg, transparent 0 11px, rgba(20,184,192,0.04) 11px 12px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: -6,
          top: '50%',
          transform: 'translateY(-50%)',
          color: T.accent,
          opacity: 0.13,
        }}
      >
        <TypeGlyph name={TYPE_GLYPH[type || 'default'] || 'building'} size={120} stroke={1.2} />
      </div>
    </div>
  );
}

// ── Filter chips
export function Chips({
  items,
  active,
  onPick,
}: {
  items: string[];
  active: string;
  onPick?: (item: string) => void;
}) {
  return (
    <div className="no-scrollbar" style={{ display: 'flex', gap: 8, padding: '4px 20px 10px', overflowX: 'auto' }}>
      {items.map((it) => {
        const on = it === active;
        return (
          <button
            key={it}
            onClick={() => {
              haptic();
              onPick && onPick(it);
            }}
            style={{
              flexShrink: 0,
              border: 'none',
              cursor: 'pointer',
              padding: '8px 14px',
              borderRadius: 11,
              fontFamily: T.font,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: -0.1,
              background: on ? T.accent : T.surface2,
              color: on ? T.onAccent : T.muted,
              transition: 'all .2s cubic-bezier(.32,.72,0,1)',
            }}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

// ── Buttons
export function Button({
  children,
  primary,
  icon,
  onClick,
  style = {},
  full,
}: {
  children: ReactNode;
  primary?: boolean;
  icon?: IconName;
  onClick?: () => void;
  style?: CSSProperties;
  full?: boolean;
}) {
  const [d, setD] = useState(false);
  return (
    <button
      onClick={() => {
        haptic();
        onClick && onClick();
      }}
      onPointerDown={() => setD(true)}
      onPointerUp={() => setD(false)}
      onPointerLeave={() => setD(false)}
      style={{
        flex: full ? 1 : undefined,
        height: 52,
        borderRadius: 14,
        border: primary ? 'none' : `1px solid ${T.hairline}`,
        background: primary ? (d ? T.accentPress : T.accent) : d ? T.surfaceHi : T.surface2,
        color: primary ? T.onAccent : T.text,
        fontSize: 16,
        fontWeight: 700,
        fontFamily: T.font,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        boxShadow: primary ? '0 4px 16px rgba(20,184,192,0.30)' : 'none',
        transform: d ? 'scale(0.985)' : 'scale(1)',
        transition: 'transform .12s, background .12s',
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={20} color={primary ? T.onAccent : T.text} />}
      {children}
    </button>
  );
}

// ── Card
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
        borderRadius: 18,
        border: `1px solid ${T.hairline}`,
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
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        margin: '8px 2px 8px',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: T.muted,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {children}
      </div>
      {right}
    </div>
  );
}

// ── Large title header (with optional back chevron handled by NavStack)
export function ScreenHeader({
  title,
  sub,
  trailing,
}: {
  title: string;
  sub?: string;
  trailing?: ReactNode;
}) {
  return (
    <div style={{ padding: '4px 20px 8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -0.6,
            lineHeight: '38px',
            color: T.text,
          }}
        >
          {title}
        </h1>
        {trailing}
      </div>
      {sub && <div style={{ marginTop: 4, fontSize: 14, fontWeight: 500, color: T.muted }}>{sub}</div>}
    </div>
  );
}
