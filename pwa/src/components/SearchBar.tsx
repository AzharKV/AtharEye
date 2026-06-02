// SearchBar.tsx — inline iOS-style search field used by the list screens.
import { useEffect, useRef } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from './Icon';

export function SearchBar({
  value,
  onChange,
  onCancel,
  placeholder = 'Search',
}: {
  value: string;
  onChange: (v: string) => void;
  onCancel: () => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div style={{ padding: '2px 20px 10px', display: 'flex', gap: 10, alignItems: 'center' }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: T.surface2,
          border: `1px solid ${T.hairline}`,
          borderRadius: 12,
          padding: '0 10px 0 12px',
          height: 42,
        }}
      >
        <Icon name="search" size={18} color={T.muted} />
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          enterKeyHint="search"
          autoCapitalize="none"
          autoCorrect="off"
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: T.text,
            fontSize: 16,
            fontWeight: 500,
            fontFamily: T.font,
          }}
        />
        {value && (
          <button
            onClick={() => {
              haptic();
              onChange('');
            }}
            aria-label="Clear search"
            style={{
              flexShrink: 0,
              width: 22,
              height: 22,
              borderRadius: 22,
              border: 'none',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="close" size={13} color={T.text} stroke={2.4} />
          </button>
        )}
      </div>
      <button
        onClick={() => {
          haptic();
          onCancel();
        }}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          color: T.accent,
          fontSize: 16,
          fontWeight: 600,
          fontFamily: T.font,
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}
