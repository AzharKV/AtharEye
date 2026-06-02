// app-nav.jsx — navigation: Navigator (push/pop stacks), useNav, PushHeader, TabBar, Screen.
const { T, Icon, haptic } = window;

const NavCtx = React.createContext(null);
const useNav = () => React.useContext(NavCtx);
let _uid = 0; const uid = () => 'sc' + (++_uid);

// ── Navigator — one per tab. Holds a stack; animates iOS push/pop.
function Navigator({ root, navRef }) {
  const [stack, setStack] = React.useState(() => [{ id: uid(), el: root }]);
  const [anim, setAnim] = React.useState(null); // {type:'push'|'pop'}
  const lock = React.useRef(false);

  const push = React.useCallback((el) => {
    if (lock.current) return; lock.current = true; haptic();
    setStack(s => [...s, { id: uid(), el }]); setAnim({ type: 'push' });
    setTimeout(() => { setAnim(null); lock.current = false; }, 380);
  }, []);
  const pop = React.useCallback(() => {
    setStack(s => {
      if (s.length <= 1) return s;
      if (lock.current) return s; lock.current = true; haptic();
      setAnim({ type: 'pop' });
      setTimeout(() => { setStack(cur => cur.slice(0, -1)); setAnim(null); lock.current = false; }, 380);
      return s;
    });
  }, []);
  const popToRoot = React.useCallback(() => setStack(s => s.slice(0, 1)), []);

  React.useEffect(() => { if (navRef) navRef.current = { push, pop, popToRoot, depth: stack.length }; });

  const top = stack.length - 1;
  const api = { push, pop, popToRoot, canPop: stack.length > 1 };

  return (
    <NavCtx.Provider value={api}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stack.map((sc, i) => {
          const depth = top - i;
          let animName = '', dim = depth > 0 ? 0.55 : 0;
          if (anim?.type === 'push') {
            if (i === top) { animName = 'navEnter'; }
            else if (i === top - 1) { animName = 'navToUnder'; dim = 0.55; }
            else { dim = 0.55; }
          } else if (anim?.type === 'pop') {
            if (i === top) { animName = 'navExit'; dim = 0; }
            else if (i === top - 1) { animName = 'navFromUnder'; dim = 0; }
            else { dim = 0.55; }
          }
          const baseX = animName ? undefined : (depth === 0 ? '0' : '-24%');
          return (
            <div key={sc.id} style={{
              position: 'absolute', inset: 0, background: T.bg, willChange: 'transform',
              transform: baseX !== undefined ? `translateX(${baseX})` : undefined,
              animation: animName ? `${animName} .38s cubic-bezier(.32,.72,0,1) forwards` : 'none',
              boxShadow: depth === 0 ? '-12px 0 30px rgba(0,0,0,0.35)' : 'none',
              zIndex: i,
            }}>
              {sc.el}
              <div style={{
                position: 'absolute', inset: 0, background: '#05080B', pointerEvents: depth > 0 ? 'none' : 'none',
                opacity: dim, transition: 'opacity .38s cubic-bezier(.32,.72,0,1)',
              }} />
            </div>
          );
        })}
      </div>
    </NavCtx.Provider>
  );
}

// ── Screen scroll wrapper
function Screen({ children, padTop = 54, padBottom = 100, scrollRef, style = {} }) {
  return (
    <div ref={scrollRef} className="no-scrollbar" style={{
      height: '100%', overflowY: 'auto', overflowX: 'hidden', background: T.bg, color: T.text,
      paddingTop: padTop, paddingBottom: padBottom, WebkitOverflowScrolling: 'touch', ...style,
    }}>{children}</div>
  );
}

// ── Back/push header — translucent bar with back chevron
function PushHeader({ title, trailing, onBack, transparent }) {
  const nav = useNav();
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 20, paddingTop: 50,
      display: 'flex', alignItems: 'center', gap: 8, padding: '50px 14px 10px',
      background: transparent ? 'transparent' : 'rgba(12,15,18,0.78)',
      backdropFilter: transparent ? 'none' : 'blur(18px) saturate(160%)',
      WebkitBackdropFilter: transparent ? 'none' : 'blur(18px) saturate(160%)',
      borderBottom: transparent ? 'none' : `1px solid ${T.hairline}`,
    }}>
      <button onClick={() => { (onBack || nav.pop)(); }} style={{
        width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.hairline}`, background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
      }}><Icon name="chevronL" size={20} color={T.text} /></button>
      <div style={{ flex: 1, fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: -0.3, textAlign: 'center',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
      <div style={{ minWidth: 38, display: 'flex', justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

// ── Round icon button (header trailing)
function RoundBtn({ icon, onClick }) {
  return (
    <button onClick={() => { haptic(); onClick && onClick(); }} style={{
      width: 38, height: 38, borderRadius: 12, border: `1px solid ${T.hairline}`, background: 'rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
    }}><Icon name={icon} size={20} color={T.muted} /></button>
  );
}

// ── Bottom tab bar — Projects · Reports · [Scan] · Settings
function TabBar({ active, onTab, onScan }) {
  const item = (name, icon) => {
    const on = active === name;
    return (
      <button onClick={() => { haptic(); onTab(name); }} style={{
        flex: 1, background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '9px 0 0',
        color: on ? T.accent : T.muted,
      }}>
        <Icon name={icon} size={25} stroke={on ? 2.3 : 2} />
        <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 600, letterSpacing: -0.1 }}>{name}</span>
      </button>
    );
  };
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-start', padding: '0 6px 24px',
      background: 'rgba(12,15,18,0.82)', backdropFilter: 'blur(22px) saturate(160%)',
      WebkitBackdropFilter: 'blur(22px) saturate(160%)', borderTop: `1px solid ${T.hairline}`,
    }}>
      {item('Projects', 'projects')}
      {item('Reports', 'reports')}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => { haptic(); onScan(); }} style={{
          marginTop: -16, width: 58, height: 58, borderRadius: 19, border: 'none', cursor: 'pointer',
          background: `linear-gradient(160deg, ${T.accent2}, ${T.accentPress})`,
          boxShadow: '0 6px 20px rgba(20,184,192,0.5), inset 0 1px 0 rgba(255,255,255,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.onAccent,
        }}><Icon name="scan" size={27} stroke={2.4} color={T.onAccent} /></button>
      </div>
      {item('Settings', 'settings')}
    </div>
  );
}

Object.assign(window, { NavCtx, useNav, Navigator, Screen, PushHeader, RoundBtn, TabBar });

// App-level actions (provided by app.jsx) — launch scan modal, jump to a report.
const AppActionsCtx = React.createContext({ startScan: () => {}, goToReports: () => {} });
const useAppActions = () => React.useContext(AppActionsCtx);
Object.assign(window, { AppActionsCtx, useAppActions });
