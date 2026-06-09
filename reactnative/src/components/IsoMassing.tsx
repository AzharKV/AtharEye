// Stylized isometric floor-plan diagram (SPEC §8.5), ported to react-native-svg.
// Built = teal, partial = grey, missing = red (hatched). Scales to container width via onLayout.
import { Fragment, useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Line, Pattern, Polygon, Text as SvgText } from 'react-native-svg';
import type { PlanRoom } from '../types';

export type IsoKind = 'built' | 'progress' | 'missing';
export interface IsoFill {
  top: string;
  right: string;
  left: string;
  glow?: string;
}

export function isoColorFor(pct: number): IsoKind {
  if (pct >= 70) return 'built';
  if (pct >= 45) return 'progress';
  return 'missing';
}

const ISO_FILL: Record<IsoKind, IsoFill> = {
  built: { top: '#16C2CA', right: '#0F8E94', left: '#0A6166', glow: 'rgba(20,184,192,0.35)' },
  progress: { top: '#2C7C84', right: '#1E5C62', left: '#143F43', glow: 'rgba(44,124,132,0.30)' },
  missing: { top: '#E5484D', right: '#A23438', left: '#6E2326', glow: 'rgba(229,72,77,0.28)' },
};

// Report screen's variant: partial reads as neutral grey (BIM-vs-as-built legend).
export const isoFills: Record<IsoKind, IsoFill> = {
  built: { top: '#16C2CA', right: '#0F8E94', left: '#0A6166' },
  progress: { top: '#C7D2DC', right: '#8A949E', left: '#5A636C' },
  missing: { top: '#E5484D', right: '#A23438', left: '#6E2326' },
};

let _hatchSeq = 0;

interface IsoMassingProps {
  rooms: PlanRoom[];
  tw?: number;
  th?: number;
  wallH?: number;
  pad?: number;
  labels?: boolean;
  fills?: Record<IsoKind, IsoFill>;
}

export function IsoMassing({ rooms, tw = 30, th = 17, wallH = 12, pad = 26, labels = true, fills }: IsoMassingProps) {
  const FILL = fills || ISO_FILL;
  const [hatchId] = useState(() => 'iso-hatch-' + ++_hatchSeq);
  const [cw, setCw] = useState(0);

  const maxX = Math.max(...rooms.map((r) => r.x + r.w));
  const maxY = Math.max(...rooms.map((r) => r.y + r.h));
  const proj = (gx: number, gy: number): [number, number] => [(gx - gy) * tw, (gx + gy) * th];

  const corners = [proj(0, 0), proj(maxX, 0), proj(maxX, maxY), proj(0, maxY)];
  const minSX = Math.min(...corners.map((c) => c[0]));
  const maxSX = Math.max(...corners.map((c) => c[0]));
  const minSY = corners[0][1];
  const maxSY = proj(maxX, maxY)[1] + wallH;
  const W = maxSX - minSX + pad * 2;
  const H = maxSY - minSY + pad * 2;
  const ox = pad - minSX;
  const oy = pad - minSY;
  const P = (gx: number, gy: number): [number, number] => {
    const [sx, sy] = proj(gx, gy);
    return [ox + sx, oy + sy];
  };
  const ptsStr = (arr: [number, number][]) => arr.map((p) => p.join(',')).join(' ');

  return (
    <View onLayout={(e) => setCw(e.nativeEvent.layout.width)} style={{ width: '100%' }}>
      {cw > 0 ? (
        <Svg width={cw} height={cw * (H / W)} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <Pattern id={hatchId} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <Line x1="0" y1="0" x2="0" y2="6" stroke="#E5484D" strokeOpacity={0.55} strokeWidth={1.4} />
            </Pattern>
          </Defs>
          {rooms.map((r) => {
            const kind = isoColorFor(r.pct);
            const f = FILL[kind];
            const A = P(r.x, r.y);
            const B = P(r.x + r.w, r.y);
            const C = P(r.x + r.w, r.y + r.h);
            const D = P(r.x, r.y + r.h);
            const down = (p: [number, number]): [number, number] => [p[0], p[1] + wallH];
            const top: [number, number][] = [A, B, C, D];
            const rightWall: [number, number][] = [B, C, down(C), down(B)];
            const leftWall: [number, number][] = [D, C, down(C), down(D)];
            const center = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
            return (
              <Fragment key={r.name}>
                <Polygon points={ptsStr(leftWall)} fill={f.left} />
                <Polygon points={ptsStr(rightWall)} fill={f.right} />
                <Polygon
                  points={ptsStr(top)}
                  fill={f.top}
                  fillOpacity={kind === 'missing' ? 0.32 : 0.92}
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={1}
                />
                {kind === 'missing' ? (
                  <Polygon
                    points={ptsStr(top)}
                    fill={`url(#${hatchId})`}
                    stroke="#E5484D"
                    strokeOpacity={0.7}
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                  />
                ) : null}
                {labels ? (
                  <SvgText
                    x={center[0]}
                    y={center[1] + 3}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontWeight="700"
                    fill={kind === 'missing' ? '#FFD9DA' : 'rgba(255,255,255,0.92)'}
                  >
                    {r.pct}%
                  </SvgText>
                ) : null}
              </Fragment>
            );
          })}
        </Svg>
      ) : null}
    </View>
  );
}
