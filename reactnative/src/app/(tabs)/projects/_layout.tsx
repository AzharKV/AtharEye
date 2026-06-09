import { Stack } from 'expo-router';
import { T } from '@/theme';

// Projects tab stack: list → detail / new project (iOS slide, swipe-back). Tab bar stays visible.
export default function ProjectsStack() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: T.bg } }} />;
}
