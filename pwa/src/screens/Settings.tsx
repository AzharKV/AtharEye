// Settings.tsx — Settings (tab root) + Profile + Plans.
// STUB pending plan approval; full port to follow.
import { Screen } from '../navigation/Navigator';
import { ScreenHeader } from '../components/primitives';
import { T } from '../theme';

function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} sub="Porting in progress" />
      <div style={{ padding: 20, color: T.muted, fontSize: 14 }}>Coming next.</div>
    </Screen>
  );
}

export function Settings() {
  return <Placeholder title="Settings" />;
}
export function Profile() {
  return <Placeholder title="Profile" />;
}
export function Plans() {
  return <Placeholder title="Plans" />;
}
