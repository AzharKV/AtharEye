/* OptiSync — CRUD editor sheets (Form sheet, confirm-delete, scan detail) */

function EdIcon({ d, ...p }) { return <svg viewBox="0 0 24 24" fill="none" {...p}><path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
const PencilIcon = (p) => <EdIcon d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 7l3 3" {...p} />;

/* ---------- generic form sheet ---------- */
function FormSheet({ title, subtitle, fields, initial, project, onSave, onClose, onDelete, saveLabel }) {
  const [v, setV] = useState(() => Object.assign({}, initial));
  const [confirm, setConfirm] = useState(false);
  const set = (k, val) => setV(s => Object.assign({}, s, { [k]: val }));
  const missing = fields.some(f => f.required && (v[f.key] === undefined || v[f.key] === '' || v[f.key] === null));

  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="row between" style={{ marginBottom: 14 }}>
          <div><div style={{ fontSize: 17, fontWeight: 700 }}>{title}</div>{subtitle && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 1 }}>{subtitle}</div>}</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--canvas)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.x style={{ width: 17, height: 17 }} /></button>
        </div>

        {fields.map(f => (
          <div className="field" key={f.key}>
            <label>{f.label}</label>
            {f.type === 'segment' ? (
              <div className="row gap8">
                {f.options.map(o => {
                  const on = v[f.key] === (o.value !== undefined ? o.value : o);
                  const val = o.value !== undefined ? o.value : o; const lbl = o.label !== undefined ? o.label : o;
                  return <button key={val} onClick={() => set(f.key, val)} style={{ flex: 1, padding: '10px 6px', borderRadius: 9, fontSize: 13, fontWeight: 600, border: '1px solid ' + (on ? 'var(--navy)' : 'var(--hairline)'), background: on ? 'var(--navy-08)' : 'var(--surface)', color: on ? 'var(--navy)' : 'var(--muted)' }}>{lbl}</button>;
                })}
              </div>
            ) : f.type === 'sev' ? (
              <div className="row gap8">
                {['Critical', 'Major', 'Minor'].map(s => {
                  const on = v[f.key] === s; const c = { Critical: 'var(--red)', Major: 'var(--amber)', Minor: '#9aa7b6' }[s];
                  return <button key={s} onClick={() => set(f.key, s)} className="row gap6" style={{ flex: 1, justifyContent: 'center', padding: '10px 6px', borderRadius: 9, fontSize: 12.5, fontWeight: 700, border: '1px solid ' + (on ? c : 'var(--hairline)'), background: on ? c + '14' : 'var(--surface)', color: on ? c : 'var(--muted)' }}><span style={{ width: 8, height: 8, borderRadius: 4, background: c }} />{s}</button>;
                })}
              </div>
            ) : f.type === 'select' ? (
              <select value={v[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                {f.placeholder && <option value="">{f.placeholder}</option>}
                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === 'zone' ? (
              <select value={v[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                {project.zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea rows={3} value={v[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} style={{ resize: 'none' }} />
            ) : f.type === 'number' ? (
              <input value={v[f.key] ?? ''} onChange={e => set(f.key, e.target.value.replace(/[^0-9]/g, ''))} inputMode="numeric" placeholder={f.placeholder} />
            ) : (
              <input value={v[f.key] || ''} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
            )}
            {f.hint && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{f.hint}</div>}
          </div>
        ))}

        <button className="btn btn-primary btn-block" disabled={missing} style={{ marginTop: 6, opacity: missing ? .45 : 1 }} onClick={() => onSave(v)}>{saveLabel || 'Save'}</button>
        {onDelete && (confirm
          ? <div className="row gap8" style={{ marginTop: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn btn-block" style={{ flex: 1, background: 'var(--red)', color: '#fff' }} onClick={onDelete}>Delete</button>
            </div>
          : <button onClick={() => setConfirm(true)} style={{ width: '100%', marginTop: 12, padding: 10, color: 'var(--red)', fontSize: 13.5, fontWeight: 650, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}><Ic.trash style={{ width: 16, height: 16 }} />Delete</button>)}
      </div>
    </div>
  );
}

/* ---------- section header with add ---------- */
function SectionHead({ label, count, onAdd, right }) {
  return (
    <div className="row between" style={{ marginBottom: 10 }}>
      <div className="row gap8" style={{ alignItems: 'baseline' }}>
        <div className="section-label" style={{ margin: 0 }}>{label}</div>
        {count != null && <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{count}</span>}
      </div>
      {onAdd ? <button onClick={onAdd} className="row gap4" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 3 }}><Ic.plus style={{ width: 15, height: 15 }} />Add</button> : right}
    </div>
  );
}

/* ---------- scan detail (log entry) ---------- */
function ScanDetailSheet({ project, index, onClose, onReport }) {
  const scan = project.scans[index];
  const prev = index > 0 ? project.scans[index - 1] : null;
  const delta = prev ? scan.coverage - prev.coverage : scan.coverage;
  const st = window.OPTISYNC.stateAt(project, scan.coverage);
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="row between" style={{ marginBottom: 14 }}>
          <div><div style={{ fontSize: 17, fontWeight: 700 }}>Scan · {fdate(scan.date)}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{project.short} · {scan.note}</div></div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 15, background: 'var(--canvas)', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic.x style={{ width: 17, height: 17 }} /></button>
        </div>
        <div className="row gap10" style={{ marginBottom: 14 }}>
          <div style={{ flex: 1, background: 'var(--canvas)', borderRadius: 12, padding: '12px 14px' }}><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Coverage</div><div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{scan.coverage}%</div></div>
          <div style={{ flex: 1, background: 'var(--canvas)', borderRadius: 12, padding: '12px 14px' }}><div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>Change</div><div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--teal)' }}>+{delta}%</div></div>
        </div>
        <div className="section-label">Aligned to BIM</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--ink)' }}>
          <span className="mono" style={{ fontWeight: 700 }}>{project.bim.file}</span> · LOD <span className="mono">{project.bim.lod}</span><br />
          <span style={{ color: 'var(--muted)' }}>Captured by M. Ahmed · iPhone LiDAR · {prev ? 'previous scan ' + fdate(prev.date) + ' (' + prev.coverage + '%)' : 'baseline scan'}</span>
        </div>
        <div className="section-label" style={{ marginTop: 16 }}>Zone state at this scan</div>
        <ZoneBars zones={st.zones} />
        <div className="row gap10" style={{ marginTop: 16 }}>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
          {onReport && <button className="btn btn-primary" style={{ flex: 1.3 }} onClick={onReport}><Ic.reports style={{ width: 17, height: 17 }} />View this report</button>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FormSheet, SectionHead, ScanDetailSheet, PencilIcon });
