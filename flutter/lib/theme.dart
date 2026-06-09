// Athar Eye design tokens (SPEC §6.2/6.3) — ported verbatim from pwa/src/theme.ts.
// Dark navy + teal, system font, 4-pt grid. ONE teal hero per screen; structural
// elements grey; red only for missing/critical.
import 'package:flutter/material.dart';

/// Color + scale tokens. Names match the PWA `T` object 1:1.
class T {
  T._();

  static const Color bg = Color(0xFF0C0F12);
  static const Color surface = Color(0xFF15191E);
  static const Color surface2 = Color(0xFF1B2026);
  static const Color surfaceHi = Color(0xFF20262E);
  static const Color hairline = Color(0x12FFFFFF); // rgba(255,255,255,0.07)
  static const Color hairline2 = Color(0x0AFFFFFF); // rgba(255,255,255,0.04)
  static const Color text = Color(0xFFF4F6F8);
  static const Color muted = Color(0xFF8A949E);
  static const Color faint = Color(0xFF5B646D);
  static const Color accent = Color(0xFF14B8C0);
  static const Color accent2 = Color(0xFF45D6DD);
  static const Color accentPress = Color(0xFF0F949B);
  static const Color onAccent = Color(0xFF04222B);
  static const Color bar = Color(0xFFAEB8C2);
  static const Color track = Color(0x17FFFFFF); // rgba(255,255,255,0.09)
  static const Color warning = Color(0xFFE8A33D);
  static const Color danger = Color(0xFFE5484D);
  static const Color glow = Color(0x3314B8C0); // rgba(20,184,192,0.20)
}

/// Status colour + label (teal = positive, amber = the one caution accent).
class StatusStyle {
  const StatusStyle(this.color, this.label);
  final Color color;
  final String label;
}

const Map<String, StatusStyle> kStatus = {
  'On Track': StatusStyle(T.accent, 'On track'),
  'Needs Review': StatusStyle(T.warning, 'Needs review'),
  'Complete': StatusStyle(T.accent, 'Complete'),
};

/// Severity → colour for the issue chips.
const Map<String, Color> kSev = {
  'high': T.danger,
  'med': T.warning,
  'low': T.faint,
};

/// Dark Material 3 theme tuned to the Athar tokens. Uses the platform system
/// font (no bundled family) to match the PWA's `-apple-system` stack.
ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: T.bg,
    colorScheme: const ColorScheme.dark(
      surface: T.bg,
      primary: T.accent,
      secondary: T.accent2,
      error: T.danger,
      onPrimary: T.onAccent,
      onSurface: T.text,
    ),
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(
      bodyColor: T.text,
      displayColor: T.text,
    ),
  );
}
