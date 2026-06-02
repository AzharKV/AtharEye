// Skeleton.tsx — app-shell skeleton loaders so lists never show a blank flash
// (CLAUDE_CODE_BUILD.md §4.3 / §5). Sheen is a transform-only translateX overlay
// (GPU-composited, §4.2). Shapes mirror the real project/report cards.
import type { CSSProperties } from 'react';
import { T } from '../theme';

export function SkeletonBlock({
  w = '100%',
  h = 14,
  radius = 7,
  style = {},
}: {
  w?: number | string;
  h?: number | string;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: w,
        height: h,
        borderRadius: radius,
        background: T.surface2,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
          animation: 'shimmerX 1.4s ease-in-out infinite',
          willChange: 'transform',
        }}
      />
    </div>
  );
}

// One project/report list-card skeleton (ring/tile + two text lines + badge).
export function SkeletonCard() {
  return (
    <div
      style={{
        background: T.surface,
        borderRadius: 18,
        border: `1px solid ${T.hairline}`,
        padding: 14,
        display: 'flex',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <SkeletonBlock w={52} h={52} radius={26} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <SkeletonBlock w="62%" h={15} />
        <SkeletonBlock w="44%" h={12} />
        <SkeletonBlock w={86} h={18} radius={8} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 20px 8px' }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
