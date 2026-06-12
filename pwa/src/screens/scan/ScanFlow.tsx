// Scan flow (lazy chunk) — signature interaction #2. A looping room-walkthrough video is the live
// camera feed; the LiDAR point cloud accretes ON TOP of the moving footage on a <canvas>. Four
// timer-driven beats so it always completes: Aim → Capturing → Processing → Result. Completing the
// scan writes a real new scan to the project (appears in the scrubber/log, openable as a report).
// Honest scope: a deterministic SIMULATION of a LiDAR capture (video + canvas overlay), not real ARKit.
import { useEffect, useMemo, useRef, useState } from 'react';
import { T } from '../../theme';
import { useStore } from '../../lib/store';
import { SCAN_FEED, SCAN_BG } from '../../lib/photos';
import { Button, mono } from '../../components/primitives';
import { Icon } from '../../components/Icon';

type Beat = 'select' | 'aim' | 'capturing' | 'processing' | 'result';
const CAP_MS = 3600;

export function ScanFlow({
  projectId,
  onClose,
  onViewReport,
}: {
  projectId: string | null;
  onClose: () => void;
  onViewReport: (projectId: string, coverage?: number) => void;
}) {
  const { data, update } = useStore();
  const morningside = data.projects.find((p) => p.id === 'proj-morningside');
  const [targetId, setTargetId] = useState<string | null>(projectId ?? morningside?.id ?? data.projects[0]?.id ?? null);
  const [beat, setBeat] = useState<Beat>(projectId ? 'aim' : 'select');
  const target = data.projects.find((p) => p.id === targetId);

  // Deterministic delta (captured at mount): project +4, the headline zone +6.
  const plan = useMemo(() => {
    if (!target) return null;
    const from = target.overall_coverage;
    const to = Math.min(100, from + 4);
    const zone = target.zones.find((z) => /kitchen/i.test(z.name)) ?? target.zones[0];
    return { from, to, zoneName: zone?.name ?? 'Area', zoneId: zone?.id };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const [counter, setCounter] = useState(0);
  const wrote = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  // Beat timeline — each beat schedules only its OWN next transition (timer-driven, so it always
  // reaches Result even if rAF is throttled; scheduling one step per beat avoids the cleanup of a
  // later beat's timer when the current beat advances).
  useEffect(() => {
    let next: Beat | null = null;
    let delay = 0;
    if (beat === 'aim') { next = 'capturing'; delay = 1600; }
    else if (beat === 'capturing') { next = 'processing'; delay = CAP_MS; }
    else if (beat === 'processing') { next = 'result'; delay = 1500; }
    if (!next) return;
    const id = setTimeout(() => setBeat(next as Beat), delay);
    return () => clearTimeout(id);
  }, [beat]);

  // Capture counter 0 → 100 (% of this area).
  useEffect(() => {
    if (beat !== 'capturing') return;
    const start = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / CAP_MS);
      setCounter(Math.round(p * 100));
      if (p >= 1) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [beat]);

  // On Result: freeze the video frame + write the real scan once.
  useEffect(() => {
    if (beat !== 'result' || wrote.current || !target || !plan) return;
    wrote.current = true;
    videoRef.current?.pause();
    update(target.id, (d) => {
      d.scans.push({ id: `sc-${Date.now().toString(36)}`, date: '2026-06-12', coverage: plan.to, note: `Live scan — ${plan.zoneName.toLowerCase()}` });
      d.overall_coverage = plan.to;
      if (plan.zoneId) {
        const z = d.zones.find((x) => x.id === plan.zoneId);
        if (z) z.coverage = Math.min(100, z.coverage + 6);
      }
    });
  }, [beat, target, plan, update]);

  if (beat === 'select' || !target || !plan) {
    return (
      <ScanShell onClose={onClose} title="New scan">
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 18px 18px' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13.5, margin: '4px 2px 14px' }}>Select a project to scan.</div>
          {data.projects.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setTargetId(p.id);
                setBeat('aim');
              }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px', marginBottom: 8, borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ ...mono, width: 44, fontSize: 17, fontWeight: 800, color: '#fff' }}>{p.overall_coverage}%</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{p.location.split(',')[0]}</div>
              </div>
              <Icon name="chevron" size={16} color="rgba(255,255,255,0.5)" />
            </button>
          ))}
        </div>
      </ScanShell>
    );
  }

  return (
    <ScanShell onClose={onClose} title={`${target.name}${plan ? ` · ${plan.zoneName}` : ''}`}>
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#0B1016' }}>
        {/* Live feed (looping walkthrough video) or still fallback */}
        {!videoFailed ? (
          <video
            ref={videoRef}
            src={SCAN_FEED}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoFailed(true)}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: beat === 'processing' ? 0.4 : 0.78, transition: 'opacity .4s' }}
          />
        ) : (
          <img src={SCAN_BG.kitchen} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
        )}

        <PointCloud beat={beat} />

        {/* Aim: blueprint grid + reticle */}
        {beat === 'aim' && <Reticle />}

        {/* Capturing: live coverage counter */}
        {beat === 'capturing' && (
          <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 64px)', left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ ...mono, fontSize: 56, fontWeight: 800, color: '#fff', letterSpacing: -2, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
              {counter}<span style={{ fontSize: 26, color: T.accent2 }}>%</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: 0.4 }}>Capturing {plan.zoneName.toLowerCase()}…</div>
          </div>
        )}

        {/* Processing */}
        {beat === 'processing' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, border: `3px solid rgba(255,255,255,0.2)`, borderTopColor: T.accent2, animation: 'spin .8s linear infinite' }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Aligning to BIM…</div>
          </div>
        )}

        {/* Aim prompt */}
        {beat === 'aim' && (
          <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>
            Move slowly across the room
          </div>
        )}
      </div>

      {/* Result delta card */}
      {beat === 'result' && (
        <div style={{ background: T.canvas, padding: '18px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', animation: 'sheetUp .35s cubic-bezier(.32,.72,0,1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ display: 'flex', padding: 9, borderRadius: 999, background: T.tealTint }}>
              <Icon name="checkCircle" size={22} color={T.teal} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>Scan complete</div>
              <div style={{ fontSize: 12.5, color: T.muted }}>Aligned to {target.bim.file}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <DeltaTile label={plan.zoneName} value={`+6%`} />
            <DeltaTile label="Project coverage" value={`${plan.from} → ${plan.to}%`} accent />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button full onClick={onClose}>Done</Button>
            <Button full primary icon="reports" onClick={() => onViewReport(target.id)}>View report</Button>
          </div>
        </div>
      )}
    </ScanShell>
  );
}

function ScanShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: '#0B1016', display: 'flex', flexDirection: 'column', animation: 'modalUp .3s cubic-bezier(.32,.72,0,1)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', alignItems: 'center', padding: 'calc(env(safe-area-inset-top) + 14px) 16px 12px' }}>
        <button onClick={onClose} aria-label="Cancel" style={{ width: 38, height: 38, borderRadius: 12, border: 'none', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="close" size={20} color="#fff" />
        </button>
        <div style={{ flex: 1, textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 15.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 8px' }}>{title}</div>
        <div style={{ width: 38 }} />
      </div>
      {children}
    </div>
  );
}

function DeltaTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, padding: '12px 14px', borderRadius: 14, background: accent ? T.navy : T.surface, border: `1px solid ${accent ? T.navy : T.hairline}` }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: accent ? 'rgba(255,255,255,0.7)' : T.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ ...mono, fontSize: 19, fontWeight: 800, color: accent ? '#fff' : T.teal, letterSpacing: -0.5 }}>{value}</div>
    </div>
  );
}

function Reticle() {
  const corner = (pos: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', width: 28, height: 28, borderColor: T.accent2, ...pos });
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(42,167,160,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(42,167,160,0.10) 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />
      <div style={{ position: 'absolute', inset: '18% 14%' }}>
        <div style={{ ...corner({ top: 0, left: 0, borderTop: `3px solid ${T.accent2}`, borderLeft: `3px solid ${T.accent2}`, borderTopLeftRadius: 6 }) }} />
        <div style={{ ...corner({ top: 0, right: 0, borderTop: `3px solid ${T.accent2}`, borderRight: `3px solid ${T.accent2}`, borderTopRightRadius: 6 }) }} />
        <div style={{ ...corner({ bottom: 0, left: 0, borderBottom: `3px solid ${T.accent2}`, borderLeft: `3px solid ${T.accent2}`, borderBottomLeftRadius: 6 }) }} />
        <div style={{ ...corner({ bottom: 0, right: 0, borderBottom: `3px solid ${T.accent2}`, borderRight: `3px solid ${T.accent2}`, borderBottomRightRadius: 6 }) }} />
      </div>
    </>
  );
}

// ── Accreting LiDAR point cloud (canvas over the moving feed)
function PointCloud({ beat }: { beat: Beat }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const beatRef = useRef<Beat>(beat);
  const capStart = useRef<number>(0);
  beatRef.current = beat;
  if (beat === 'capturing' && capStart.current === 0) capStart.current = Date.now();

  // Decorative point field (clustered into horizontal bands ~ surfaces).
  const pts = useMemo(() => {
    const arr: { x: number; y: number; b: number }[] = [];
    for (let i = 0; i < 300; i++) {
      const band = Math.floor(Math.random() * 4);
      const y = 0.12 + band * 0.22 + (Math.random() - 0.5) * 0.16;
      arr.push({ x: Math.random(), y: Math.max(0.02, Math.min(0.98, y)), b: 0.4 + Math.random() * 0.6 });
    }
    return arr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const b = beatRef.current;
      const settled = b === 'processing' || b === 'result';
      const progress = b === 'capturing' ? Math.min(1, (Date.now() - capStart.current) / CAP_MS) : settled ? 1 : 0;
      const sweepX = progress * w;
      const count = Math.floor(progress * pts.length);
      for (let i = 0; i < count; i++) {
        const p = pts[i];
        const px = p.x * w;
        const py = p.y * h;
        const near = !settled && Math.abs(px - sweepX) < 36;
        ctx.beginPath();
        ctx.arc(px, py, near ? 2.4 : 1.6, 0, Math.PI * 2);
        if (near) ctx.fillStyle = `rgba(42,167,160,${0.9 * p.b})`;
        else ctx.fillStyle = `rgba(30,58,102,${(settled ? 0.85 : 0.7) * p.b})`;
        ctx.fill();
      }
      // teal sweep line during capture
      if (b === 'capturing') {
        ctx.fillStyle = 'rgba(42,167,160,0.18)';
        ctx.fillRect(sweepX - 2, 0, 4, h);
        ctx.fillStyle = 'rgba(42,167,160,0.06)';
        ctx.fillRect(sweepX - 30, 0, 60, h);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [pts]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
