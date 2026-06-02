// Brand.tsx — Mark (scan-aperture eye) + Wordmark lockup. Ported verbatim from
// design-source/app/app-ui.jsx. Brand: navy + teal, AtharEye wordmark.
import { T } from '../theme';

export function Mark({ size = 30, r = 9 }: { size?: number; r?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        flexShrink: 0,
        background: 'radial-gradient(120% 120% at 30% 25%, #18242B, #0C151B)',
        border: `1px solid ${T.accent}55`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="9.5"
          stroke={T.accent}
          strokeWidth="1.6"
          strokeDasharray="3 3"
          opacity="0.5"
        />
        <circle cx="12" cy="12" r="5.5" stroke={T.accent} strokeWidth="1.8" />
        <circle cx="12" cy="12" r="2" fill={T.accent} />
      </svg>
    </div>
  );
}

export function Wordmark({ size = 19, sub }: { size?: number; sub?: string }) {
  return (
    <div style={{ lineHeight: 1 }}>
      <div style={{ fontSize: size, fontWeight: 800, letterSpacing: -0.5, color: T.text }}>
        Athar<span style={{ color: T.accent }}>Eye</span>
      </div>
      {sub && (
        <div
          style={{ fontSize: 10.5, fontWeight: 600, color: T.muted, marginTop: 3, letterSpacing: 0.5 }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
