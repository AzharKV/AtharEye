// Brand.tsx — OptiSync Mark + Wordmark lockup.
// PLACEHOLDER mark: a scan reticle on a navy ground (Blueprint+teal brand). It is
// drawn as inline SVG with brand-fixed colors (navy #1E3A66 + teal #18837E) so it
// reads the same on any surface. The real product logo is swapped in at the brand
// phase (see SPEC §15) — it replaces this SVG + the generated PWA icons.
import { T } from '../theme';

export function Mark({ size = 30, r }: { size?: number; r?: number }) {
  const radius = r ?? Math.round(size * 0.22);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 112 112"
      role="img"
      aria-label="OptiSync"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="112" height="112" rx={(radius / size) * 112} fill="#1E3A66" />
      <circle cx="56" cy="56" r="30" fill="none" stroke="#18837E" strokeWidth="4.5" />
      <circle cx="56" cy="56" r="9" fill="#18837E" />
      <g stroke="#18837E" strokeWidth="4" strokeLinecap="round" opacity="0.65">
        <path d="M56 14 V24" />
        <path d="M56 88 V98" />
        <path d="M14 56 H24" />
        <path d="M88 56 H98" />
      </g>
    </svg>
  );
}

export function Wordmark({ size = 19, sub }: { size?: number; sub?: string }) {
  return (
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: -0.6, color: T.text }}>
        Opti<span style={{ color: T.accent }}>Sync</span>
      </div>
      {sub && (
        <div
          style={{ fontSize: 10.5, fontWeight: 600, color: T.muted, marginTop: 3, letterSpacing: 0.4 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
