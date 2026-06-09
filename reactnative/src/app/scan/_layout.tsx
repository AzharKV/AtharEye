import { Stack } from 'expo-router';
import { T } from '@/theme';

// Scan flow — full-screen, immersive, no tab bar (presented modally from the root). Steps replace
// one another (select → guidance → active → processing → result); no swipe-back mid-scan.
export default function ScanStack() {
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg }, gestureEnabled: false, animation: 'fade' }}
    />
  );
}
