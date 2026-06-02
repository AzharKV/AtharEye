// Projects.tsx — Projects list (tab root) + Project detail + New project.
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

export function ProjectsList() {
  return <Placeholder title="Projects" />;
}
export function ProjectDetail(_: { project: Project }) {
  return <Placeholder title="Project" />;
}
export function NewProject(_: { onCreate: (p: Project) => void }) {
  return <Placeholder title="New project" />;
}
