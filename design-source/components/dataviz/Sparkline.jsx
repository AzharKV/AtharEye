/* OptiSync — Sparkline. Coverage-over-time area line; last point teal. */
export function Sparkline({ points = [], w = 326, h = 70 }) {
  const pts = points.map(p => (typeof p === 'number' ? p : p.coverage));
  if (pts.length < 2) return null;
  const max = 100, padX = 6, padY = 8;
  const innerW = w - padX * 2, innerH = h - padY * 2;
  const xy = pts.map((p, i) => [padX + innerW * (i / (pts.length - 1)), padY + innerH * (1 - p / max)]);
  const d = xy.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L${xy[xy.length - 1][0].toFixed(1)} ${h - padY} L${xy[0][0].toFixed(1)} ${h - padY} Z`;
  const gid = 'spk' + Math.round(w) + 'x' + Math.round(h);
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--navy)" stopOpacity=".14" /><stop offset="1" stopColor="var(--navy)" stopOpacity="0" /></linearGradient></defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={d} fill="none" stroke="var(--navy)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {xy.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === xy.length - 1 ? 4 : 2.4} fill={i === xy.length - 1 ? 'var(--teal)' : 'var(--navy)'} stroke="#fff" strokeWidth="1.4" />)}
    </svg>
  );
}
