/* OptiSync — Progress report (A–Z document) + Reports history */

function reportDateFor(project, coverage) {
  const s = project.scans.find(x => x.coverage === coverage);
  return s ? s.date : project.bim.aligned;
}

function HeaderRow({ k, v, mono, accent }) {
  return (
    <div className="row between" style={{ padding: '7px 0', borderBottom: '1px solid var(--hairline)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
      <span className={mono ? 'mono' : ''} style={{ fontSize: 13, fontWeight: 700, color: accent || 'var(--ink)', textAlign: 'right', maxWidth: '62%' }}>{v}</span>
    </div>
  );
}

/* ---------- Progress report document ---------- */
function Report({ nav, project, coverage, onShare, embedded }) {
  const cov = coverage != null ? coverage : project.coverage;
  const isCurrent = cov === project.coverage;
  const st = window.OPTISYNC.stateAt(project, cov);
  const prose = window.OPTISYNC.reportProse(project, cov, isCurrent);
  const rdate = reportDateFor(project, cov);
  const handover = cov >= 100 && project.id === 'proj-leith';
  const accent = cov >= 100 ? 'var(--teal)' : 'var(--ink)';

  const doc = (
    <div style={{ background: 'var(--surface)', borderRadius: embedded ? 0 : 14, border: embedded ? 'none' : '1px solid var(--hairline)', overflow: 'hidden', boxShadow: embedded ? 'none' : 'var(--sh-card)' }}>
      {/* document header */}
      <div style={{ padding: '18px 18px 16px', borderBottom: '2px solid var(--navy)' }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <div className="row gap8"><Mark size={28} radius={7} /><Wordmark size={17} /></div>
          <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', letterSpacing: '.04em' }}>PROGRESS REPORT</span>
        </div>
        <div style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.02em', marginBottom: 2 }}>{project.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{project.type}</div>
        <div className="row gap8" style={{ marginTop: 12 }}>
          <StageChip stage={isCurrent ? project.stage : prose.stageLabel} />
          <StatusPill status={isCurrent ? project.status : (cov >= 100 ? 'Complete' : 'On track')} />
        </div>
      </div>

      <div style={{ padding: '4px 18px' }}>
        <HeaderRow k="Location" v={project.location} />
        <HeaderRow k="Client" v={project.client.replace(' (private)', '')} />
        <HeaderRow k="Report date" v={fdate(rdate)} mono />
        <HeaderRow k="Overall coverage" v={cov + '%'} mono accent={accent} />
      </div>

      {/* coverage summary */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">Coverage summary</div>
        <div className="row gap12" style={{ alignItems: 'center', marginBottom: 12 }}>
          <Donut value={cov} size={104} stroke={11} color={cov >= 100 ? 'var(--teal)' : 'var(--navy)'} label={cov >= 100 ? 'verified' : 'verified'} />
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 12.5, color: 'var(--muted)' }}>{cov}% verified · {100 - cov}% outstanding</div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--navy-08)', overflow: 'hidden', margin: '8px 0 0' }}><div style={{ width: cov + '%', height: '100%', background: cov >= 100 ? 'var(--teal)' : 'var(--navy)', borderRadius: 4 }} /></div>
          </div>
        </div>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink)' }}>{prose.summary}</p>
      </div>

      {/* zone coverage */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">Zone coverage</div>
        <ZoneBars zones={st.zones} />
      </div>

      {/* open issues */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="row between"><div className="section-label" style={{ margin: 0 }}>{cov >= 100 ? 'Issues — all closed' : 'Open issues'}</div><span className="mono" style={{ fontSize: 12, fontWeight: 700, color: st.open.length ? 'var(--ink)' : 'var(--teal)' }}>{st.open.length}</span></div>
        <div style={{ marginTop: 6 }}>
          {st.open.length ? st.open.map(it =>
            <div key={it.id} className="row gap10" style={{ padding: '9px 0', borderBottom: '1px solid var(--hairline)' }}>
              <span className={"sev " + it.sev} style={{ marginTop: 4 }} />
              <span style={{ flex: 1 }}><span style={{ display: 'block', fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{it.title}</span><span style={{ fontSize: 11, color: 'var(--muted)' }}><span className="mono">{it.id}</span> · {it.zone} · {it.sev}</span></span>
            </div>)
            : <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', color: 'var(--teal)', fontSize: 13.5, fontWeight: 600 }}><Ic.check style={{ width: 18, height: 18 }} />{cov >= 100 ? 'Snag list cleared — 0 open at handover.' : 'No open issues at this scan.'}</div>}
          {st.closedCount > 0 && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}><span className="mono">{st.closedCount}</span> issue{st.closedCount > 1 ? 's' : ''} closed.</div>}
        </div>
      </div>

      {/* coverage over time */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">Coverage over time</div>
        <Sparkline scans={project.scans.filter(s => s.coverage <= cov + 0.5)} />
        <div className="row" style={{ justifyContent: 'space-between', marginTop: 2 }}>
          {project.scans.filter(s => s.coverage <= cov + 0.5).map((s, i) => <span key={i} className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{fdateShort(s.date)}</span>)}
        </div>
      </div>

      {/* BIM */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">BIM details</div>
        <div style={{ fontSize: 13, lineHeight: 1.6 }}>
          <span className="mono" style={{ fontWeight: 700 }}>{project.bim.file}</span><br />
          {project.bim.software} · LOD <span className="mono">{project.bim.lod}</span> · {project.bim.disciplines.join(' + ')}<br />
          <span style={{ color: 'var(--muted)' }}>Last aligned {fdate(project.bim.aligned)}</span>
        </div>
      </div>

      {/* captures */}
      {!project.noPhotos && <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">Latest captures</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {st.captures.map(s => <div key={s.p} className="shot" style={{ aspectRatio: '1/1' }}><img src={s.src} alt={s.cap} loading="lazy" /></div>)}
        </div>
      </div>}
      {project.beforeAfter && cov >= 40 && cov < 100 && <div style={{ padding: '0 18px 16px' }}>
        <img src={project.beforeAfter} alt="Before / after" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--hairline)' }} />
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4, textAlign: 'center' }}>Before / after — coverage comparison</div>
      </div>}

      {/* next actions */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)' }}>
        <div className="section-label">{cov >= 100 ? 'Closeout' : 'Next actions'}</div>
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {prose.next.map((a, i) => <li key={i} className="row gap10"><span className="mono" style={{ flex: 'none', width: 20, height: 20, borderRadius: 6, background: 'var(--navy-08)', color: 'var(--navy)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span><span style={{ fontSize: 13, lineHeight: 1.4 }}>{a}</span></li>)}
        </ol>
      </div>

      {/* footer */}
      <div style={{ padding: '16px 18px', borderTop: '1px solid var(--hairline)', background: 'var(--navy-04)' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>Prepared by</div>
        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{window.OPTISYNC.company} · A. Patel</div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{fdate(rdate)}</div>
        {handover && <div className="row gap6" style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--hairline)', color: 'var(--teal)', fontSize: 12.5, fontWeight: 700 }}><Ic.check style={{ width: 16, height: 16 }} />Handover signed 30 May 2026</div>}
      </div>
    </div>
  );

  if (embedded) return doc;

  return (
    <div className="screen">
      <div className="appbar">
        <button className="appbar-back" onClick={() => nav.back()}><Ic.chevL style={{ width: 18, height: 18 }} />Back</button>
        <div className="appbar-row">
          <div><h1 style={{ fontSize: 20 }}>Progress report</h1><p className="sub">{project.short} · <span className="mono">{cov}%</span></p></div>
          <button onClick={() => onShare(project, cov)} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', color: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}><Ic.share style={{ width: 18, height: 18 }} /></button>
        </div>
      </div>
      <div className="body pad" style={{ paddingBottom: 96 }}>{doc}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px calc(20px + 12px)', background: 'linear-gradient(transparent, var(--canvas) 24%)', display: 'flex', gap: 10, zIndex: 30 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => nav.go('detail', { id: project.id })}><Ic.projects style={{ width: 18, height: 18 }} />Project</button>
        <button className="btn btn-primary" style={{ flex: 1.3 }} onClick={() => onShare(project, cov)}><Ic.share style={{ width: 18, height: 18 }} />Share / export</button>
      </div>
    </div>
  );
}

/* ---------- Reports history ---------- */
function ReportsHistory({ nav, projects, onShare }) {
  const rows = projects.map(p => ({ p, date: p.scans[p.scans.length - 1].date })).sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="screen">
      <div className="appbar">
        <div className="appbar-row">
          <div><h1>Reports</h1><p className="sub">Every report across the portfolio · {projects.length}</p></div>
          <button className="btn btn-ghost btn-sm" onClick={() => nav.go('issues')}><Ic.alert style={{ width: 15, height: 15, color: 'var(--amber)' }} />Issues</button>
        </div>
      </div>
      <div className="body pad pad-b">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(({ p, date }) => (
            <button key={p.id} className="card card-pad" onClick={() => nav.go('report', { id: p.id, coverage: p.coverage })} style={{ textAlign: 'left', width: '100%' }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <div className="row gap8"><Ic.reports style={{ width: 17, height: 17, color: 'var(--navy)' }} /><span style={{ fontSize: 14.5, fontWeight: 700 }}>{p.short}</span></div>
                <StageChip stage={p.stage} />
              </div>
              <div className="row between">
                <div className="row gap10">
                  <MiniDonut value={p.coverage} size={34} stroke={4} />
                  <div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Progress report</div><div className="mono" style={{ fontSize: 12.5, fontWeight: 700 }}>{fdate(date)}</div></div>
                </div>
                <div className="row gap6" style={{ color: 'var(--navy)', fontSize: 12.5, fontWeight: 650 }}>{p.depth === 'deep' ? 'Full' : 'Summary'}<Ic.chevR style={{ width: 15, height: 15 }} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Report, ReportsHistory });
