// Brand.tsx — OptiSync Mark (the real product app icon) + Wordmark lockup.
// The Mark renders the actual home-screen icon (drone + scanning eye over a building), so the in-app
// lockup matches the installed icon exactly. Same image drives the generated PWA icons.
import { T } from '../theme';

const ICON_SRC = `${import.meta.env.BASE_URL}optisync-logo.jpeg`;

export function Mark({ size = 30, r }: { size?: number; r?: number }) {
  return (
    <img
      src={ICON_SRC}
      alt="OptiSync"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        borderRadius: r ?? Math.round(size * 0.22),
        flexShrink: 0,
        display: 'block',
        objectFit: 'cover',
        border: `1px solid ${T.hairline}`,
      }}
    />
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
