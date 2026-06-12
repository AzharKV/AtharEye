/* OptiSync — StatusPill. Dot + label for project health. */
const MAP = { 'On track': 'ontrack', 'Needs review': 'review', 'Behind': 'behind', 'Complete': 'done' };
export function StatusPill({ status = 'On track' }) {
  return <span className={'status ' + (MAP[status] || 'ontrack')}><span className="dot" />{status}</span>;
}
