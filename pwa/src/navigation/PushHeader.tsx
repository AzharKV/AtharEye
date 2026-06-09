// Translucent back/push header bar and round trailing icon button.
import type { ReactNode } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { useNav } from './Navigator';

export function PushHeader({
  title,
  trailing,
  onBack,
  transparent,
}: {
  title: string;
  trailing?: ReactNode;
  onBack?: () => void;
  transparent?: boolean;
}) {
  const nav = useNav();
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 'calc(env(safe-area-inset-top) + 12px) 14px 10px',
        background: transparent ? 'transparent' : 'rgba(12,15,18,0.78)',
        backdropFilter: transparent ? 'none' : 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: transparent ? 'none' : 'blur(18px) saturate(160%)',
        borderBottom: transparent ? 'none' : `1px solid ${T.hairline}`,
      }}
    >
      <button
        onClick={() => (onBack || nav.pop)()}
        aria-label="Back"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          border: `1px solid ${T.hairline}`,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Icon name="chevronL" size={20} color={T.text} />
      </button>
      <div
        style={{
          flex: 1,
          fontSize: 17,
          fontWeight: 700,
          color: T.text,
          letterSpacing: -0.3,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </div>
      <div style={{ minWidth: 38, display: 'flex', justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

export function RoundBtn({
  icon,
  onClick,
  label,
}: {
  icon: IconName;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => {
        haptic();
        onClick?.();
      }}
      aria-label={label ?? icon}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: `1px solid ${T.hairline}`,
        background: 'rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      <Icon name={icon} size={20} color={T.muted} />
    </button>
  );
}
