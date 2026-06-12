/* OptiSync — Scan flow: Aim → Capturing → Processing → Result (4 beats) */

const SCAN_BG = 'uploads/OptiSync_Design_Assets/scan-background/';
function bgFor(zoneName) {
  const z = (zoneName || '').toLowerCase();
  if (z.includes('kitchen')) return SCAN_BG + 'scanbg_kitchen_18s.jpeg';
  if (z.includes('bed')) return SCAN_BG + 'scanbg_bedroom_66s.jpeg';
  if (z.includes('hall') || z.includes('stair') || z.includes('landing')) return SCAN_BG + 'scanbg_stairs_39s.jpeg';
  return SCAN_BG + 'scanbg_livingroom_9s.jpeg';
}

function makeCloud(n, W, H) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    pts.push({ x: Math.random() * W, y: Math.random() * H, d: 0.35 + Math.random() * 0.65, jx: (Math.random() - 0.5) * 3, jy: (Math.random() - 0.5) * 3 });
  }
  return pts;
}

function ScanFlow({ nav, project, onComplete }) {
  const zones = project.zones;
  const defaultZone = zones.find(z => /kitchen/i.test(z.name)) || zones[0];
  const [step, setStep] = useState('select');
  const [zone, setZone] = useState(defaultZone);
  const [counter, setCounter] = useState(0);
  const canvasRef = useRef(null);
  const cloudRef = useRef(null);
  const rafRef = useRef(0);

  const bump = project.coverage >= 100 ? 0 : (project.id === 'proj-morningside' ? 4 : 3);
  const newCov = Math.min(100, project.coverage + bump);
  const zoneDelta = project.coverage >= 100 ? 0 : 6;
  const newZoneCov = Math.min(100, zone.coverage + zoneDelta);

  // setup canvas size + cloud
  const setupCanvas = () => {
    const c = canvasRef.current; if (!c) return null;
    const rect = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = rect.width * dpr; c.height = rect.height * dpr;
    const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!cloudRef.current) cloudRef.current = makeCloud(620, rect.width, rect.height);
    return { ctx, W: rect.width, H: rect.height };
  };

  // draw helpers
  const drawCapture = (progress) => {
    const got = setupCanvas(); if (!got) return; const { ctx, W, H } = got;
    ctx.clearRect(0, 0, W, H);
    const sweepY = progress * H;
    const band = 70;
    cloudRef.current.forEach(p => {
      if (p.y > sweepY) return;
      const near = p.y > sweepY - band;
      if (near) { ctx.fillStyle = `rgba(47,182,173,${0.5 + 0.5 * p.d})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.7, 0, 7); ctx.fill(); }
      else { ctx.fillStyle = `rgba(30,58,102,${0.35 + 0.5 * p.d})`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.3 * p.d + 0.5, 0, 7); ctx.fill(); }
    });
    // sweep line
    const grd = ctx.createLinearGradient(0, sweepY - 26, 0, sweepY);
    grd.addColorStop(0, 'rgba(24,131,126,0)'); grd.addColorStop(1, 'rgba(24,131,126,0.28)');
    ctx.fillStyle = grd; ctx.fillRect(0, sweepY - 26, W, 26);
    ctx.strokeStyle = 'rgba(47,182,173,0.95)'; ctx.lineWidth = 2; ctx.shadowColor = 'rgba(47,182,173,0.9)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.moveTo(0, sweepY); ctx.lineTo(W, sweepY); ctx.stroke(); ctx.shadowBlur = 0;
  };
  const drawSettled = (t) => {
    const got = setupCanvas(); if (!got) return; const { ctx, W, H } = got;
    ctx.clearRect(0, 0, W, H);
    cloudRef.current.forEach(p => {
      const k = 1 - t;
      const x = p.x + p.jx * k, y = p.y + p.jy * k;
      ctx.fillStyle = `rgba(30,58,102,${0.4 + 0.5 * p.d})`;
      ctx.beginPath(); ctx.arc(x, y, 1.3 * p.d + 0.5, 0, 7); ctx.fill();
    });
  };

  // step machine — transitions driven by setTimeout (robust to rAF throttling),
  // rAF only paints frames.
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (step === 'capture') {
      cloudRef.current = null; // fresh cloud per scan
      const dur = 3000, t0 = performance.now();
      const loop = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        drawCapture(p); setCounter(Math.round(p * 100));
        if (p < 1) rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      const to = setTimeout(() => { setCounter(100); setStep('process'); }, dur + 150);
      return () => { cancelAnimationFrame(rafRef.current); clearTimeout(to); };
    } else if (step === 'process') {
      const dur = 1500, t0 = performance.now();
      const loop = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        drawSettled(p);
        if (p < 1) rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      const to = setTimeout(() => setStep('result'), dur);
      return () => { cancelAnimationFrame(rafRef.current); clearTimeout(to); };
    } else if (step === 'result') {
      const to = setTimeout(() => drawSettled(1), 40);
      return () => clearTimeout(to);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  const finish = (goReport) => {
    const today = '2026-06-12';
    const newScan = { date: today, coverage: newCov, note: `New scan — ${zone.name} +${zoneDelta}%` };
    onComplete(project.id, newScan, zone.name, newZoneCov);
    if (goReport) nav.go('report', { id: project.id, coverage: newCov }, true);
    else nav.go('detail', { id: project.id }, true);
  };

  /* ---------- SELECT ---------- */
  if (step === 'select') {
    return (
      <div className="screen">
        <StatusBar tone="dark" />
        <div className="appbar">
          <button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Cancel</button>
          <h1>New scan</h1><p className="sub">{project.short} · choose an area to scan</p>
        </div>
        <div className="body pad pad-b">
          <div className="section-label">Select area</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {zones.map(z => {
              const on = z.name === zone.name;
              return (
                <button key={z.name} onClick={() => setZone(z)} className="card card-pad row between" style={{ width: '100%', textAlign: 'left', borderColor: on ? 'var(--navy)' : 'var(--hairline)', boxShadow: on ? '0 0 0 3px var(--navy-08)' : 'var(--sh-card)' }}>
                  <div className="row gap10">
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: '2px solid ' + (on ? 'var(--navy)' : 'var(--hairline)'), background: on ? 'var(--navy)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Ic.check style={{ width: 13, height: 13, color: '#fff' }} />}</div>
                    <div><div style={{ fontSize: 14, fontWeight: 650 }}>{z.name}</div><div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{z.coverage}% · {z.area} m²</div></div>
                  </div>
                  <MiniDonut value={z.coverage} size={34} stroke={4} />
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(20px + 12px)', background: 'linear-gradient(transparent, var(--canvas) 24%)' }}>
          <button className="btn btn-primary btn-block" onClick={() => setStep('aim')}><Ic.scan style={{ width: 18, height: 18 }} />Start scan · {zone.name}</button>
        </div>
      </div>
    );
  }

  /* ---------- CAMERA STEPS (aim / capture / process / result) ---------- */
  const dimFeed = step === 'process';
  return (
    <div className="screen" style={{ background: '#0a0e14' }}>
      {/* camera feed */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <img src={bgFor(zone.name)} alt="" style={{ position: 'absolute', inset: '-4%', width: '108%', height: '108%', objectFit: 'cover', filter: dimFeed ? 'brightness(.4) saturate(.6)' : (step === 'result' ? 'brightness(.7)' : 'brightness(.86)'), transition: 'filter .5s', animation: step === 'aim' || step === 'capture' ? 'feedpan 14s ease-in-out infinite alternate' : 'none' }} />
        {/* blueprint grid (aim) */}
        {step === 'aim' && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.10) 1px,transparent 1px)', backgroundSize: '34px 34px', animation: 'gridfade 2s ease-in-out infinite alternate' }} />}
        {/* point cloud canvas */}
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </div>

      <StatusBar tone="light" />

      {/* top bar */}
      <div style={{ position: 'absolute', top: 56, left: 0, right: 0, padding: '0 18px', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => nav.back()} style={{ width: 38, height: 38, borderRadius: 19, background: 'rgba(10,14,20,.5)', backdropFilter: 'blur(8px)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.x style={{ width: 19, height: 19 }} /></button>
        <div style={{ background: 'rgba(10,14,20,.5)', backdropFilter: 'blur(8px)', borderRadius: 999, padding: '7px 13px', color: '#fff', fontSize: 12.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><Ic.cube style={{ width: 14, height: 14, color: '#2fb6ad' }} />{zone.name}</div>
        <div style={{ width: 38 }} />
      </div>

      {/* counter (capture) */}
      {(step === 'capture' || step === 'process') && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', zIndex: 10 }}>
          <div className="mono" style={{ fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>{step === 'process' ? 100 : counter}<span style={{ fontSize: 28 }}>%</span></div>
          <div style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, fontWeight: 600, marginTop: 6, letterSpacing: '.02em' }}>{step === 'process' ? 'Aligning to BIM…' : 'Capturing area'}</div>
        </div>
      )}

      {/* aim prompt */}
      {step === 'aim' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ width: 168, height: 168, position: 'relative' }}>
            {[0, 1, 2, 3].map(i => { const c = [[0, 0, 't', 'l'], [0, 0, 't', 'r'], [0, 0, 'b', 'l'], [0, 0, 'b', 'r']][i]; const cor = ['top', 'bottom'].map(v => '').join(''); return (
              <div key={i} style={{ position: 'absolute', width: 30, height: 30, [c[2] === 't' ? 'top' : 'bottom']: 0, [c[3] === 'l' ? 'left' : 'right']: 0, [`border${c[2] === 't' ? 'Top' : 'Bottom'}`]: '3px solid #2fb6ad', [`border${c[3] === 'l' ? 'Left' : 'Right'}`]: '3px solid #2fb6ad', borderRadius: c[2] === 't' ? (c[3] === 'l' ? '8px 0 0 0' : '0 8px 0 0') : (c[3] === 'l' ? '0 0 0 8px' : '0 0 8px 0') }} />
            ); })}
          </div>
        </div>
      )}
      {step === 'aim' && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 18px calc(22px + 12px)', zIndex: 10, textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 650, marginBottom: 4 }}>Move slowly across the room</div>
          <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12.5, marginBottom: 18 }}>Keep the area inside the frame · iPhone LiDAR, no extra hardware</div>
          <button className="btn btn-teal btn-block" onClick={() => setStep('capture')} style={{ boxShadow: '0 8px 24px rgba(24,131,126,.5)' }}>Begin capture</button>
        </div>
      )}

      {/* scan line bar overlay during capture */}
      {step === 'capture' && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 18px calc(24px + 12px)', zIndex: 10 }}>
        <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.2)', overflow: 'hidden' }}><div style={{ height: '100%', width: counter + '%', background: '#2fb6ad', borderRadius: 4 }} /></div>
        <div className="mono" style={{ color: 'rgba(255,255,255,.8)', fontSize: 11, marginTop: 7, textAlign: 'center' }}>Building point cloud · {Math.round(counter * 6.2)} pts</div>
      </div>}

      {/* RESULT */}
      {step === 'result' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'linear-gradient(transparent 40%, rgba(10,14,20,.6))', animation: 'scrim .3s' }}>
          <div style={{ padding: '0 16px calc(20px + 12px)' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 18, padding: 18, boxShadow: 'var(--sh-pop)', animation: 'sheetup .35s cubic-bezier(.2,.8,.2,1)' }}>
              <div className="row gap8" style={{ marginBottom: 14, color: 'var(--teal)' }}><div style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--teal-10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.check style={{ width: 19, height: 19 }} /></div><div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Scan aligned to BIM</div><div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>{zone.name} · {project.short}</div></div></div>
              <div className="row gap10" style={{ marginBottom: 14 }}>
                <div style={{ flex: 1, background: 'var(--canvas)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{zone.name}</div>
                  <div className="row gap6" style={{ alignItems: 'baseline' }}><span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>+{zoneDelta}%</span><span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{zone.coverage}→{newZoneCov}%</span></div>
                </div>
                <div style={{ flex: 1, background: 'var(--canvas)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Project coverage</div>
                  <div className="row gap6" style={{ alignItems: 'baseline' }}><span className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>{newCov}%</span><span className="mono" style={{ fontSize: 12, color: 'var(--teal)' }}>{project.coverage}→{newCov}</span></div>
                </div>
              </div>
              <div className="row gap10">
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => finish(false)}>Done</button>
                <button className="btn btn-primary" style={{ flex: 1.3 }} onClick={() => finish(true)}><Ic.reports style={{ width: 17, height: 17 }} />View report</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes feedpan{from{transform:scale(1) translate(0,0)}to{transform:scale(1.08) translate(-2%,1%)}}
        @keyframes gridfade{from{opacity:.5}to{opacity:1}}
      `}</style>
    </div>
  );
}

Object.assign(window, { ScanFlow });
