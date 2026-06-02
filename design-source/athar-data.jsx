// athar-data.jsx — Demo content, SPEC §10 (authoritative, verbatim). Exports: DATA.

const DATA = {
  user: {
    name: 'James Mackay', role: 'Site Supervisor', company: 'Athar Robotics',
    region: 'Scotland, UK', since: 'Jan 2026',
    stats: { projects: 12, scans: 64, reports: 8 },
  },
  subscription: { plan: 'Small Business', price: '£99', period: 'month', renews: '14 Jun', used: 3, limit: 5 },

  projects: [
    {
      id: 'p1', name: 'Byres Road Retail Unit', type: 'Shop refit', location: 'Glasgow',
      pct: 74, status: 'Needs Review', area: 128, client: 'Westend Lettings Ltd',
      scans: 9, team: ['JM', 'AR', 'KD'], last: '2h ago',
      rooms: [
        { name: 'Shop Floor', pct: 88 }, { name: 'Stock Room', pct: 62 },
        { name: 'Staff WC', pct: 96 }, { name: 'Shopfront', pct: 70 }, { name: 'Rear Lobby', pct: 54 },
      ],
      issues: [
        { t: 'First-fix electrics incomplete', loc: 'Shop Floor · Grid B2', sev: 'high' },
        { t: 'Stud wall not boarded', loc: 'Stock Room · Grid C1', sev: 'med' },
        { t: 'Ceiling grid not installed', loc: 'Rear Lobby', sev: 'low' },
      ],
    },
    {
      id: 'p2', name: 'Morningside Townhouse Ext.', type: 'Residential extension', location: 'Edinburgh',
      pct: 58, status: 'On Track', area: 46, client: 'Private — Mr A. Sutherland',
      scans: 6, team: ['JM', 'PB'], last: '1d ago',
      rooms: [
        { name: 'Kitchen Ext.', pct: 64 }, { name: 'Utility', pct: 71 },
        { name: 'Roof Structure', pct: 40 }, { name: 'Foundations', pct: 95 },
      ],
      issues: [
        { t: 'Wall insulation pending', loc: 'Kitchen Ext. · North', sev: 'med' },
        { t: 'Roof felt not laid', loc: 'Roof Structure', sev: 'high' },
      ],
    },
    {
      id: 'p3', name: 'Union Street Office Fit-Out', type: 'Commercial · Level 3', location: 'Aberdeen',
      pct: 91, status: 'On Track', area: 310, client: 'Granite Workspace plc',
      scans: 14, team: ['KD', 'AR', 'PB', 'JM'], last: '4h ago',
      rooms: [
        { name: 'Open Plan', pct: 94 }, { name: 'Meeting Rms', pct: 88 }, { name: 'Reception', pct: 97 },
        { name: 'Server Room', pct: 85 }, { name: 'Kitchenette', pct: 90 },
      ],
      issues: [
        { t: 'Raised floor tile gap', loc: 'Open Plan · Zone D', sev: 'low' },
        { t: 'MEP final connections', loc: 'Server Room', sev: 'med' },
      ],
    },
    {
      id: 'p4', name: 'Dundee Waterfront Warehouse', type: 'Industrial', location: 'Dundee',
      pct: 82, status: 'Needs Review', area: 1140, client: 'Tay Logistics',
      scans: 11, team: ['AR', 'KD'], last: 'Yesterday',
      rooms: [
        { name: 'Main Floor', pct: 86 }, { name: 'Mezzanine', pct: 74 },
        { name: 'Loading Bay', pct: 91 }, { name: 'Office Block', pct: 62 },
      ],
      issues: [
        { t: 'Mezzanine slab thickness query', loc: 'Grid F4', sev: 'high' },
        { t: 'Loading dock door missing', loc: 'Loading Bay', sev: 'med' },
      ],
    },
    {
      id: 'p5', name: 'Stirling Flat Renovation', type: 'Residential', location: 'Stirling',
      pct: 39, status: 'On Track', area: 72, client: 'Forth Property Co.',
      scans: 3, team: ['PB'], last: '3d ago',
      rooms: [
        { name: 'Living Room', pct: 48 }, { name: 'Bathroom', pct: 30 },
        { name: 'Bedroom 1', pct: 52 }, { name: 'Hallway', pct: 26 },
      ],
      issues: [
        { t: 'Bathroom first-fix plumbing', loc: 'Bathroom', sev: 'high' },
        { t: 'Plastering not started', loc: 'Living Room', sev: 'med' },
      ],
    },
    {
      id: 'p6', name: 'Leith Café Build', type: 'Hospitality', location: 'Edinburgh',
      pct: 100, status: 'Complete', area: 88, client: 'Shore & Bean',
      scans: 18, team: ['JM', 'AR', 'KD'], last: 'Handover complete',
      rooms: [
        { name: 'Café Floor', pct: 100 }, { name: 'Kitchen', pct: 100 },
        { name: 'Counter', pct: 100 }, { name: 'WC', pct: 100 }, { name: 'Store', pct: 100 },
      ],
      issues: [],
    },
  ],

  // Team member display
  teamColors: {
    JM: '#14B8C0', AR: '#E8A33D', KD: '#2FBF71', PB: '#6E8AE5',
  },
  teamNames: {
    JM: 'James Mackay', AR: 'Aisha Rahman', KD: 'Kerr Douglas', PB: 'Priya Bose',
  },

  scanStats: { points: '1.84 M', alignment: '±21 mm' },
};

// Floor-plan grid layouts per project for the iso massing diagram (representative).
const PLANS = {
  p1: [
    { name: 'Shopfront', x: 0, y: 0, w: 6, h: 1, pct: 70 },
    { name: 'Shop Floor', x: 0, y: 1, w: 4, h: 3, pct: 88 },
    { name: 'Stock Room', x: 4, y: 1, w: 2, h: 2, pct: 62 },
    { name: 'Staff WC', x: 4, y: 3, w: 2, h: 1, pct: 96 },
    { name: 'Rear Lobby', x: 0, y: 4, w: 6, h: 1, pct: 54 },
  ],
  p5: [
    { name: 'Living Room', x: 0, y: 0, w: 4, h: 3, pct: 48 },
    { name: 'Bedroom 1', x: 4, y: 0, w: 3, h: 3, pct: 52 },
    { name: 'Bathroom', x: 0, y: 3, w: 3, h: 2, pct: 30 },
    { name: 'Hallway', x: 3, y: 3, w: 4, h: 2, pct: 26 },
  ],
};

function planFor(id) {
  return PLANS[id] || [
    { name: 'A', x: 0, y: 0, w: 4, h: 2, pct: 80 },
    { name: 'B', x: 4, y: 0, w: 2, h: 4, pct: 60 },
    { name: 'C', x: 0, y: 2, w: 4, h: 2, pct: 45 },
  ];
}

// BIM model linked to each project (the reference the scan is compared against).
const BIM = {
  p1: { file: 'ByresRoad_GF.ifc', size: '18.4 MB', ver: 'IFC4 · v3', uploaded: '28 May 2026', elements: '2,140' },
  p2: { file: 'Morningside_Ext.ifc', size: '9.1 MB', ver: 'IFC4 · v2', uploaded: '21 May 2026', elements: '870' },
  p3: { file: 'UnionSt_L3.ifc', size: '41.7 MB', ver: 'IFC4 · v5', uploaded: '30 May 2026', elements: '5,360' },
  p4: { file: 'DundeeWH.ifc', size: '63.2 MB', ver: 'IFC2x3 · v2', uploaded: '24 May 2026', elements: '3,910' },
  p5: { file: 'StirlingFlat.ifc', size: '6.8 MB', ver: 'IFC4 · v1', uploaded: '19 May 2026', elements: '640' },
  p6: { file: 'LeithCafe.ifc', size: '12.0 MB', ver: 'IFC4 · v4', uploaded: 'Handover', elements: '1,180' },
};
function bimFor(id) { return BIM[id] || { file: 'model.ifc', size: '—', ver: 'IFC4', uploaded: '—', elements: '—' }; }

// Subscription tiers — verbatim pricing from the company deck (§11).
const SUB_PLANS = [
  { id: 'trial', name: 'Free Trial', price: '£0', period: '30 days', tagline: '1 project to try it out',
    features: ['1 project', 'Single LiDAR scan', 'Coverage % vs BIM', 'Watermarked report'] },
  { id: 'starter', name: 'Starter', price: '£29', period: 'mo', tagline: '1 user · basic report',
    features: ['1 user', 'Up to 2 projects', 'Basic progress report', 'IFC / BIM import', 'Email support'] },
  { id: 'sb', name: 'Small Business', price: '£99', period: 'mo', tagline: '3 users · scan history', current: true,
    features: ['3 users', 'Up to 5 projects', 'Full scan history', 'PDF export', 'Coverage analytics'] },
  { id: 'pro', name: 'Pro', price: '£199', period: 'mo', tagline: 'More projects + exports',
    features: ['10 users', 'Up to 20 projects', 'Bulk PDF / CSV export', 'BIM version compare', 'Priority support'] },
  { id: 'team', name: 'Team', price: '£299', period: 'mo', tagline: 'Team dashboard',
    features: ['Unlimited users', 'Unlimited projects', 'Shared team dashboard', 'API access', 'Dedicated manager'] },
];
// Add-on / service pricing (deck §11)
const SUB_ADDONS = [
  { label: 'Paid progress report', price: '£300–£750' },
  { label: 'BIM / project setup', price: '~£500' },
  { label: 'Drone scan visit (Phase 2)', price: '~£1,000' },
];

Object.assign(window, { DATA, PLANS, planFor, BIM, bimFor, SUB_PLANS, SUB_ADDONS });
