/* OptiSync — Button. Navy primary action used across the app. */
export function Button({ variant = 'primary', size = 'md', block, icon, disabled, children, onClick, ...rest }) {
  const cls = [
    'btn',
    variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : variant === 'teal' ? 'btn-teal' : 'btn-primary',
    size === 'sm' ? 'btn-sm' : '',
    block ? 'btn-block' : ''
  ].filter(Boolean).join(' ');
  return (
    <button className={cls} disabled={disabled} onClick={onClick} {...rest}>
      {icon}{children}
    </button>
  );
}
