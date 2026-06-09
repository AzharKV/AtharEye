import { Redirect } from 'expo-router';

// Root → Projects tab.
export default function Index() {
  return <Redirect href="/projects" />;
}
