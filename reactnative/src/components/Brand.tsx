// Brand.tsx — Mark (the real product app icon) + Wordmark lockup. The mark renders the same
// home-screen icon so the in-app lockup matches the installed icon exactly (SPEC §15).
import { Image, Text, View } from 'react-native';
import { T } from '../theme';

const ICON = require('../../assets/images/athar-mark.png');

export function Mark({ size = 30, r }: { size?: number; r?: number }) {
  return (
    <Image
      source={ICON}
      resizeMode="cover"
      style={{
        width: size,
        height: size,
        // ~iOS squircle ratio; matches the icon's own rounded corners
        borderRadius: r ?? Math.round(size * 0.22),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    />
  );
}

export function Wordmark({ size = 19, sub }: { size?: number; sub?: string }) {
  return (
    <View>
      <Text style={{ fontSize: size, fontWeight: '800', letterSpacing: -0.5, color: T.text }}>
        Athar<Text style={{ color: T.accent }}>Eye</Text>
      </Text>
      {sub ? (
        <Text style={{ fontSize: 10.5, fontWeight: '600', color: T.muted, marginTop: 3, letterSpacing: 0.5 }}>
          {sub}
        </Text>
      ) : null}
    </View>
  );
}
