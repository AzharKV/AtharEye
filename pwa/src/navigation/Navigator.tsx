// Navigator.tsx — push/pop stack navigator (one per tab) animating iOS push/pop,
// plus the Screen scroll wrapper. Ported verbatim from design-source/app/app-nav.jsx.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MutableRefObject, ReactNode } from 'react';
import { T } from '../theme';
import { haptic } from '../lib/haptic';

export interface NavApi {
  push: (el: ReactNode) => void;
  pop: () => void;
  popToRoot: () => void;
  canPop: boolean;
}

export interface NavHandle {
  push: (el: ReactNode) => void;
  pop: () => void;
  popToRoot: () => void;
  depth: number;
}

const NavCtx = createContext<NavApi | null>(null);
export const useNav = (): NavApi => {
  const ctx = useContext(NavCtx);
  if (!ctx) throw new Error('useNav must be used within a <Navigator>');
  return ctx;
};

let _uid = 0;
const uid = () => 'sc' + ++_uid;

interface StackItem {
  id: string;
  el: ReactNode;
}
type Anim = { type: 'push' | 'pop' } | null;

export function Navigator({
  root,
  navRef,
}: {
  root: ReactNode;
  navRef?: MutableRefObject<NavHandle | null>;
}) {
  const [stack, setStack] = useState<StackItem[]>(() => [{ id: uid(), el: root }]);
  const [anim, setAnim] = useState<Anim>(null);
  const lock = useRef(false);

  const push = useCallback((el: ReactNode) => {
    if (lock.current) return;
    lock.current = true;
    haptic();
    setStack((s) => [...s, { id: uid(), el }]);
    setAnim({ type: 'push' });
    setTimeout(() => {
      setAnim(null);
      lock.current = false;
    }, 380);
  }, []);

  const pop = useCallback(() => {
    setStack((s) => {
      if (s.length <= 1) return s;
      if (lock.current) return s;
      lock.current = true;
      haptic();
      setAnim({ type: 'pop' });
      setTimeout(() => {
        setStack((cur) => cur.slice(0, -1));
        setAnim(null);
        lock.current = false;
      }, 380);
      return s;
    });
  }, []);

  const popToRoot = useCallback(() => setStack((s) => s.slice(0, 1)), []);

  // Expose imperative handle (kept fresh each render so `depth` is current).
  useEffect(() => {
    if (navRef) navRef.current = { push, pop, popToRoot, depth: stack.length };
  });

  const top = stack.length - 1;
  const api: NavApi = { push, pop, popToRoot, canPop: stack.length > 1 };

  return (
    <NavCtx.Provider value={api}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stack.map((sc, i) => {
          const depth = top - i;
          let animName = '';
          let dim = depth > 0 ? 0.55 : 0;
          if (anim?.type === 'push') {
            if (i === top) {
              animName = 'navEnter';
            } else if (i === top - 1) {
              animName = 'navToUnder';
              dim = 0.55;
            } else {
              dim = 0.55;
            }
          } else if (anim?.type === 'pop') {
            if (i === top) {
              animName = 'navExit';
              dim = 0;
            } else if (i === top - 1) {
              animName = 'navFromUnder';
              dim = 0;
            } else {
              dim = 0.55;
            }
          }
          const baseX = animName ? undefined : depth === 0 ? '0' : '-24%';
          return (
            <div
              key={sc.id}
              style={{
                position: 'absolute',
                inset: 0,
                background: T.bg,
                willChange: 'transform',
                transform: baseX !== undefined ? `translateX(${baseX})` : undefined,
                animation: animName ? `${animName} .38s cubic-bezier(.32,.72,0,1) forwards` : 'none',
                boxShadow: depth === 0 ? '-12px 0 30px rgba(0,0,0,0.35)' : 'none',
                zIndex: i,
              }}
            >
              {sc.el}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#05080B',
                  pointerEvents: 'none',
                  opacity: dim,
                  transition: 'opacity .38s cubic-bezier(.32,.72,0,1)',
                }}
              />
            </div>
          );
        })}
      </div>
    </NavCtx.Provider>
  );
}

// ── Screen scroll wrapper
export function Screen({
  children,
  // list/large-title screens get the status-bar inset; detail screens pass an
  // explicit numeric padTop (0/92…) and are unaffected (§4.6 safe areas).
  padTop = 'max(54px, env(safe-area-inset-top))',
  padBottom = 100,
  scrollRef,
  style = {},
}: {
  children: ReactNode;
  padTop?: number | string;
  padBottom?: number;
  scrollRef?: MutableRefObject<HTMLDivElement | null>;
  style?: CSSProperties;
}) {
  return (
    <div
      ref={scrollRef}
      className="no-scrollbar"
      style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: T.bg,
        color: T.text,
        paddingTop: padTop,
        paddingBottom: padBottom,
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
