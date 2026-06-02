// ScanFlow.tsx — immersive scan flow (lazy-loaded chunk): select → home → active
// point cloud → processing → result → share. STUB pending plan approval.
import { T } from '../../theme';
import { Button } from '../../components/primitives';
import { Mark, Wordmark } from '../../components/Brand';
import type { Project } from '../../types';

export function ScanFlow({
  onClose,
}: {
  project: Project | null;
  projects: Project[];
  onClose: () => void;
  onViewReport: (p: Project) => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 500,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 18,
        padding: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Mark size={40} />
        <Wordmark size={22} />
      </div>
      <div style={{ color: T.muted, fontSize: 14 }}>Scan flow — porting in progress</div>
      <Button onClick={onClose}>Close</Button>
    </div>
  );
}
