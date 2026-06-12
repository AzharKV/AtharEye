// Scan flow (lazy chunk) — full-screen capture modal. PHASE-6 STUB: the looping video feed +
// accreting canvas point-cloud animation (Aim → Capturing → Processing → Result) that writes a real
// scan to Morningside is built in phase 6. For now this is a navigable placeholder.
import { useStore } from '../../lib/store';
import { Mark } from '../../components/Brand';
import { Button } from '../../components/primitives';
import { Icon } from '../../components/Icon';

export function ScanFlow({
  projectId,
  onClose,
  onViewReport,
}: {
  projectId: string | null;
  onClose: () => void;
  onViewReport: (projectId: string, coverage?: number) => void;
}) {
  const { data } = useStore();
  const target = data.projects.find((p) => p.id === projectId) ?? data.projects.find((p) => p.id === 'proj-morningside') ?? data.projects[0];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 500,
        background: '#0B1016',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalUp .3s cubic-bezier(.32,.72,0,1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: 'calc(env(safe-area-inset-top) + 14px) 16px 12px' }}>
        <button onClick={onClose} aria-label="Cancel" style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="close" size={20} color="#fff" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>New scan{target ? ` · ${target.name}` : ''}</div>
        <div style={{ width: 38 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
        <Mark size={64} />
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>Scan flow</div>
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
          The live video feed + accreting LiDAR point-cloud animation is built in the next phase.
        </div>
      </div>

      <div style={{ padding: '0 20px', paddingBottom: 'max(24px, env(safe-area-inset-bottom))', display: 'flex', gap: 10 }}>
        <Button full onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none' }}>
          Cancel
        </Button>
        {target && (
          <Button full primary icon="reports" onClick={() => onViewReport(target.id)}>
            View report
          </Button>
        )}
      </div>
    </div>
  );
}
