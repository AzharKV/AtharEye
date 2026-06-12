/* OptiSync — StageChip. Project build-stage with colour key. */
const STAGE = {
  Early: { cls: 'early', label: 'Early stage' },
  Mid: { cls: 'mid', label: 'Mid-build' },
  Complete: { cls: 'complete', label: 'Complete' }
};
export function StageChip({ stage = 'Early', label }) {
  const s = STAGE[stage] || STAGE.Early;
  return <span className={'chip ' + s.cls}><span className="dot" />{label || s.label}</span>;
}
