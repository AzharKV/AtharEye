/* OptiSync — Donut. Coverage % ring with centred numeric. */
const { useState, useEffect } = React;
export function Donut({ value = 0, size = 132, stroke = 13, color, label = 'coverage', sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [v, setV] = useState(value);
  useEffect(() => { setV(value); }, [value]);
  const ringColor = color || (value >= 100 ? 'var(--teal)' : 'var(--navy)');
  const fs = size * 0.27;
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--navy-08)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)}
          style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: fs, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>
          {Math.round(v)}<span style={{ fontSize: fs * 0.42, verticalAlign: 'top' }}>%</span>
        </div>
        {label && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontWeight: 600 }}>{label}</div>}
        {sub && <div className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}
