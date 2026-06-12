/* OptiSync — ZoneBars. Per-zone coverage as labelled horizontal bars. */
export function ZoneBars({ zones = [] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      {zones.map((z, i) => {
        const cov = Math.max(0, Math.min(100, Math.round(z.coverage)));
        return (
          <div key={i}>
            <div className="row between" style={{ marginBottom: 5 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{z.name}</span>
              <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: cov >= 100 ? 'var(--teal)' : 'var(--ink)' }}>{cov}%</span>
            </div>
            <div className="zbar-track"><div className={'zbar-fill' + (cov >= 100 ? ' complete' : '')} style={{ width: cov + '%' }} /></div>
          </div>
        );
      })}
    </div>
  );
}
