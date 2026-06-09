// ui.ts — small RN style helpers that stand in for CSS features the PWA used inline.
import { Easing, Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

// Soft shadow (iOS shadow* + Android elevation) — mirrors the PWA's box-shadows.
export function shadow(
  color: string,
  radius: number,
  opacity: number,
  offsetY: number = Math.round(radius / 3),
  elevation: number = Math.round(radius / 2),
): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: { elevation },
    default: {},
  }) as ViewStyle;
}

// The iOS spring-like easing used across the design — cubic-bezier(.32,.72,0,1).
export const EASE = Easing.bezier(0.32, 0.72, 0, 1);

// Absolute-fill shorthand (RN has no CSS `inset: 0`).
export const fill: ViewStyle = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
