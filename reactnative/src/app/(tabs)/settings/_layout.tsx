import { Stack } from 'expo-router';
import { T } from '@/theme';

// Settings tab stack: settings → profile / plans.
export default function SettingsStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg } }} />;
}
