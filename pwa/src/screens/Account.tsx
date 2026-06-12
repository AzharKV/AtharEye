// Account / profile — identity, company card, portfolio stats, and links to Plan / Team / Settings.
// Plan & Team screens are built in phase 8; this is the account hub + computed stats.
import type { ReactNode } from 'react';
import { T } from '../theme';
import { useStore } from '../lib/store';
import { Screen, useNav } from '../navigation/Navigator';
import { PushHeader } from '../navigation/PushHeader';
import { Avatar, Card, ScreenHeader, SectionLabel, mono } from '../components/primitives';
import { Icon } from '../components/Icon';
import type { IconName } from '../components/Icon';
import { Settings } from './Settings';

export function Account() {
  const { data } = useStore();
  const nav = useNav();
  const ps = data.projects;
  const stats = {
    projects: ps.length,
    residential: ps.filter((p) => p.sector === 'Residential').length,
    commercial: ps.filter((p) => p.sector === 'Commercial').length,
    scans: ps.reduce((s, p) => s + p.scans.length, 0),
    open: ps.reduce((s, p) => s + p.issues.filter((i) => i.status === 'Open').length, 0),
    avg: Math.round(ps.reduce((s, p) => s + p.overall_coverage, 0) / Math.max(1, ps.length)),
  };
  const monogram = data.company.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <Screen>
      <ScreenHeader title="Account" />
      <div style={{ padding: '6px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Identity */}
        <Card style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials={monogram} size={56} color={T.navy} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.ink, letterSpacing: -0.3 }}>{data.user.name}</div>
            <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{data.user.role} · {data.company.name}</div>
            <div style={{ ...mono, fontSize: 12, color: T.faint, marginTop: 2 }}>{data.user.email}</div>
          </div>
        </Card>

        {/* Portfolio stats */}
        <Card style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Stat n={stats.projects} label="Projects" />
            <Stat n={stats.scans} label="Scans logged" />
            <Stat n={`${stats.avg}%`} label="Avg coverage" />
            <Stat n={`${stats.residential}/${stats.commercial}`} label="Res / Com" />
            <Stat n={stats.open} label="Open issues" c={stats.open ? T.amber : T.teal} />
            <Stat n={data.subscription.plan} label="Plan" small />
          </div>
        </Card>

        {/* Company */}
        <SectionLabel>Company</SectionLabel>
        <Card style={{ padding: '6px 16px' }}>
          <Row k="Registered name" v={data.company.name} />
          <Row k="Company no." v={<span style={mono}>{data.company.companyNo}</span>} />
          <Row k="VAT" v={<span style={mono}>{data.company.vat}</span>} />
          <Row k="Registered office" v={data.company.registeredOffice} />
          <Row k="Established" v={<span style={mono}>{data.company.established}</span>} last />
        </Card>

        {/* Links */}
        <SectionLabel>Workspace</SectionLabel>
        <Card style={{ padding: '4px 8px' }}>
          <NavRow icon="layers" label="Plan & billing" detail={`${data.subscription.plan} · ${data.subscription.price}${data.subscription.period}`} onClick={() => nav.push(<ComingSoon title="Plan & billing" />)} />
          <NavRow icon="team" label="Team & access" detail={`${data.team.length} members`} onClick={() => nav.push(<ComingSoon title="Team & access" />)} />
          <NavRow icon="settings" label="Settings" onClick={() => nav.push(<Settings />)} last />
        </Card>

        <div style={{ ...mono, textAlign: 'center', color: T.faint, fontSize: 11.5, padding: '8px 0 4px' }}>OptiSync v1.0.0</div>
      </div>
    </Screen>
  );
}

function Stat({ n, label, c, small }: { n: ReactNode; label: string; c?: string; small?: boolean }) {
  return (
    <div>
      <div style={{ ...mono, fontSize: small ? 15 : 22, fontWeight: 800, color: c ?? T.ink, letterSpacing: -0.5 }}>{n}</div>
      <div style={{ fontSize: 11, color: T.muted, marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Row({ k, v, last }: { k: string; v: ReactNode; last?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '8px 0', borderBottom: last ? 'none' : `1px solid ${T.hairline2}` }}>
      <span style={{ fontSize: 13, color: T.muted }}>{k}</span>
      <span style={{ fontSize: 13, color: T.ink, fontWeight: 600, textAlign: 'right' }}>{v}</span>
    </div>
  );
}

function NavRow({ icon, label, detail, onClick, last }: { icon: IconName; label: string; detail?: string; onClick: () => void; last?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', border: 'none', borderBottom: last ? 'none' : `1px solid ${T.hairline2}`, background: 'none', cursor: 'pointer', textAlign: 'left' }}
    >
      <div style={{ display: 'flex', padding: 7, borderRadius: 9, background: T.navyTint }}>
        <Icon name={icon} size={18} color={T.navy} />
      </div>
      <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: T.ink }}>{label}</span>
      {detail && <span style={{ fontSize: 12.5, color: T.muted }}>{detail}</span>}
      <Icon name="chevron" size={16} color={T.faint} />
    </button>
  );
}

// Temporary placeholder for the phase-8 screens (Plan & billing, Team & access).
function ComingSoon({ title }: { title: string }) {
  return (
    <Screen padTop={0}>
      <PushHeader title={title} />
      <div style={{ padding: '60px 30px', textAlign: 'center', color: T.muted }}>
        <Icon name="clock" size={28} color={T.faint} />
        <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: T.ink }}>{title}</div>
        <div style={{ fontSize: 13.5, marginTop: 4 }}>Coming in the next build phase.</div>
      </div>
    </Screen>
  );
}
