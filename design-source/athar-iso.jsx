// athar-iso.jsx — Stylized isometric floor-plan / massing diagram (SPEC §8.5)
// Green = built, amber = in progress, red = missing. Geometric only (parallelograms).
// Exports: IsoMassing, isoColorFor

function isoColorFor(pct) {
  if (pct >= 70) return 'built';
  if (pct >= 45) return 'progress';
  return 'missing';
}

const ISO_FILL = {
  built:    { top: '#16C2CA', right: '#0F8E94', left: '#0A6166', glow: 'rgba(20,184,192,0.35)' },
  progress: { top: '#2C7C84', right: '#1E5C62', left: '#143F43', glow: 'rgba(44,124,132,0.30)' },
  missing:  { top: '#E5484D', right: '#A23438', left: '#6E2326', glow: 'rgba(229,72,77,0.28)' },
};

// rooms: [{ name, x, y, w, h, pct }] on an integer grid
function IsoMassing({
  rooms, tw = 30, th = 17, wallH = 12, pad = 26, labels = true, animate = true, fills,
}) {
  const FILL = fills || ISO_FILL;
  // grid extent
  const maxX = Math.max(...rooms.map(r => r.x + r.w));
  const maxY = Math.max(...rooms.map(r => r.y + r.h));
  const proj = (gx, gy) => [ (gx - gy) * tw, (gx + gy) * th ];

  // bounds in screen space
  const corners = [proj(0,0), proj(maxX,0), proj(maxX,maxY), proj(0,maxY)];
  const minSX = Math.min(...corners.map(c => c[0]));
  const maxSX = Math.max(...corners.map(c => c[0]));
  const minSY = corners[0][1];
  const maxSY = proj(maxX, maxY)[1] + wallH;
  const W = (maxSX - minSX) + pad * 2;
  const H = (maxSY - minSY) + pad * 2;
  const ox = pad - minSX, oy = pad - minSY;
  const P = (gx, gy) => { const [sx, sy] = proj(gx, gy); return [ox + sx, oy + sy]; };
  const pts = arr => arr.map(p => p.join(',')).join(' ');

  const hatchId = 'iso-hatch-' + Math.random().toString(36).slice(2, 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}
      style={{ display: 'block', width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <pattern id={hatchId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#E5484D" strokeOpacity="0.55" strokeWidth="1.4" />
        </pattern>
      </defs>
      {rooms.map((r, i) => {
        const kind = isoColorFor(r.pct);
        const f = FILL[kind];
        const A = P(r.x, r.y), B = P(r.x + r.w, r.y), C = P(r.x + r.w, r.y + r.h), D = P(r.x, r.y + r.h);
        const down = p => [p[0], p[1] + wallH];
        const top = [A, B, C, D];
        const rightWall = [B, C, down(C), down(B)];
        const leftWall = [D, C, down(C), down(D)];
        const center = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
        return (
          <g key={r.name}>
            {/* walls */}
            <polygon points={pts(leftWall)} fill={f.left} />
            <polygon points={pts(rightWall)} fill={f.right} />
            {/* top face */}
            <polygon points={pts(top)} fill={f.top} fillOpacity={kind === 'missing' ? 0.32 : 0.92}
              stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            {kind === 'missing' && <polygon points={pts(top)} fill={`url(#${hatchId})`} stroke="#E5484D"
              strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="4 3" />}
            {labels && (
              <text x={center[0]} y={center[1] + 3} textAnchor="middle"
                fontFamily='-apple-system, system-ui' fontSize="9.5" fontWeight="700"
                fill={kind === 'missing' ? '#FFD9DA' : 'rgba(255,255,255,0.92)'}
                style={{ pointerEvents: 'none' }}>{r.pct}%</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Demo floor plan for Byres Road retail unit (rooms tile a 6×5 grid)
const BYRES_PLAN = [
  { name: 'Shopfront',  x: 0, y: 0, w: 6, h: 1, pct: 70 },
  { name: 'Shop Floor', x: 0, y: 1, w: 4, h: 3, pct: 88 },
  { name: 'Stock Room', x: 4, y: 1, w: 2, h: 2, pct: 62 },
  { name: 'Staff WC',   x: 4, y: 3, w: 2, h: 1, pct: 96 },
  { name: 'Rear Lobby', x: 0, y: 4, w: 6, h: 1, pct: 54 },
];

Object.assign(window, { IsoMassing, isoColorFor, BYRES_PLAN });
