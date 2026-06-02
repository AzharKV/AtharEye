import { Tabs } from 'expo-router';
import { TabBar } from '@/navigation/TabBar';

// Bottom tab host. Detail screens live inside each tab's Stack, so the tab bar persists on push
// (matching the PWA). The center Scan action opens the full-screen scan modal (see TabBar).
export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, animation: 'none' }}>
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
