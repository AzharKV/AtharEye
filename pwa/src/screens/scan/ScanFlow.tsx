// ScanFlow.tsx — immersive scan flow (lazy chunk): select → home → active point cloud → processing → result → share. Ported from design-source/app/app-scan.jsx. Canvas uses a single rAF loop (§4.9); processing spinner uses CSS spin (§4.2).
import { useState, useEffect, useMemo, useRef } from 'react';
import { T } from '../../theme';
import type { Project } from '../../types';
import { DATA, bimFor } from '../../data';
import { haptic } from '../../lib/haptic';
import { roundM } from '../../lib/format';
import { useCountUp } from '../../hooks/useCountUp';
import { Icon } from '../../components/Icon';
import type { IconName } from '../../components/Icon';
import { Mark, Wordmark } from '../../components/Brand';
import { Donut, Button, Card, BlueprintTile } from '../../components/primitives';
import { ShareSheet, Toast } from '../../components/ShareSheet';

const TIPS = [
  'Move slowly and steadily',
  'Keep the camera ~1.5 m from surfaces',
  'Capture corners and ceilings',
  'Avoid fast turns — hold steady',
  'Overlap areas you’ve already scanned',
];

// ── Real camera feed (rear camera) behind the point cloud, with vignette overlay.
// Falls back to dark gradient if permission is denied or API unavailable.
function CameraBG() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
      .then((s) => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setHasCamera(true);
        }
      })
      .catch(() => {
        // permission denied or no camera — fallback gradient stays visible
      });
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#0A0E12' }}>
      {/* fallback gradient always present; hidden once camera is live */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 80% at 50% 110%, #1A2630 0%, #0C141B 45%, #070B0F 100%)',
          opacity: hasCamera ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}
      />
      {/* live camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: hasCamera ? 0.72 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
      {/* vignette */}
      <div
        style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 140px 30px rgba(0,0,0,0.75)' }}
      />
    </div>
  );
}

// generate a room point cloud (1-point perspective box)
function makePoints(n: number): Array<{ x: number; y: number; z: number; r: number }> {
  const pts: Array<{ x: number; y: number; z: number; r: number }> = [];
  for (let i = 0; i < n; i++) {
    const s = Math.random();
    let x: number, y: number, z: number;
    if (s < 0.34) {
      y = 0;
      x = Math.random() * 2 - 1;
      z = Math.random() * 3.4;
    } // floor
    else if (s < 0.5) {
      y = 1.5;
      x = Math.random() * 2 - 1;
      z = Math.random() * 3.4;
    } // ceiling
    else if (s < 0.68) {
      x = -1;
      y = Math.random() * 1.5;
      z = Math.random() * 3.4;
    } // left wall
    else if (s < 0.86) {
      x = 1;
      y = Math.random() * 1.5;
      z = Math.random() * 3.4;
    } // right wall
    else {
      z = 3.4;
      x = Math.random() * 2 - 1;
      y = Math.random() * 1.5;
    } // back wall
    pts.push({ x, y, z, r: Math.random() });
  }
  return pts.sort((a, b) => a.r - b.r); // reveal order
}

function ActiveScan({
  project,
  onComplete,
  onCancel,
}: {
  project: Project;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [tip, setTip] = useState(0);
  const pts = useMemo(() => makePoints(2000), []);
  const raf = useRef(0);
  const start = useRef(0);
  const DUR = 7000;

  useEffect(() => {
    const iv = setInterval(() => setTip((t) => (t + 1) % TIPS.length), 2600);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
    };
    resize();
    const ctx = cv.getContext('2d')!;
    start.current = Date.now();
    const draw = () => {
      const p = Math.min(1, (Date.now() - start.current) / DUR);
      setProgress(p);
      const W = cv.width,
        H = cv.height,
        cx = W / 2,
        cy = H * 0.46,
        f = H * 0.62;
      ctx.clearRect(0, 0, W, H);

      // ── faint perspective room wireframe (reads as a room being reconstructed);
      //    same 1-point projection as the points, fades in as the scan progresses
      const proj = (x: number, y: number, z: number): [number, number] => {
        const zz = z + 0.6;
        return [cx + (x / zz) * f, cy - ((y - 0.75) / zz) * f];
      };
      const roomA = 0.05 + 0.16 * p;
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = `rgba(20,184,192,${roomA})`;
      ctx.beginPath();
      for (const gx of [-1, -0.5, 0, 0.5, 1]) {
        const a = proj(gx, 0, 0),
          b = proj(gx, 0, 3.4);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      for (const gz of [0, 0.85, 1.7, 2.55, 3.4]) {
        const a = proj(-1, 0, gz),
          b = proj(1, 0, gz);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      ctx.stroke();
      ctx.strokeStyle = `rgba(20,184,192,${roomA * 0.55})`;
      ctx.beginPath();
      for (const [cxn, czn] of [
        [-1, 0],
        [1, 0],
        [-1, 3.4],
        [1, 3.4],
      ] as Array<[number, number]>) {
        const a = proj(cxn, 0, czn),
          b = proj(cxn, 1.5, czn);
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
      }
      const r1 = proj(-1, 1.5, 0),
        r2 = proj(1, 1.5, 0),
        r3 = proj(1, 1.5, 3.4),
        r4 = proj(-1, 1.5, 3.4);
      ctx.moveTo(r1[0], r1[1]);
      ctx.lineTo(r2[0], r2[1]);
      ctx.lineTo(r3[0], r3[1]);
      ctx.lineTo(r4[0], r4[1]);
      ctx.closePath();
      ctx.stroke();

      const reveal = Math.floor(p * pts.length);
      for (let i = 0; i < reveal; i++) {
        const pt = pts[i];
        const zz = pt.z + 0.6;
        const sx = cx + (pt.x / zz) * f;
        const sy = cy - ((pt.y - 0.75) / zz) * f;
        const depth = 1 / zz;
        const fresh = i > reveal - 40;
        const size = Math.max(0.6, depth * 2.4) * dpr;
        ctx.beginPath();
        ctx.arc(sx, sy, fresh ? size * 1.8 : size, 0, 6.283);
        const a = 0.25 + depth * 0.75;
        ctx.fillStyle = fresh
          ? `rgba(120,232,238,${a})`
          : `rgba(${90 + depth * 90},${190 + depth * 50},${200 + depth * 50},${a * 0.8})`;
        ctx.fill();
      }
      if (p >= 1) {
        haptic();
        setTimeout(onComplete, 400);
        return;
      }
      raf.current = requestAnimationFrame(draw);
    };
    raf.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('resize', resize);
    };
    // mount-only: starts the scan loop once; onComplete/pts are stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pointsM = (progress * 1.84).toFixed(2);
  const liveCov = Math.round(progress * project.pct);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#070B0F' }}>
      <CameraBG />
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />

      {/* AR corner brackets — bottom lifted clear of the controls column */}
      <div
        style={{
          position: 'absolute',
          inset: '120px 26px calc(226px + env(safe-area-inset-bottom))',
          pointerEvents: 'none',
        }}
      >
        {(
          [
            [0, 0, '2px 0 0 2px', '14px 0 0 0'],
            [0, 'r', '2px 2px 0 0', '0 14px 0 0'],
            ['b', 0, '0 0 2px 2px', '0 0 0 14px'],
            ['b', 'r', '0 2px 2px 0', '0 0 14px 0'],
          ] as Array<[string | number, string | number, string, string]>
        ).map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 26,
              height: 26,
              top: c[0] === 'b' ? undefined : 0,
              bottom: c[0] === 'b' ? 0 : undefined,
              left: c[1] === 'r' ? undefined : 0,
              right: c[1] === 'r' ? 0 : undefined,
              borderStyle: 'solid',
              borderColor: 'rgba(20,184,192,0.7)',
              borderWidth: c[2]
                .split(' ')
                .map((v) => v)
                .join(' '),
              borderRadius: c[3],
            }}
          />
        ))}
      </div>

      {/* top bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 52,
          padding: 'calc(env(safe-area-inset-top) + 14px) 18px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onCancel}
          aria-label="Cancel scan"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: 'none',
            background: 'rgba(8,12,16,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={20} color="#fff" />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(8,12,16,0.6)',
            backdropFilter: 'blur(8px)',
            padding: '7px 13px',
            borderRadius: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 8,
              background: T.danger,
              animation: 'pulse 1.4s infinite',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 0.3 }}>
            SCANNING
          </span>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* project + tip */}
      <div
        style={{
          position: 'absolute',
          top: 110,
          left: 0,
          right: 0,
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            textShadow: '0 1px 6px rgba(0,0,0,0.6)',
          }}
        >
          {project.name}
        </div>
        <div
          key={tip}
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            background: 'rgba(8,12,16,0.55)',
            backdropFilter: 'blur(8px)',
            padding: '7px 13px',
            borderRadius: 20,
          }}
        >
          <Icon name="info" size={14} color={T.accent2} />
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.9)' }}>{TIPS[tip]}</span>
        </div>
      </div>

      {/* bottom controls — stats · progress · stop, stacked (no overlap), safe-area aware */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 'calc(22px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* live stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {(
            [
              ['Points', `${pointsM}M`],
              ['Coverage', `${liveCov}%`],
              ['Tracking', 'Strong'],
            ] as Array<[string, string]>
          ).map(([l, v]) => (
            <div
              key={l}
              style={{
                flex: 1,
                background: 'rgba(8,12,16,0.6)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: `1px solid ${T.hairline}`,
                borderRadius: 14,
                padding: '10px 12px',
              }}
            >
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{l}</div>
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  color: l === 'Tracking' ? T.accent2 : '#fff',
                  marginTop: 3,
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 6,
            background: 'rgba(255,255,255,0.14)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${T.accent}, ${T.accent2})`,
            }}
          />
        </div>

        {/* stop */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <button
            onClick={() => {
              haptic();
              onComplete();
            }}
            aria-label="Stop scan"
            style={{
              width: 64,
              height: 64,
              borderRadius: 64,
              border: '3px solid rgba(255,255,255,0.5)',
              background: 'rgba(8,12,16,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 6, background: T.danger }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Processing
const STEPS = [
  'Reconstructing geometry',
  'Aligning with BIM model',
  'Computing coverage',
  'Detecting missing areas',
];
function Processing({ onComplete }: { onComplete: () => void }) {
  const [done, setDone] = useState(0);
  useEffect(() => {
    if (done >= STEPS.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(
      () => {
        haptic();
        setDone((d) => d + 1);
      },
      done === 0 ? 600 : 750,
    );
    return () => clearTimeout(t);
    // step timer advances the checklist; onComplete is stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <div style={{ position: 'relative', width: 84, height: 84, marginBottom: 36 }}>
        <svg width="84" height="84" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="42" cy="42" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
          <circle
            cx="42"
            cy="42"
            r="36"
            fill="none"
            stroke={T.accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="60 200"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mark size={40} />
        </div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>Processing scan</div>
      <div style={{ fontSize: 13.5, color: T.muted, marginBottom: 28 }}>
        Computing coverage against the BIM model
      </div>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {STEPS.map((s, i) => {
          const isDone = i < done,
            active = i === done;
          return (
            <div
              key={s}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 4px',
                opacity: isDone || active ? 1 : 0.35,
                transition: 'opacity .3s',
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 24,
                  flexShrink: 0,
                  background: isDone ? T.accent : 'transparent',
                  border: isDone ? 'none' : `2px solid ${active ? T.accent : T.faint}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDone ? (
                  <Icon name="check" size={13} color={T.onAccent} stroke={3.4} />
                ) : active ? (
                  <div style={{ width: 8, height: 8, borderRadius: 8, background: T.accent }} />
                ) : null}
              </div>
              <span
                style={{ fontSize: 15, fontWeight: 600, color: isDone || active ? T.text : T.muted }}
              >
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Result
function ScanResult({
  project: p,
  onDone,
  onViewReport,
}: {
  project: Project;
  onDone: () => void;
  onViewReport: (p: Project) => void;
}) {
  const [ready, setReady] = useState(false);
  const [share, setShare] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const pct = useCountUp(p.pct, 1200, ready);
  const cov = roundM(p.area, p.pct),
    miss = p.area - cov;
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 260);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      style={{ position: 'absolute', inset: 0, background: T.bg, overflowY: 'auto' }}
      className="no-scrollbar"
    >
      <div
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '70px 24px 36px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 52,
              background: 'rgba(20,184,192,0.15)',
              border: `1px solid ${T.accent}55`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Icon name="check" size={26} color={T.accent} stroke={3} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>Scan complete</div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>{p.name}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '30px 0 24px' }}>
          <Donut value={pct} size={208} stroke={19} />
        </div>

        <Card style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(
            [
              ['Covered area', `${cov} m²`, T.accent],
              ['Missing / unscanned', `${miss} m²`, T.danger],
              ['Points captured', DATA.scanStats.points, T.text],
              ['Alignment accuracy', DATA.scanStats.alignment, T.text],
            ] as Array<[string, string, string]>
          ).map((r, i, a) => (
            <div
              key={r[0]}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '11px 0',
                borderBottom: i < a.length - 1 ? `1px solid ${T.hairline2}` : 'none',
              }}
            >
              <span style={{ fontSize: 14.5, color: T.muted }}>{r[0]}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: r[2] }}>{r[1]}</span>
            </div>
          ))}
        </Card>

        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
          <Button primary icon="reports" onClick={() => onViewReport(p)}>
            View full report
          </Button>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon="share" full onClick={() => setShare(true)}>
              Share now
            </Button>
            <Button full onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      </div>
      <ShareSheet
        open={share}
        projectName={p.name}
        onClose={() => setShare(false)}
        onShared={(m) => {
          setShare(false);
          setToast(m);
        }}
      />
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

// ── Scan home / guidance
const CHECKLIST = [
  ['sun', 'Good lighting', 'Bright, even light reads best'],
  ['bolt', 'Move slowly', 'Steady pace, no fast turns'],
  ['grid', 'Capture all areas', 'Corners, ceilings, floors'],
  ['target', 'Keep stable', 'Hold ~1.5 m from surfaces'],
];
function ScanHome({
  project,
  onStart,
  onClose,
}: {
  project: Project;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          paddingTop: 52,
          padding: 'calc(env(safe-area-inset-top) + 14px) 18px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: `1px solid ${T.hairline}`,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={20} color={T.text} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mark size={26} />
          <Wordmark size={16} />
        </div>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }} className="no-scrollbar">
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          New scan
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.6, marginTop: 6, lineHeight: 1.1 }}>
          {project.name}
        </div>
        <div style={{ fontSize: 14.5, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
          Walk the space with your iPhone to capture a LiDAR point cloud. We’ll align it to the BIM
          model and compute coverage.
        </div>

        {/* BIM reference — what the scan is compared against */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            marginTop: 16,
            background: T.surface,
            border: `1px solid ${T.hairline}`,
            borderRadius: 14,
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(20,184,192,0.12)',
              border: `1px solid ${T.accent}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon name="cube" size={20} color={T.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: T.muted, fontWeight: 600, letterSpacing: 0.3 }}>
              COMPARING AGAINST
            </div>
            <div
              style={{
                fontSize: 14.5,
                fontWeight: 700,
                fontFamily: T.mono,
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {bimFor(project.id).file}
            </div>
          </div>
          <Icon name="check" size={18} color={T.accent} stroke={3} />
        </div>

        {/* viewport illustration */}
        <div
          style={{
            position: 'relative',
            height: 180,
            borderRadius: 18,
            overflow: 'hidden',
            margin: '22px 0',
            border: `1px solid ${T.hairline}`,
          }}
        >
          <CameraBG />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <Icon name="scan" size={40} color={T.accent2} stroke={1.8} />
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontFamily: T.mono }}>
              LiDAR · {project.area} m² to cover
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.muted,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            marginBottom: 10,
          }}
        >
          Before you start
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(CHECKLIST as Array<[string, string, string]>).map(([ic, t, s]) => (
            <div
              key={t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                background: T.surface,
                border: `1px solid ${T.hairline}`,
                borderRadius: 14,
                padding: 13,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: 'rgba(20,184,192,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon name={ic as IconName} size={20} color={T.accent} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{t}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 1 }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          padding: '14px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          background: `linear-gradient(to top, ${T.bg} 60%, transparent)`,
        }}
      >
        <Button primary icon="scan" onClick={onStart} style={{ width: '100%' }}>
          Start scan
        </Button>
      </div>
    </div>
  );
}

// ── Project picker (when scan launched from the tab bar)
function ScanSelect({
  projects,
  onPick,
  onClose,
}: {
  projects: Project[];
  onPick: (p: Project) => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: T.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          paddingTop: 52,
          padding: 'calc(env(safe-area-inset-top) + 14px) 18px 4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            border: `1px solid ${T.hairline}`,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={20} color={T.text} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mark size={26} />
          <Wordmark size={16} />
        </div>
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '16px 24px 4px' }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: T.accent,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}
        >
          New scan
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, marginTop: 5 }}>
          Select a project
        </div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 6 }}>
          Which site are you scanning today?
        </div>
      </div>
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {projects
          .filter((p) => p.status !== 'Complete')
          .map((p) => (
            <button
              key={p.id}
              onClick={() => {
                haptic();
                onPick(p);
              }}
              style={{
                textAlign: 'left',
                cursor: 'pointer',
                background: T.surface,
                border: `1px solid ${T.hairline}`,
                borderRadius: 16,
                padding: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 13,
              }}
            >
              <BlueprintTile type={p.type} w={46} h={46} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15.5,
                    fontWeight: 700,
                    color: T.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>
                  {p.location} · {p.type}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.accent }}>
                  {p.pct}
                  <span style={{ fontSize: 11, color: T.muted }}>%</span>
                </div>
              </div>
              <Icon name="chevron" size={16} color="rgba(255,255,255,0.25)" />
            </button>
          ))}
      </div>
    </div>
  );
}

// ── Flow controller
export function ScanFlow({
  project,
  projects,
  onClose,
  onViewReport,
  onScanComplete,
}: {
  project: Project | null;
  projects: Project[];
  onClose: () => void;
  onViewReport: (p: Project) => void;
  onScanComplete?: (p: Project) => void;
}) {
  const list = projects || DATA.projects;
  const [picked, setPicked] = useState<Project | null>(project || null);
  const [step, setStep] = useState<'select' | 'home' | 'active' | 'processing' | 'result'>(
    project ? 'home' : 'select',
  ); // select|home|active|processing|result
  const p = picked;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 500 }}>
      {step === 'select' && (
        <ScanSelect
          projects={list}
          onPick={(pr) => {
            setPicked(pr);
            setStep('home');
          }}
          onClose={onClose}
        />
      )}
      {step === 'home' && p && (
        <ScanHome project={p} onStart={() => setStep('active')} onClose={onClose} />
      )}
      {step === 'active' && p && (
        <ActiveScan project={p} onComplete={() => setStep('processing')} onCancel={onClose} />
      )}
      {step === 'processing' && (
        <Processing
          onComplete={() => {
            if (p) onScanComplete?.(p); // record the scan (persisted)
            setStep('result');
          }}
        />
      )}
      {step === 'result' && p && (
        <ScanResult project={p} onDone={onClose} onViewReport={onViewReport} />
      )}
    </div>
  );
}
