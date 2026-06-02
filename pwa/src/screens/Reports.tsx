// Reports.tsx — Reports list (tab root) + Report detail (hero screen).
// STUB pending plan approval; full port to follow.
import { Screen } from '../navigation/Navigator';
import { ScreenHeader } from '../components/primitives';
import { T } from '../theme';
import type { Project } from '../types';

function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <ScreenHeader title={title} sub="Porting in progress" />
      <div style={{ padding: 20, color: T.muted, fontSize: 14 }}>Coming next.</div>
    </Screen>
  );
}

export function ReportsList() {
  return <Placeholder title="Reports" />;
}
export function ReportDetail(_: { project: Project }) {
  return <Placeholder title="Report" />;
}
