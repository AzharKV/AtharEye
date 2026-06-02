// Brand.tsx — Mark (the actual product app icon) + Wordmark lockup.
// Brand: navy + teal, AtharEye wordmark. The mark renders the real home-screen
// icon (drone + scanning eye) so the in-app lockup matches the installed icon
// exactly — owner direction; supersedes the design-source's separate stylized
// "scan-aperture eye" glyph (see SPEC §15).
import { T } from '../theme';

// Public asset; BASE_URL keeps it correct under any deploy base path.
const ICON_SRC = `${import.meta.env.BASE_URL}icon-192.png`;

export function Mark({ size = 30, r }: { size?: number; r?: number }) {
  return (
    <img
      src={ICON_SRC}
      alt="Athar Eye"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        // ~iOS squircle ratio; matches the icon's own rounded corners
        borderRadius: r ?? Math.round(size * 0.22),
        flexShrink: 0,
        display: 'block',
        objectFit: 'cover',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    />
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
