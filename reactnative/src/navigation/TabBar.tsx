// Custom bottom tab bar: Projects · Reports · [Scan] · Settings. Center Scan is the elevated teal
// hero action (opens the full-screen scan modal). Frosted (BlurView) bar pinned to the bottom; the
// tab screens scroll underneath it (the Screen wrapper pads bottom to clear it).
import { Pressable, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../theme';
import { haptic } from '../lib/haptic';
import { fill, shadow } from '../lib/ui';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';

// Minimal structural type for the props expo-router's <Tabs tabBar> passes (avoids importing the
// vendored, non-public BottomTabBarProps). We only read the focused route + navigate to a tab.
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { navigate: (name: string) => void };
}

export function TabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const current = state.routes[state.index]?.name;

  const item = (name: string, label: string, icon: IconName) => {
    const on = current === name;
    return (
      <Pressable
        key={name}
        onPress={() => {
          haptic();
          navigation.navigate(name);
        }}
        style={{ flex: 1, alignItems: 'center', gap: 3, paddingTop: 9 }}
      >
        <Icon name={icon} size={25} stroke={on ? 2.3 : 2} color={on ? T.accent : T.muted} />
        <Text style={{ fontSize: 10.5, fontWeight: on ? '700' : '600', letterSpacing: -0.1, color: on ? T.accent : T.muted }}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderTopColor: T.hairline }}>
      <BlurView intensity={30} tint="dark" style={fill} />
      <View style={[fill, { backgroundColor: 'rgba(12,15,18,0.7)' }]} />
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 6, paddingBottom: Math.max(24, insets.bottom) }}>
        {item('projects', 'Projects', 'projects')}
        {item('reports', 'Reports', 'reports')}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[{ marginTop: -16, borderRadius: 19 }, shadow('#14B8C0', 20, 0.5, 6, 10)]}>
            <Pressable
              accessibilityLabel="New scan"
              onPress={() => {
                haptic();
                router.push('/scan');
              }}
              style={{ width: 58, height: 58, borderRadius: 19, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
            >
              <LinearGradient colors={[T.accent2, T.accentPress]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={fill} />
              <Icon name="scan" size={27} stroke={2.4} color={T.onAccent} />
            </Pressable>
          </View>
        </View>
        {item('settings', 'Settings', 'settings')}
      </View>
    </View>
  );
}
