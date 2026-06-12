/* OptiSync — Field. Labelled text/select/textarea input. */
export function Field({ label, type = 'text', value, onChange, placeholder, options = [], hint, rows = 3 }) {
  const ctl = type === 'select'
    ? <select value={value || ''} onChange={e => onChange && onChange(e.target.value)}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    : type === 'textarea'
      ? <textarea rows={rows} value={value || ''} onChange={e => onChange && onChange(e.target.value)} placeholder={placeholder} style={{ resize: 'none' }} />
      : <input type={type === 'number' ? 'text' : type} inputMode={type === 'number' ? 'numeric' : undefined} value={value ?? ''}
          onChange={e => onChange && onChange(type === 'number' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value)} placeholder={placeholder} />;
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {ctl}
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

/* Segmented — 2–3 option inline picker (sector, status, units). */
export function Segmented({ value, options = [], onChange }) {
  return (
    <div className="row gap8">
      {options.map(o => {
        const on = value === o;
        return <button key={o} onClick={() => onChange && onChange(o)} style={{ flex: 1, padding: '11px 6px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1px solid ' + (on ? 'var(--navy)' : 'var(--hairline)'), background: on ? 'var(--navy-08)' : 'var(--surface)', color: on ? 'var(--navy)' : 'var(--muted)' }}>{o}</button>;
      })}
    </div>
  );
}
