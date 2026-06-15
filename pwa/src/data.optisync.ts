// OptiSync demo seed — the 'optisync' phase (Athar Robotics recording our own app; see lib/store.ts).
// Only the identity (company/user/team/subscription/settings) is used: the store swaps to it when the
// client project is deleted (projects stay empty so the demo creates a project live on camera). The
// live camera + BIM-mismatch result are wired in ScanFlow behind the same phase flag.
import type { AppData } from './types';

export const SEED_OPTISYNC: AppData = {
  projects: [],
  company: {
    name: 'Athar Robotics',
    companyNo: 'SC764201',
    vat: 'GB 421 9930 17',
    registeredOffice: 'Bayes Centre, 47 Potterrow, Edinburgh, EH8 9BT',
    established: '2024',
    monogram: 'OS',
  },
  user: {
    name: 'OptiSync Demo',
    role: 'Product team',
    email: 'hello@optisync.app',
    initials: 'OS',
  },
  team: [
    { id: 'm-os', name: 'OptiSync Demo', initials: 'OS', role: 'Owner', email: 'hello@optisync.app', trade: 'Product' },
  ],
  subscription: {
    plan: 'Pro',
    price: '£99',
    period: '/mo',
    renews: '01 Jul 2026',
    used: 0,
    limit: 30,
    tiers: [
      { id: 'free', name: 'Free', price: '£0', period: '/mo', tagline: 'Try OptiSync', features: ['1 project', 'Watermarked reports', 'Community support'] },
      { id: 'starter', name: 'Starter', price: '£19', period: '/mo', tagline: 'Sole traders', features: ['3 projects', 'Unwatermarked reports', 'Email support'] },
      { id: 'business', name: 'Business', price: '£49', period: '/mo', tagline: 'Growing contractors', features: ['10 projects', 'PDF export + share links', 'Team access (4 seats)', 'Priority support'] },
      { id: 'pro', name: 'Pro', price: '£99', period: '/mo', current: true, tagline: 'Multi-site teams', features: ['30 projects', 'Unlimited seats', 'Custom branding on reports', 'BIM auto-align'] },
      { id: 'enterprise', name: 'Enterprise', price: '£149', period: '/mo', tagline: 'Unlimited + priority', features: ['Unlimited projects', 'SSO + audit log', 'Dedicated success manager', 'SLA'] },
    ],
    addons: [
      { label: 'Prepared report (per report)', price: '£300–£750' },
      { label: 'BIM model setup', price: '~£500' },
    ],
  },
  settings: {
    units: 'Metric (m²)',
    dateFormat: 'DD MMM YYYY',
    lidarQuality: 'High',
    autoAlign: true,
    notifications: true,
  },
};
