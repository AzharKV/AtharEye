// Athar Eye UI kit atoms (RN port of pwa/src/components/primitives.tsx).
// ONE teal hero per screen; structural elements grey; red only for missing/critical.
// fontWeight is a string (RN-idiomatic). Rings/donut rotate via <G rotation={-90}>;
// the centred number is a separate absolute overlay so it stays upright.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient as SvgLinearGradient,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import { STATUS, T } from '../theme';
import type { ProjectStatus } from '../types';
import { haptic } from '../lib/haptic';
import { fill, shadow } from '../lib/ui';
import { Icon, TYPE_GLYPH, TypeGlyph } from './Icon';
import type { IconName } from './Icon';

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// ── Team avatar
export function Avatar({ initials, size = 30, ring }: { initials: string; size?: number; ring?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: T.surfaceHi,
        borderWidth: ring ? 2 : 0,
        borderColor: ring ? T.bg : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.36, fontWeight: '700', color: T.muted }}>{initials}</Text>
    </View>
  );
}

// ── Status badge — quiet neutral chip + dot
export function StatusBadge({ status, small = false }: { status: ProjectStatus; small?: boolean }) {
  const s = STATUS[status] || STATUS['On Track'];
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingVertical: small ? 3 : 4,
        paddingLeft: small ? 8 : 9,
        paddingRight: small ? 9 : 11,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: T.hairline,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 6, backgroundColor: s.c }} />
      <Text style={{ color: T.text, fontSize: small ? 11.5 : 12.5, fontWeight: '600', letterSpacing: -0.1 }}>
        {s.label}
      </Text>
    </View>
  );
}

// ── Progress bar — grey by default (data); pass color for exceptions
export function Bar({
  value,
  height = 6,
  color,
  track,
}: {
  value: number;
  height?: number;
  color?: string;
  track?: string;
}) {
  return (
    <View style={{ height, borderRadius: height, backgroundColor: track || T.track, overflow: 'hidden' }}>
      <View style={{ width: `${clamp(value)}%`, height: '100%', borderRadius: height, backgroundColor: color || T.bar }} />
    </View>
  );
}

// ── Mini ring — grey default; accent for the screen hero
export function Ring({
  value = 0,
  size = 52,
  stroke = 5,
  accent = false,
  label,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  accent?: boolean;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = clamp(value);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.track} strokeWidth={stroke} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={accent ? T.accent : T.bar}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${(v / 100) * c} ${c}`}
          />
        </G>
      </Svg>
      <View style={[fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: size * 0.3, fontWeight: '800', letterSpacing: -0.5, color: accent ? T.accent : T.text }}>
          {Math.round(v)}
        </Text>
        {label ? (
          <Text style={{ fontSize: 8.5, fontWeight: '700', color: T.faint, letterSpacing: 0.3 }}>{label}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ── Hero donut — teal gradient arc + glow + teal number (the screen focal point)
export function Donut({
  value = 0,
  size = 188,
  stroke = 18,
  label = 'Covered',
  sub,
}: {
  value?: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cov = clamp(value);
  const covLen = (cov / 100) * c;
  const gid = 'dg' + Math.round(size);
  const glowId = 'dgl' + Math.round(size);
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={T.accent} />
            <Stop offset="1" stopColor={T.accent2} />
          </SvgLinearGradient>
          <RadialGradient id={glowId} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#14B8C0" stopOpacity={0.2} />
            <Stop offset="0.68" stopColor="#14B8C0" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size * 0.4} fill={`url(#${glowId})`} />
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(229,72,77,0.20)" strokeWidth={stroke} />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#${gid})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${covLen} ${c}`}
          />
        </G>
      </Svg>
      <View style={[fill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: size * 0.28, fontWeight: '800', letterSpacing: -1.5, color: T.accent }}>
          {Math.round(cov)}
          <Text style={{ fontSize: size * 0.13, color: T.muted }}>%</Text>
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: T.muted,
            marginTop: 5,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        {sub ? <Text style={{ fontSize: 11.5, color: T.faint, marginTop: 2 }}>{sub}</Text> : null}
      </View>
    </View>
  );
}

// ── Blueprint tile — branded thumbnail placeholder (not a fake photo)
let _bpSeq = 0;
export function BlueprintTile({
  type = 'default',
  w = 52,
  h = 52,
  radius = 13,
}: {
  type?: string;
  w?: number;
  h?: number;
  radius?: number;
}) {
  const id = 'bp' + useState(() => ++_bpSeq)[0];
  return (
    <View style={{ width: w, height: h, borderRadius: radius, overflow: 'hidden', borderWidth: 1, borderColor: T.hairline }}>
      <LinearGradient colors={[T.surface2, '#0E141A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <Svg width={w} height={h} style={fill}>
        <Defs>
          <Pattern id={id} width={11} height={11} patternUnits="userSpaceOnUse">
            <Path d="M0 11L11 0M-2 2L2 -2M9 13L13 9" stroke={T.accent} strokeOpacity={0.14} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width={w} height={h} fill={`url(#${id})`} />
      </Svg>
      <View style={[fill, { alignItems: 'center', justifyContent: 'center', opacity: 0.8 }]}>
        <TypeGlyph name={TYPE_GLYPH[type] || TYPE_GLYPH.default} size={Math.round(w * 0.42)} color={T.accent} />
      </View>
    </View>
  );
}

// ── Banner blueprint (wide, for headers)
let _bbSeq = 0;
export function BannerBlueprint({ type, style }: { type?: string; style?: StyleProp<ViewStyle> }) {
  const id = 'bb' + useState(() => ++_bbSeq)[0];
  return (
    <View style={[fill, { overflow: 'hidden' }, style]}>
      <LinearGradient colors={['#16202A', '#0C141B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={fill} />
      <Svg style={fill} width="100%" height="100%">
        <Defs>
          <Pattern id={id} width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(48)">
            <Path d="M0 0V12 M0 6H12" stroke={T.accent} strokeOpacity={0.06} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      <View style={{ position: 'absolute', right: -6, top: '50%', transform: [{ translateY: -60 }], opacity: 0.13 }}>
        <TypeGlyph name={TYPE_GLYPH[type || 'default'] || 'building'} size={120} stroke={1.2} color={T.accent} />
      </View>
    </View>
  );
}

// ── Filter chips (single-select, horizontal scroll)
export function Chips({ items, active, onPick }: { items: string[]; active: string; onPick?: (item: string) => void }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 }}
    >
      {items.map((it) => {
        const on = it === active;
        return (
          <Pressable
            key={it}
            onPress={() => {
              haptic();
              onPick?.(it);
            }}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11, backgroundColor: on ? T.accent : T.surface2 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', letterSpacing: -0.1, color: on ? T.onAccent : T.muted }}>
              {it}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ── Buttons (primary = teal hero; secondary = grey; full = flex:1 in a row)
export function Button({
  children,
  primary,
  icon,
  onPress,
  style,
  full,
  disabled,
}: {
  children: ReactNode;
  primary?: boolean;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        haptic();
        onPress?.();
      }}
      style={({ pressed }) => [
        {
          height: 52,
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          borderWidth: primary ? 0 : 1,
          borderColor: primary ? 'transparent' : T.hairline,
          backgroundColor: primary ? (pressed ? T.accentPress : T.accent) : pressed ? T.surfaceHi : T.surface2,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        full ? { flex: 1 } : null,
        primary ? shadow('#14B8C0', 16, 0.3, 4, 8) : null,
        disabled ? { opacity: 0.4 } : null,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={20} color={primary ? T.onAccent : T.text} /> : null}
      <Text style={{ fontSize: 16, fontWeight: '700', color: primary ? T.onAccent : T.text }}>{children}</Text>
    </Pressable>
  );
}

// ── Card (optional press scale / tap)
export function Card({
  children,
  style,
  onPress,
  pressable,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  pressable?: boolean;
}) {
  const base: ViewStyle = { backgroundColor: T.surface, borderRadius: 18, borderWidth: 1, borderColor: T.hairline };
  if (onPress || pressable) {
    return (
      <Pressable
        onPress={
          onPress
            ? () => {
                haptic();
                onPress();
              }
            : undefined
        }
        style={({ pressed }) => [base, pressable && pressed ? { transform: [{ scale: 0.99 }] } : null, style]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

// ── Section label
export function SectionLabel({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <View
      style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginHorizontal: 2, marginVertical: 8 }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {children}
      </Text>
      {right}
    </View>
  );
}

// ── Large title header
export function ScreenHeader({ title, sub, trailing }: { title: string; sub?: string; trailing?: ReactNode }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.6, lineHeight: 38, color: T.text, flex: 1 }}>
          {title}
        </Text>
        {trailing}
      </View>
      {sub ? <Text style={{ marginTop: 4, fontSize: 14, fontWeight: '500', color: T.muted }}>{sub}</Text> : null}
    </View>
  );
}
