/* OptiSync UI kit — Projects home. */
function ProjectsScreen({ onOpen }) {
  const { StageChip, StatusPill } = DS;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('All');
  const filters = ['All', 'Needs review', 'Early', 'Mid', 'Complete'];
  const list = window.KIT.projects.filter(p => {
    const mq = !q || (p.name + ' ' + p.location + ' ' + p.client).toLowerCase().includes(q.toLowerCase());
    const mf = filter === 'All' || (filter === 'Needs review' ? p.status === 'Needs review' : p.stage === filter);
    return mq && mf;
  });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--canvas)' }}>
      <div style={{ background: 'var(--surface)', borderBottom: '2px solid var(--navy)', padding: '58px 20px 12px' }}>
        <div className="row between">
          <div><h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-.02em' }}>Projects</h1><p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>4 active projects</p></div>
          <button className="btn btn-primary btn-sm"><KitIc.plus width={16} height={16} />New</button>
        </div>
        <div className="row gap8" style={{ marginTop: 12, background: 'var(--canvas)', border: '1px solid var(--hairline)', borderRadius: 10, padding: '9px 11px' }}>
          <KitIc.search width={17} height={17} style={{ color: 'var(--muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, clients, locations" style={{ border: 'none', background: 'none', outline: 'none', flex: 1, fontSize: 14, color: 'var(--ink)', fontFamily: 'inherit' }} />
        </div>
        <div className="row gap6" style={{ marginTop: 11, overflowX: 'auto' }}>
          {filters.map(f => {
            const on = filter === f, attn = f === 'Needs review';
            return <button key={f} onClick={() => setFilter(f)} style={{ flex: 'none', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 999, whiteSpace: 'nowrap', background: on ? (attn ? 'var(--amber)' : 'var(--navy)') : (attn ? 'var(--amber-10)' : 'var(--canvas)'), color: on ? '#fff' : (attn ? 'var(--amber)' : 'var(--muted)'), border: '1px solid ' + (on ? (attn ? 'var(--amber)' : 'var(--navy)') : (attn ? 'rgba(181,120,26,.32)' : 'var(--hairline)')) }}>{f === 'Early' ? 'Early stage' : f === 'Mid' ? 'Mid-build' : f}</button>;
          })}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, paddingBottom: 108 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(p => (
            <button key={p.id} onClick={() => onOpen(p.id)} className="card card-pad row gap12" style={{ width: '100%', textAlign: 'left' }}>
              <MiniDonut value={p.coverage} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row between gap8">
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.short}</span>
                  <span style={{ flex: 'none' }}><StageChip stage={p.stage} /></span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', margin: '2px 0 7px', display: 'flex', alignItems: 'center', gap: 4 }}><KitIc.pin width={12} height={12} />{p.location.split(',').slice(-2).join(',').trim()}</div>
                <StatusPill status={p.status} />
              </div>
              <KitIc.chevR width={17} height={17} style={{ color: 'var(--muted)', flex: 'none' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
window.ProjectsScreen = ProjectsScreen;
