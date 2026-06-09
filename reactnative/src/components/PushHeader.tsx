// Translucent push/back header + round trailing icon button (RN port). Used by the simple
// pushed screens (New project, Profile, Plans). Detail screens with banners draw their own header.
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { Icon } from './Icon';
import type { IconName } from './Icon';

export function PushHeader({ title, trailing, onBack }: { title: string; trailing?: ReactNode; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: T.hairline,
        backgroundColor: 'rgba(12,15,18,0.72)',
      }}
    >
      <Pressable
        accessibilityLabel="Back"
        onPress={() => {
          haptic();
          if (onBack) onBack();
          else router.back();
        }}
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: T.hairline,
          backgroundColor: 'rgba(255,255,255,0.06)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="chevronL" size={20} color={T.text} />
      </Pressable>
      <Text numberOfLines={1} style={{ flex: 1, fontSize: 17, fontWeight: '700', color: T.text, letterSpacing: -0.3, textAlign: 'center' }}>
        {title}
      </Text>
      <View style={{ minWidth: 38, alignItems: 'flex-end' }}>{trailing}</View>
    </BlurView>
  );
}

export function RoundBtn({ icon, onPress, label }: { icon: IconName; onPress?: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityLabel={label ?? icon}
      onPress={() => {
        haptic();
        onPress?.();
      }}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: T.hairline,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={20} color={T.muted} />
    </Pressable>
  );
}
