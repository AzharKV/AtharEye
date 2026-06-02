// Icon.tsx — 24px line-icon set + blueprint TypeGlyph, ported to react-native-svg.
// Paths are identical to the PWA's; stroke styling is inherited from a wrapping <G>.
import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

const ICONS: Record<string, ReactNode> = {
  projects: (
    <>
      <Rect x="3" y="4" width="18" height="6" rx="1.6" />
      <Rect x="3" y="14" width="18" height="6" rx="1.6" />
    </>
  ),
  reports: (
    <>
      <Path d="M6 3h9l4 4v14H6zM15 3v4h4" />
      <Path d="M9 12h7M9 16h7" />
    </>
  ),
  scan: (
    <>
      <Path d="M4 8V5.5A1.5 1.5 0 015.5 4H8M16 4h2.5A1.5 1.5 0 0120 5.5V8M20 16v2.5a1.5 1.5 0 01-1.5 1.5H16M8 20H5.5A1.5 1.5 0 014 18.5V16" />
      <Path d="M4 12h16" />
    </>
  ),
  settings: (
    <>
      <Circle cx="12" cy="12" r="3.2" />
      <Path d="M12 3v2.4M12 18.6V21M21 12h-2.4M5.4 12H3M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7M18.4 18.4l-1.7-1.7M7.3 7.3L5.6 5.6" />
    </>
  ),
  chevron: <Path d="M9 5l7 7-7 7" />,
  chevronL: <Path d="M15 5l-7 7 7 7" />,
  chevronDown: <Path d="M6 9l6 6 6-6" />,
  pin: (
    <>
      <Path d="M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11z" />
      <Circle cx="12" cy="10" r="2.5" />
    </>
  ),
  share: (
    <>
      <Path d="M12 3v13M12 3L8 7M12 3l4 4" />
      <Path d="M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="M21 21l-4-4" />
    </>
  ),
  pdf: (
    <>
      <Path d="M6 3h9l4 4v14H6zM15 3v4h4" />
      <Path d="M9 13h1.4a1.4 1.4 0 010 2.8H9zM9 13v6M13.5 13v6M13.5 13h2.2M13.5 16h1.6" />
    </>
  ),
  layers: <Path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  clock: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Path d="M12 8v4l3 2" />
    </>
  ),
  area: (
    <>
      <Rect x="4" y="4" width="16" height="16" rx="2" />
      <Path d="M4 9h16M9 4v16" />
    </>
  ),
  alert: (
    <>
      <Path d="M12 4l9 16H3z" />
      <Path d="M12 10v4M12 17v.4" />
    </>
  ),
  check: <Path d="M5 13l4 4L19 7" />,
  trash: (
    <>
      <Path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" />
      <Path d="M10 11v6M14 11v6" />
    </>
  ),
  checkCircle: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M8 12l3 3 5-6" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
    </>
  ),
  close: <Path d="M6 6l12 12M18 6L6 18" />,
  scans: <Path d="M3 7l9-4 9 4-9 4-9-4zM3 7v6l9 4 9-4V7" />,
  team: (
    <>
      <Circle cx="9" cy="9" r="3.2" />
      <Path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
      <Path d="M16 6.2A3.2 3.2 0 0118 12M21 19c0-2.4-1.5-4.2-3.5-4.8" />
    </>
  ),
  bell: (
    <>
      <Path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" />
      <Path d="M10 19a2 2 0 004 0" />
    </>
  ),
  lock: (
    <>
      <Rect x="5" y="10" width="14" height="10" rx="2" />
      <Path d="M8 10V7a4 4 0 018 0v3" />
    </>
  ),
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v5M12 8v.4" />
    </>
  ),
  cube: <Path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5" />,
  bolt: <Path d="M13 3L5 13h6l-1 8 8-10h-6z" />,
  ruler: (
    <>
      <Rect x="2.5" y="8" width="19" height="8" rx="1.5" />
      <Path d="M7 8v3M11 8v4M15 8v3M19 8v4" />
    </>
  ),
  target: (
    <>
      <Circle cx="12" cy="12" r="8" />
      <Circle cx="12" cy="12" r="3.4" />
    </>
  ),
  upload: (
    <>
      <Path d="M12 16V4M12 4L8 8M12 4l4 4" />
      <Path d="M5 16v3a1 1 0 001 1h12a1 1 0 001-1v-3" />
    </>
  ),
  grid: (
    <>
      <Rect x="4" y="4" width="7" height="7" rx="1" />
      <Rect x="13" y="4" width="7" height="7" rx="1" />
      <Rect x="4" y="13" width="7" height="7" rx="1" />
      <Rect x="13" y="13" width="7" height="7" rx="1" />
    </>
  ),
  mail: (
    <>
      <Rect x="3" y="5" width="18" height="14" rx="2" />
      <Path d="M4 7l8 6 8-6" />
    </>
  ),
  message: <Path d="M4 5h16v11H9l-4 4z" />,
  copy: (
    <>
      <Rect x="9" y="9" width="11" height="11" rx="2" />
      <Path d="M5 15V5a2 2 0 012-2h8" />
    </>
  ),
  airdrop: (
    <>
      <Path d="M7 17a7 7 0 0110 0M10 14a3.2 3.2 0 014 0" />
      <Circle cx="12" cy="20" r="1" />
    </>
  ),
  sun: (
    <>
      <Circle cx="12" cy="12" r="4" />
      <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" />
    </>
  ),
};

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  color?: string;
}

export function Icon({ name, size = 24, stroke = 2, color = '#F4F6F8' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {ICONS[name]}
      </G>
    </Svg>
  );
}

// ── Blueprint type glyphs (geometric line motifs for thumbnail tiles)
const GLYPHS: Record<string, ReactNode> = {
  storefront: <Path d="M4 9l1.4-4h13.2L20 9M4 9v10h16V9M4 9h16M9 19v-5h6v5" />,
  home: <Path d="M4 11l8-6 8 6M6 10v9h12v-9M10 19v-5h4v5" />,
  office: (
    <>
      <Rect x="6" y="4" width="12" height="16" />
      <Path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" />
    </>
  ),
  warehouse: <Path d="M3 10l9-5 9 5v9H3zM8 19v-6h8v6" />,
  cup: <Path d="M6 8h10v5a5 5 0 01-10 0zM16 9h2.5a2 2 0 010 4H16" />,
  building: (
    <>
      <Rect x="6" y="4" width="12" height="16" />
      <Path d="M10 8h4M10 12h4M10 16h4" />
    </>
  ),
};

export type GlyphName = keyof typeof GLYPHS;

export const TYPE_GLYPH: Record<string, GlyphName> = {
  'Shop refit': 'storefront',
  'Residential extension': 'home',
  Residential: 'home',
  'Commercial · Level 3': 'office',
  Industrial: 'warehouse',
  Hospitality: 'cup',
  default: 'building',
};

interface TypeGlyphProps {
  name: GlyphName;
  size?: number;
  stroke?: number;
  color?: string;
}

export function TypeGlyph({ name, size = 24, stroke = 1.8, color = '#14B8C0' }: TypeGlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {GLYPHS[name]}
      </G>
    </Svg>
  );
}
