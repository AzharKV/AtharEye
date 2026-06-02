import { Stack } from 'expo-router';
import { T } from '@/theme';

// Reports tab stack: list → report detail.
export default function ReportsStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg } }} />;
}
