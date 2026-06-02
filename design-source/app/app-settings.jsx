// app-settings.jsx — Settings (tab root) + Profile.
const { T, Icon, Avatar, Bar, Mark, Wordmark, Button, Card, SectionLabel, ScreenHeader, DATA, SUB_PLANS, SUB_ADDONS, haptic } = window;
const { Screen, PushHeader, useNav, Toast } = window;

function Toggle({ on, onChange }) {
  return (
    <button onClick={() => { haptic(); onChange(!on); }} style={{
      width: 50, height: 30, borderRadius: 30, border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0,
      background: on ? T.accent : 'rgba(255,255,255,0.14)', transition: 'background .2s', display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start',
    }}>
      <div style={{ width: 26, height: 26, borderRadius: 26, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.3)', transition: 'all .2s' }} />
    </button>
  );
}

function Row({ icon, iconBg, title, value, toggle, onToggle, chevron, onClick, last }) {
  return (
    <div onClick={onClick ? () => { haptic(); onClick(); } : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 15px', cursor: onClick ? 'pointer' : 'default',
        borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      {icon && <div style={{ width: 30, height: 30, borderRadius: 8, background: iconBg || 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={17} color={T.text} stroke={1.9} /></div>}
      <div style={{ flex: 1, fontSize: 15.5, fontWeight: 500, color: T.text }}>{title}</div>
      {value !== undefined && <span style={{ fontSize: 14.5, color: T.muted, marginRight: 2 }}>{value}</span>}
      {toggle !== undefined && <Toggle on={toggle} onChange={onToggle} />}
      {chevron && <Icon name="chevron" size={17} color="rgba(255,255,255,0.22)" />}
    </div>
  );
}

// ════════════════ SETTINGS ════════════════
function Settings() {
  const nav = useNav();
  const u = DATA.user, s = DATA.subscription;
  const [toggles, setToggles] = React.useState({ auto: true, notif: true });
  const set = (k, v) => setToggles(t => ({ ...t, [k]: v }));
  return (
    <Screen>
      <ScreenHeader title="Settings" />
      <div style={{ padding: '4px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* profile row */}
        <Card pressable onClick={() => nav.push(<Profile />)} style={{ padding: 15, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials="JM" size={52} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{u.name}</div>
            <div style={{ fontSize: 13.5, color: T.muted, marginTop: 2 }}>{u.role} · {u.company}</div>
          </div>
          <Icon name="chevron" size={18} color="rgba(255,255,255,0.22)" />
        </Card>

        {/* subscription */}
        <div>
          <SectionLabel>Subscription</SectionLabel>
          <Card style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{s.plan}</div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>Renews {s.renews}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.accent }}>{s.price}<span style={{ fontSize: 13, color: T.muted, fontWeight: 600 }}>/{s.period}</span></div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.muted, marginBottom: 7 }}>
                <span>Projects used</span><span style={{ color: T.text, fontWeight: 600 }}>{s.used} of {s.limit}</span></div>
              <Bar value={s.used / s.limit * 100} color={T.accent} height={7} />
            </div>
            <button onClick={() => { haptic(); nav.push(<Plans />); }} style={{ width: '100%', height: 44, marginTop: 16, borderRadius: 12, border: `1px solid ${T.accent}55`, background: 'rgba(20,184,192,0.1)', color: T.accent, fontSize: 14.5, fontWeight: 700, fontFamily: T.font, cursor: 'pointer' }}>See all plans</button>
          </Card>
        </div>

        {/* scanning */}
        <div>
          <SectionLabel>Scanning</SectionLabel>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Row icon="bolt" title="Scan quality" value="High" chevron onClick={() => {}} />
            <Row icon="ruler" title="Units" value="Metric (m)" chevron onClick={() => {}} />
            <Row icon="cube" title="BIM format" value="IFC" chevron onClick={() => {}} />
            <Row icon="upload" title="Auto-upload scans" toggle={toggles.auto} onToggle={v => set('auto', v)} last />
          </Card>
        </div>

        {/* app */}
        <div>
          <SectionLabel>App</SectionLabel>
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <Row icon="bell" title="Notifications" toggle={toggles.notif} onToggle={v => set('notif', v)} />
            <Row icon="lock" title="Privacy & data" chevron onClick={() => {}} />
            <Row icon="info" title="About" value="v1.0 (1)" chevron onClick={() => {}} last />
          </Card>
        </div>

        <div style={{ textAlign: 'center', padding: '4px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: 0.5 }}><Mark size={22} /><Wordmark size={14} /></div>
          <div style={{ fontSize: 11.5, color: T.faint }}>Athar Robotics · See progress · Prove progress</div>
        </div>
      </div>
    </Screen>
  );
}

// ════════════════ PROFILE ════════════════
function Profile() {
  const u = DATA.user;
  return (
    <div style={{ height: '100%' }}>
      <PushHeader title="Profile" />
      <Screen padTop={0} style={{ marginTop: -2 }}>
        <div style={{ padding: '12px 20px 8px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '12px 0 4px' }}>
            <Avatar initials="JM" size={88} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: -0.4 }}>{u.name}</div>
              <div style={{ fontSize: 14, color: T.muted, marginTop: 3 }}>{u.role} · {u.company}</div>
            </div>
          </div>

          <Card style={{ padding: '18px 8px', display: 'flex' }}>
            {[['Projects', u.stats.projects], ['Scans', u.stats.scans], ['Reports', u.stats.reports]].map(([l, n], i) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', borderLeft: i ? `1px solid ${T.hairline}` : 'none' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: T.accent }}>{n}</div>
                <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </Card>

          <div>
            <SectionLabel>Details</SectionLabel>
            <Card style={{ padding: '4px 16px' }}>
              {[['Company', u.company], ['Role', u.role], ['Region', u.region], ['Member since', u.since]].map((r, i, a) => (
                <div key={r[0]} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < a.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
                  <span style={{ fontSize: 14.5, color: T.muted }}>{r[0]}</span>
                  <span style={{ fontSize: 14.5, color: T.text, fontWeight: 600 }}>{r[1]}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </Screen>
    </div>
  );
}

// ════════════════ PLANS ════════════════
function Plans() {
  const [sel, setSel] = React.useState(() => (SUB_PLANS.find(p => p.current) || SUB_PLANS[2]).id);
  const [toast, setToast] = React.useState(null);
  const current = SUB_PLANS.find(p => p.current);
  const chosen = SUB_PLANS.find(p => p.id === sel);
  const isCurrent = chosen && chosen.current;
  return (
    <div style={{ height: '100%' }}>
      <PushHeader title="Plans" />
      <Screen padTop={0}>
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>Choose your plan</div>
          <div style={{ fontSize: 14, color: T.muted, marginTop: 6, lineHeight: 1.45 }}>Affordable subscriptions tuned to small & medium UK contractors. Cancel anytime.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
            {SUB_PLANS.map(pl => {
              const on = pl.id === sel;
              return (
                <div key={pl.id} onClick={() => { haptic(); setSel(pl.id); }} style={{
                  cursor: 'pointer', borderRadius: 18, padding: 16,
                  background: on ? 'linear-gradient(150deg, rgba(20,184,192,0.12), rgba(20,184,192,0.04))' : T.surface,
                  border: `1.5px solid ${on ? T.accent : T.hairline}`, transition: 'border-color .15s, background .15s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 17, fontWeight: 800 }}>{pl.name}</span>
                        {pl.current && <span style={{ fontSize: 10.5, fontWeight: 800, color: T.accent, background: 'rgba(20,184,192,0.15)', padding: '2px 7px', borderRadius: 6, letterSpacing: 0.3, textTransform: 'uppercase' }}>Current</span>}
                      </div>
                      <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>{pl.tagline}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: on ? T.accent : T.text }}>{pl.price}</div>
                      <div style={{ fontSize: 12, color: T.muted }}>/{pl.period}</div>
                    </div>
                  </div>
                  {on && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.hairline}`, display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {pl.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 18, background: 'rgba(20,184,192,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="check" size={11} color={T.accent} stroke={3.4} /></div>
                          <span style={{ fontSize: 13.5, color: T.text }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* add-ons */}
          <SectionLabel>Services & add-ons</SectionLabel>
          <Card style={{ padding: '4px 16px' }}>
            {SUB_ADDONS.map((a, i) => (
              <div key={a.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: i < SUB_ADDONS.length - 1 ? `1px solid ${T.hairline2}` : 'none' }}>
                <span style={{ fontSize: 14.5, color: T.text }}>{a.label}</span>
                <span style={{ fontSize: 14.5, color: T.accent, fontWeight: 700 }}>{a.price}</span>
              </div>
            ))}
          </Card>

          <div style={{ height: 16 }} />
          <Button primary onClick={() => setToast(isCurrent ? 'This is your current plan' : `Switched to ${chosen.name} · ${chosen.price}/${chosen.period}`)} style={{ width: '100%' }}>
            {isCurrent ? 'Your current plan' : `Switch to ${chosen.name}`}
          </Button>
          <div style={{ fontSize: 12, color: T.faint, textAlign: 'center', marginTop: 10, lineHeight: 1.45 }}>Billing is simulated in this prototype.</div>
        </div>
      </Screen>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

Object.assign(window, { Settings, Profile, Plans });
