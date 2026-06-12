// Sheet.tsx — bottom sheet (scrim + slide-up) + reusable form fields for the CRUD editors.
// Owns one system-Back layer (closes the sheet). Used by screens/editors.tsx.
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { useBackLayer } from '../hooks/useBackLayer';
import { Icon } from './Icon';

export function Sheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useBackLayer(true, onClose);
  // Portal to the app card so the sheet stacks above the bottom tab bar (the Navigator's per-screen
  // z-index would otherwise trap it below the tab bar's stacking context).
  const target = typeof document !== 'undefined' ? document.getElementById('app-card') : null;
  const node = (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,35,0.45)', animation: 'scrimIn .2s ease' }} />
      <div
        style={{
          position: 'relative',
          background: T.canvas,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          animation: 'sheetUp .3s cubic-bezier(.32,.72,0,1)',
          boxShadow: '0 -10px 40px rgba(15,23,35,0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', borderBottom: `1px solid ${T.hairline}` }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ width: 34, height: 34, borderRadius: 999, border: 'none', background: T.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="close" size={18} color={T.muted} />
          </button>
        </div>
        <div className="no-scrollbar" style={{ overflowY: 'auto', padding: '16px 18px', WebkitOverflowScrolling: 'touch' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '12px 18px', paddingBottom: 'max(16px, env(safe-area-inset-bottom))', borderTop: `1px solid ${T.hairline}`, display: 'flex', gap: 10, background: T.surface }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
  return target ? createPortal(node, target) : node;
}

const labelStyle: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: T.muted, marginBottom: 7, letterSpacing: 0.2, display: 'block' };
const fieldStyle: React.CSSProperties = {
  width: '100%',
  border: `1px solid ${T.hairline}`,
  borderRadius: 12,
  padding: '11px 13px',
  fontFamily: T.font,
  fontSize: 15,
  color: T.ink,
  background: T.surface,
  outline: 'none',
};

export function TextField({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...fieldStyle, resize: 'none' }} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={fieldStyle} />
      )}
    </label>
  );
}

export function NumberField({ label, value, onChange, suffix, max }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; max?: number }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={labelStyle}>{label}{suffix ? ` (${suffix})` : ''}</span>
      <input
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => {
          const n = Math.max(0, Math.round(Number(e.target.value.replace(/[^0-9]/g, '')) || 0));
          onChange(max != null ? Math.min(max, n) : n);
        }}
        inputMode="numeric"
        style={{ ...fieldStyle, fontVariantNumeric: 'tabular-nums' }}
      />
    </label>
  );
}

export function SelectField<V extends string>({ label, value, options, onChange }: { label: string; value: V; options: readonly V[]; onChange: (v: V) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {options.map((o) => {
          const on = o === value;
          return (
            <button
              key={o}
              onClick={() => {
                haptic();
                onChange(o);
              }}
              style={{ padding: '8px 13px', borderRadius: 999, border: `1px solid ${on ? T.navy : T.hairline}`, background: on ? T.navy : T.surface, color: on ? '#fff' : T.muted, fontWeight: 600, fontSize: 13.5, fontFamily: T.font, cursor: 'pointer' }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
