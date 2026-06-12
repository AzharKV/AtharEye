/* OptiSync UI kit — Progress report document. */
function ReportScreen({ project, coverage, onBack }) {
  const { Donut, ZoneBars, Sparkline, StageChip, StatusPill } = DS;
  const cov = coverage != null ? coverage : project.coverage;
  const ratio = project.coverage ? cov / project.coverage : 0;
  const zones = project.zones.map(z => ({ name: z.name, coverage: Math.max(0, Math.min(100, Math.round(z.coverage * ratio))) }));
  const openIssues = cov >= 100 ? [] : project.issues;
  const scansUpTo = project.scans.filter(s => s <= cov + 0.5);

  const Row = ({ k, v, accent }) => (
    <div className="row between" style={{ padding: '7px 0', borderBottom: '1px solid var(--hairline)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
      <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: accent || 'var(--ink)' }}>{v}</span>
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '2px solid var(--navy)', padding: '58px 20px 12px' }}>
        <button onClick={onBack} className="row gap6" style={{ fontSize: 15, color: 'var(--navy)', fontWeight: 600, marginBottom: 6 }}><KitIc.chevL width={18} height={18} />Back</button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Progress report</h1>
        <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>{project.short} · <span className="mono">{cov}%</span></p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 96 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 18px 16px', borderBottom: '2px solid var(--navy)' }}>
            <div className="row between" style={{ marginBottom: 12 }}>
              <div className="row gap8"><img src="../../assets/optisync-logo.jpeg" style={{ width: 28, height: 28, borderRadius: 7 }} /><span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.03em' }}>Opti<span style={{ color: 'var(--teal)' }}>Sync</span></span></div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.04em' }}>PROGRESS REPORT</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-.02em' }}>{project.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{project.sector} refurbishment</div>
            <div className="row gap8" style={{ marginTop: 12 }}><StageChip stage={cov >= 100 ? 'Complete' : cov >= 40 ? 'Mid' : 'Early'} /><StatusPill status={cov >= 100 ? 'Complete' : project.status} /></div>
          </div>

          <div style={{ padding: '4px 18px' }}>
            <Row k="Location" v={project.location} />
            <Row k="Client" v={project.client} />
            <Row k="Overall coverage" v={cov + '%'} accent={cov >= 100 ? 'var(--teal)' : 'var(--ink)'} />
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
            <div className="section-label">Coverage summary</div>
            <div className="row gap12" style={{ alignItems: 'center', marginBottom: 12 }}>
              <Donut value={cov} size={104} stroke={11} />
              <div style={{ flex: 1 }}><div className="mono" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{cov}% verified · {100 - cov}% outstanding</div></div>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink)' }}>{project.summary}</p>
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
            <div className="section-label">Zone coverage</div>
            <ZoneBars zones={zones} />
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
            <div className="row between"><div className="section-label" style={{ margin: 0 }}>{cov >= 100 ? 'Issues — all closed' : 'Open issues'}</div><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: openIssues.length ? 'var(--ink)' : 'var(--teal)' }}>{openIssues.length}</span></div>
            <div style={{ marginTop: 6 }}>
              {openIssues.length ? openIssues.map(it => (
                <div key={it.id} className="row gap10" style={{ padding: '9px 0', borderBottom: '1px solid var(--hairline)' }}>
                  <span className={'sev ' + it.sev} style={{ marginTop: 4 }} />
                  <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{it.title}</span><span style={{ fontSize: 11, color: 'var(--muted)' }}><span className="mono">{it.id}</span> · {it.zone} · {it.sev}</span></span>
                </div>
              )) : <div className="row gap8" style={{ padding: '10px 0', color: 'var(--teal)', fontSize: 13.5, fontWeight: 600 }}><KitIc.check width={18} height={18} />Snag list cleared — 0 open at handover.</div>}
            </div>
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
            <div className="section-label">Coverage over time</div>
            <Sparkline points={scansUpTo} />
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)', background: 'var(--navy-04)' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Prepared by</div>
            <div style={{ fontSize: 13.5, fontWeight: 700 }}>Cairn Refurbishment Ltd · A. Patel</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 32px', background: 'linear-gradient(transparent, var(--canvas) 24%)', display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onBack}><KitIc.projects width={18} height={18} />Project</button>
        <button className="btn btn-primary" style={{ flex: 1.3 }}><KitIc.share width={18} height={18} />Share / export</button>
      </div>
    </div>
  );
}
window.ReportScreen = ReportScreen;
