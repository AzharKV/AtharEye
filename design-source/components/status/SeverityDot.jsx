/* OptiSync — SeverityDot. Red / amber / grey issue severity. */
export function SeverityDot({ severity = 'Minor', label }) {
  return (
    <span className="row gap6" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <span className={'sev ' + severity} />
      {label && <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink)' }}>{label}</span>}
    </span>
  );
}
