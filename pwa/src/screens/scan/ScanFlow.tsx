// Scan flow (lazy chunk) — signature interaction #2, ported to the OptiSync prototype flow
// (design-source/app/screens-scan.jsx + the ScanPicker in app.jsx):
//   picker (light) → select area (light) → aim → capture → process → result.
// The light steps choose the site + the zone; the camera steps render a walkthrough still as the
// live feed with the LiDAR point cloud accreting on a <canvas> (vertical sweep), then collapse into
// the aligned model. Transitions are setTimeout-driven so the flow always reaches Result even if rAF
// is throttled. Completing the scan writes a real new scan to the project (scrubber/log + report).
// Honest scope: a deterministic SIMULATION of a LiDAR capture, not real ARKit.
import { useEffect, useRef, useState } from 'react';
import { T } from '../../theme';
import type { Project, Zone } from '../../types';
import { fmtDateShort } from '../../lib/format';
import { useStore } from '../../lib/store';
import { SCAN_BG, SCAN_FEED } from '../../lib/photos';
import { Button, Card, Ring, SectionLabel, StageChip, mono } from '../../components/primitives';
import { Icon } from '../../components/Icon';

type Step = 'picker' | 'select' | 'aim' | 'capture' | 'process' | 'result';
const CAP_MS = 3000;
const PROC_MS = 1500;

const shortName = (name: string) => name.split(' ').slice(0, 2).join(' ');
const defaultZone = (p: Project): Zone | null => p.zones.find((z) => /kitchen/i.test(z.name)) ?? p.zones[0] ?? null;

// Zone → walkthrough still (people-free), matching the prototype's bgFor().
function bgForZone(name: string): string {
  const z = name.toLowerCase();
  if (z.includes('kitchen')) return SCAN_BG.kitchen;
  if (z.includes('bed')) return SCAN_BG.bedroom;
  if (z.includes('hall') || z.includes('stair') || z.includes('landing')) return SCAN_BG.stairs;
  return SCAN_BG.living;
}

interface CloudPt { x: number; y: number; d: number; jx: number; jy: number }
function makeCloud(n: number, W: number, H: number): CloudPt[] {
  const pts: CloudPt[] = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x: Math.random() * W, y: Math.random() * H, d: 0.35 + Math.random() * 0.65, jx: (Math.random() - 0.5) * 3, jy: (Math.random() - 0.5) * 3 });
  }
  return pts;
}

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
  const initial = projectId ? data.projects.find((p) => p.id === projectId) ?? null : null;
  const [targetId, setTargetId] = useState<string | null>(projectId ?? null);
  const [zone, setZone] = useState<Zone | null>(initial ? defaultZone(initial) : null);
  const [step, setStep] = useState<Step>(projectId ? 'select' : 'picker');
  const [counter, setCounter] = useState(0);

  const target = data.projects.find((p) => p.id === targetId) ?? null;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cloudRef = useRef<CloudPt[] | null>(null);
  const rafRef = useRef(0);
  const wrote = useRef(false);

  // The scan delta, frozen the instant capture starts (so the result card + the write use the same
  // from→to numbers — recomputing live would drift once the store mutates). Prototype delta: project
  // +4 for Morningside else +3; headline zone +6.
  const [plan, setPlan] = useState<{ from: number; to: number; zoneId: string; zoneName: string; zoneFrom: number; zoneTo: number; zoneDelta: number } | null>(null);

  const selectProject = (p: Project) => {
    setTargetId(p.id);
    setZone(defaultZone(p));
    setStep('select');
  };

  const startCapture = () => {
    if (!target || !zone) return;
    const from = target.overall_coverage;
    const bump = from >= 100 ? 0 : target.id === 'proj-morningside' ? 4 : 3;
    const zoneDelta = from >= 100 ? 0 : 6;
    setPlan({ from, to: Math.min(100, from + bump), zoneId: zone.id, zoneName: zone.name, zoneFrom: zone.coverage, zoneTo: Math.min(100, zone.coverage + zoneDelta), zoneDelta });
    setStep('aim');
  };

  // Write the scan once, then close / open the report (prototype finish()). Writing on the user's
  // action — not on entering Result — keeps the result card's from→to numbers stable.
  const finish = (goReport: boolean) => {
    if (target && plan && !wrote.current) {
      wrote.current = true;
      update(target.id, (d) => {
        d.scans.push({ id: `sc-${Date.now().toString(36)}`, date: '2026-06-12', coverage: plan.to, note: `New scan — ${plan.zoneName} +${plan.zoneDelta}%` });
        d.overall_coverage = plan.to;
        const z = d.zones.find((x) => x.id === plan.zoneId);
        if (z) z.coverage = plan.zoneTo;
      });
    }
    if (goReport && target) onViewReport(target.id);
    else onClose();
  };

  // ── Point-cloud canvas helpers (vertical sweep on capture, jitter-collapse on settle).
  const setupCanvas = () => {
    const c = canvasRef.current;
    if (!c) return null;
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== rect.width * dpr || c.height !== rect.height * dpr) {
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
    }
    const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!cloudRef.current) cloudRef.current = makeCloud(620, rect.width, rect.height);
    return { ctx, W: rect.width, H: rect.height };
  };
  const drawCapture = (progress: number) => {
    const got = setupCanvas();
    if (!got || !cloudRef.current) return;
    const { ctx, W, H } = got;
    ctx.clearRect(0, 0, W, H);
    const sweepY = progress * H;
    const band = 70;
    for (const p of cloudRef.current) {
      if (p.y > sweepY) continue;
      const near = p.y > sweepY - band;
      ctx.beginPath();
      if (near) {
        ctx.fillStyle = `rgba(47,182,173,${0.5 + 0.5 * p.d})`;
        ctx.arc(p.x, p.y, 1.7, 0, 7);
      } else {
        ctx.fillStyle = `rgba(30,58,102,${0.35 + 0.5 * p.d})`;
        ctx.arc(p.x, p.y, 1.3 * p.d + 0.5, 0, 7);
      }
      ctx.fill();
    }
    const grd = ctx.createLinearGradient(0, sweepY - 26, 0, sweepY);
    grd.addColorStop(0, 'rgba(24,131,126,0)');
    grd.addColorStop(1, 'rgba(24,131,126,0.28)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, sweepY - 26, W, 26);
    ctx.strokeStyle = 'rgba(47,182,173,0.95)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(47,182,173,0.9)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, sweepY);
    ctx.lineTo(W, sweepY);
    ctx.stroke();
    ctx.shadowBlur = 0;
  };
  const drawSettled = (t: number) => {
    const got = setupCanvas();
    if (!got || !cloudRef.current) return;
    const { ctx, W, H } = got;
    ctx.clearRect(0, 0, W, H);
    const k = 1 - t;
    for (const p of cloudRef.current) {
      ctx.fillStyle = `rgba(30,58,102,${0.4 + 0.5 * p.d})`;
      ctx.beginPath();
      ctx.arc(p.x + p.jx * k, p.y + p.jy * k, 1.3 * p.d + 0.5, 0, 7);
      ctx.fill();
    }
  };

  // Step machine — transitions via setTimeout (robust to rAF throttling); rAF only paints frames.
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (step === 'capture') {
      cloudRef.current = null; // fresh cloud per scan
      const t0 = performance.now();
      const loop = (now: number) => {
        const p = Math.min(1, (now - t0) / CAP_MS);
        drawCapture(p);
        setCounter(Math.round(p * 100));
        if (p < 1) rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      const to = setTimeout(() => { setCounter(100); setStep('process'); }, CAP_MS + 150);
      return () => { cancelAnimationFrame(rafRef.current); clearTimeout(to); };
    }
    if (step === 'process') {
      const t0 = performance.now();
      const loop = (now: number) => {
        const p = Math.min(1, (now - t0) / PROC_MS);
        drawSettled(p);
        if (p < 1) rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      const to = setTimeout(() => setStep('result'), PROC_MS);
      return () => { cancelAnimationFrame(rafRef.current); clearTimeout(to); };
    }
    if (step === 'result') {
      const to = setTimeout(() => drawSettled(1), 40);
      return () => clearTimeout(to);
    }
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Light step: project picker (no project preselected)
  if (step === 'picker' || !target) {
    return (
      <LightShell title="New scan" sub="Which site are you scanning?" backLabel="Cancel" onBack={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.projects.map((p) => (
            <Card key={p.id} pressable onClick={() => selectProject(p)} style={{ padding: '14px 15px', display: 'flex', alignItems: 'center', gap: 13 }}>
              <Ring value={p.overall_coverage} size={44} stroke={5} color={p.overall_coverage >= 100 ? T.teal : T.navy} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                  <StageChip stage={p.stage} />
                </div>
                <div style={{ fontSize: 12, color: T.muted, marginTop: 3 }}>
                  {p.zones.length} zones · last scan {p.scans.length ? fmtDateShort(p.scans[p.scans.length - 1].date) : '—'}
                </div>
              </div>
              <span style={{ width: 38, height: 38, borderRadius: 11, background: T.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="scan" size={19} color="#fff" />
              </span>
            </Card>
          ))}
        </div>
      </LightShell>
    );
  }

  // ── Light step: choose the area to scan
  if (step === 'select') {
    return (
      <LightShell
        title="New scan"
        sub={`${shortName(target.name)} · choose an area to scan`}
        backLabel={projectId ? 'Cancel' : 'Back'}
        onBack={projectId ? onClose : () => setStep('picker')}
        footer={
          <Button primary full icon="scan" onClick={startCapture}>
            Start scan{zone ? ` · ${zone.name}` : ''}
          </Button>
        }
      >
        <SectionLabel>Select area</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {target.zones.map((z) => {
            const on = zone?.id === z.id;
            return (
              <button
                key={z.id}
                onClick={() => setZone(z)}
                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: 14, borderRadius: 14, border: `1px solid ${on ? T.navy : T.hairline}`, background: T.surface, boxShadow: on ? `0 0 0 3px ${T.navyTint}` : '0 1px 2px rgba(27,42,61,0.04)', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${on ? T.navy : T.hairline}`, background: on ? T.navy : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {on && <Icon name="check" size={13} color="#fff" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.ink }}>{z.name}</div>
                    <div style={{ ...mono, fontSize: 11.5, color: T.muted, marginTop: 1 }}>{z.coverage}% · {z.area_m2} m²</div>
                  </div>
                </div>
                <Ring value={z.coverage} size={34} stroke={4} color={z.coverage >= 100 ? T.teal : T.navy} />
              </button>
            );
          })}
        </div>
      </LightShell>
    );
  }

  // ── Camera steps (aim / capture / process / result)
  const zoneName = zone?.name ?? 'Area';
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: '#0a0e14', overflow: 'hidden', animation: 'modalUp .3s cubic-bezier(.32,.72,0,1)' }}>
      {/* live feed (walkthrough still) */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <video
          src={SCAN_FEED}
          poster={bgForZone(zoneName)}
          autoPlay
          loop
          muted
          playsInline
          style={{ position: 'absolute', inset: '-4%', width: '108%', height: '108%', objectFit: 'cover', filter: step === 'process' ? 'brightness(.4) saturate(.6)' : step === 'result' ? 'brightness(.7)' : 'brightness(.86)', transition: 'filter .5s' }}
        />
        {step === 'aim' && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.10) 1px,transparent 1px)', backgroundSize: '34px 34px', animation: 'gridfade 2s ease-in-out infinite alternate' }} />
        )}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>

      {/* top bar */}
      <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 14px)', left: 0, right: 0, padding: '0 18px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onClose} aria-label="Cancel" style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(10,14,20,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
          <Icon name="close" size={19} color="#fff" />
        </button>
        <div style={{ background: 'rgba(10,14,20,.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: 999, padding: '7px 13px', color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="cube" size={14} color={T.accent2} />
          {zoneName}
        </div>
        <div style={{ width: 38 }} />
      </div>

      {/* counter (capture / process) */}
      {(step === 'capture' || step === 'process') && (
        <div style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 78px)', left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
          <div style={{ ...mono, fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>
            {step === 'process' ? 100 : counter}
            <span style={{ fontSize: 28 }}>%</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 600, marginTop: 6 }}>{step === 'process' ? 'Aligning to BIM…' : 'Capturing area'}</div>
        </div>
      )}

      {/* aim: reticle + prompt + Begin capture */}
      {step === 'aim' && <Reticle />}
      {step === 'aim' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px calc(22px + env(safe-area-inset-bottom))', zIndex: 10, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Move slowly across the room</div>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginBottom: 18 }}>Keep the area inside the frame · iPhone LiDAR, no extra hardware</div>
          <button onClick={() => setStep('capture')} style={{ width: '100%', height: 50, borderRadius: 13, border: 'none', background: T.teal, color: '#fff', fontSize: 15.5, fontWeight: 700, fontFamily: T.font, cursor: 'pointer', boxShadow: '0 8px 24px rgba(24,131,126,.5)' }}>
            Begin capture
          </button>
        </div>
      )}

      {/* capture: progress bar */}
      {step === 'capture' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px calc(24px + env(safe-area-inset-bottom))', zIndex: 10 }}>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${counter}%`, background: T.accent2, borderRadius: 4 }} />
          </div>
          <div style={{ ...mono, color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 7, textAlign: 'center' }}>Building point cloud · {Math.round(counter * 6.2)} pts</div>
        </div>
      )}

      {/* result */}
      {step === 'result' && plan && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(transparent 40%, rgba(10,14,20,.6))', animation: 'scrimIn .3s ease' }}>
          <div style={{ padding: '0 16px calc(20px + env(safe-area-inset-bottom))' }}>
            <div style={{ background: T.surface, borderRadius: 18, padding: 18, boxShadow: '0 20px 50px rgba(8,12,18,0.5)', animation: 'sheetUp .35s cubic-bezier(.32,.72,0,1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: T.tealTint, color: T.teal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="checkCircle" size={19} color={T.teal} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.ink }}>Scan aligned to BIM</div>
                  <div style={{ fontSize: 11.5, color: T.muted, fontWeight: 600 }}>{plan.zoneName} · {shortName(target.name)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <DeltaTile label={plan.zoneName} value={`+${plan.zoneDelta}%`} sub={`${plan.zoneFrom}→${plan.zoneTo}%`} />
                <DeltaTile label="Project coverage" value={`${plan.to}%`} sub={`${plan.from}→${plan.to}`} accent />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button full onClick={() => finish(false)}>Done</Button>
                <Button full primary icon="reports" onClick={() => finish(true)}>View report</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Light shell for the picker / select steps (white app bar with the 2px navy underline).
function LightShell({
  title,
  sub,
  backLabel,
  onBack,
  footer,
  children,
}: {
  title: string;
  sub?: string;
  backLabel: string;
  onBack: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500, background: T.canvas, display: 'flex', flexDirection: 'column', animation: 'modalUp .3s cubic-bezier(.32,.72,0,1)' }}>
      <div style={{ background: T.surface, borderBottom: `2px solid ${T.navy}`, padding: 'calc(env(safe-area-inset-top) + 14px) 18px 12px' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 3, border: 'none', background: 'none', color: T.navy, fontWeight: 700, fontSize: 14, cursor: 'pointer', padding: 0, marginBottom: 8 }}>
          <Icon name="chevronL" size={18} color={T.navy} /> {backLabel}
        </button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4, color: T.ink }}>{title}</h1>
        {sub && <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500, color: T.muted }}>{sub}</div>}
      </div>
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: '12px 16px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))', background: `linear-gradient(transparent, ${T.canvas} 24%)` }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function DeltaTile({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ flex: 1, background: T.canvas, borderRadius: 12, padding: '12px 14px', minWidth: 0 }}>
      <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginTop: 2 }}>
        <span style={{ ...mono, fontSize: 22, fontWeight: 700, color: accent ? T.ink : T.teal }}>{value}</span>
        <span style={{ ...mono, fontSize: 12, color: accent ? T.teal : T.muted }}>{sub}</span>
      </div>
    </div>
  );
}

function Reticle() {
  const corners: React.CSSProperties[] = [
    { top: 0, left: 0, borderTop: `3px solid ${T.accent2}`, borderLeft: `3px solid ${T.accent2}`, borderRadius: '8px 0 0 0' },
    { top: 0, right: 0, borderTop: `3px solid ${T.accent2}`, borderRight: `3px solid ${T.accent2}`, borderRadius: '0 8px 0 0' },
    { bottom: 0, left: 0, borderBottom: `3px solid ${T.accent2}`, borderLeft: `3px solid ${T.accent2}`, borderRadius: '0 0 0 8px' },
    { bottom: 0, right: 0, borderBottom: `3px solid ${T.accent2}`, borderRight: `3px solid ${T.accent2}`, borderRadius: '0 0 8px 0' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
      <div style={{ width: 168, height: 168, position: 'relative' }}>
        {corners.map((c, i) => (
          <div key={i} style={{ position: 'absolute', width: 30, height: 30, ...c }} />
        ))}
      </div>
    </div>
  );
}
