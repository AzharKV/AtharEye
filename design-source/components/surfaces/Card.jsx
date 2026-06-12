/* OptiSync — Card. White surface, hairline border, soft radius. */
export function Card({ pad = true, children, style, onClick, ...rest }) {
  return (
    <div className={'card' + (pad ? ' card-pad' : '')} style={style} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}

/* SectionHeader — label + optional Add affordance, used atop card sections. */
export function SectionHeader({ label, count, onAdd, right }) {
  return (
    <div className="row between" style={{ marginBottom: 10 }}>
      <div className="row gap8" style={{ alignItems: 'baseline' }}>
        <div className="section-label" style={{ margin: 0 }}>{label}</div>
        {count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{count}</span>}
      </div>
      {onAdd ? (
        <button onClick={onAdd} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>Add
        </button>
      ) : right}
    </div>
  );
}
