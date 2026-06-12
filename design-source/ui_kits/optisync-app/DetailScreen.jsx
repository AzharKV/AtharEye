/* OptiSync UI kit — Project detail with tappable scan scrubber. */
function DetailScreen({ project, onBack, onReport }) {
  const { Donut, ZoneBars, Card, SectionHeader, StageChip, StatusPill, SeverityDot } = DS;
  const [sel, setSel] = React.useState(project.scans.length - 1);
  const cov = project.scans[sel];
  const ratio = project.coverage ? cov / project.coverage : 0;
  const zones = project.zones.map(z => ({ name: z.name, coverage: Math.max(0, Math.min(100, Math.round(z.coverage * ratio))) }));
  const openIssues = cov >= 100 ? [] : project.issues;
  const pct = i => (project.scans.length === 1 ? 0 : (i / (project.scans.length - 1)) * 100);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '2px solid var(--navy)', padding: '58px 20px 12px' }}>
        <button onClick={onBack} className="row gap6" style={{ fontSize: 15, color: 'var(--navy)', fontWeight: 600, marginBottom: 6 }}><KitIc.chevL width={18} height={18} />Projects</button>
        <div className="row between">
          <div><h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>{project.short}</h1><p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 4 }}><KitIc.pin width={12} height={12} />{project.location}</p></div>
          <button onClick={() => onReport(project, cov)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><KitIc.share width={18} height={18} /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 100 }}>
        <Card>
          <div className="row between" style={{ marginBottom: 14 }}><StageChip stage={cov >= 100 ? 'Complete' : cov >= 40 ? 'Mid' : 'Early'} /><StatusPill status={cov >= 100 ? 'Complete' : project.status} /></div>
          <div className="row gap12" style={{ alignItems: 'center' }}>
            <Donut value={cov} size={118} stroke={12} sub={`${cov}% verified · ${100 - cov}% left`} />
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Fact label="Client" value={project.client} />
              <Fact label="Area" value={<span className="mono">{project.area} m²</span>} />
              <Fact label="Sector" value={project.sector} />
              <Fact label="Handover" value={<span className="mono">{project.target}</span>} />
            </div>
          </div>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <div className="row between"><div className="section-label" style={{ margin: 0 }}>Scan history</div><div className="mono" style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 700 }}>Tap to replay</div></div>
          <div style={{ position: 'relative', height: 60, marginTop: 8, padding: '0 6px', touchAction: 'none' }}>
            <div style={{ position: 'absolute', left: 6, right: 6, top: 26, height: 4, borderRadius: 3, background: 'var(--navy-08)' }} />
            <div style={{ position: 'absolute', left: 6, top: 26, height: 4, borderRadius: 3, background: 'var(--navy)', width: `calc((100% - 12px) * ${pct(sel) / 100})`, transition: 'width .3s' }} />
            {project.scans.map((s, i) => {
              const on = i === sel;
              return <button key={i} onClick={() => setSel(i)} style={{ position: 'absolute', left: `calc(6px + (100% - 12px) * ${pct(i) / 100})`, top: 0, transform: 'translateX(-50%)', height: '100%', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: on ? 'var(--teal)' : 'transparent' }}>{s}%</span>
                <span style={{ position: 'absolute', top: 20, width: on ? 16 : 11, height: on ? 16 : 11, borderRadius: '50%', background: on ? 'var(--teal)' : (i < sel ? 'var(--navy)' : 'var(--surface)'), border: on ? '4px solid #fff' : '2px solid ' + (i <= sel ? 'var(--navy)' : 'var(--hairline)'), boxShadow: on ? '0 0 0 1px var(--teal)' : 'none' }} />
              </button>;
            })}
          </div>
        </Card>

        <Card style={{ marginTop: 12 }}>
          <SectionHeader label="Zone coverage" count={zones.length} onAdd={() => {}} />
          <ZoneBars zones={zones} />
        </Card>

        <Card style={{ marginTop: 12 }}>
          <SectionHeader label="Open issues" count={openIssues.length} onAdd={() => {}} />
          {openIssues.length ? openIssues.map(it => (
            <div key={it.id} className="row gap10" style={{ padding: '11px 0', borderBottom: '1px solid var(--hairline)' }}>
              <span className={'sev ' + it.sev} style={{ marginTop: 5 }} />
              <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{it.title}</span><span style={{ fontSize: 11.5, color: 'var(--muted)' }}><span className="mono">{it.id}</span> · {it.zone} · {it.sev}</span></span>
            </div>
          )) : <div className="row gap8" style={{ padding: '12px 0', color: 'var(--teal)', fontSize: 13.5, fontWeight: 600 }}><KitIc.check width={18} height={18} />{cov >= 100 ? 'Snag list cleared — 0 open at handover' : 'No open issues at this scan'}</div>}
        </Card>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px 32px', background: 'linear-gradient(transparent, var(--canvas) 24%)', display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => onReport(project, cov)}><KitIc.reports width={18} height={18} />Report</button>
        <button className="btn btn-primary" style={{ flex: 1.3 }}><KitIc.scan width={18} height={18} />New scan</button>
      </div>
    </div>
  );
}
function Fact({ label, value }) {
  return <div><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div><div style={{ fontSize: 13.5, fontWeight: 650, color: 'var(--ink)' }}>{value}</div></div>;
}
window.DetailScreen = DetailScreen;
window.KitFact = Fact;
