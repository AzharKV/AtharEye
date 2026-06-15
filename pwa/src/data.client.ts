// Client demo seed — the 'client' phase (boot state on a fresh cache; see lib/store.ts).
// CK Group account identity, the Tabley Refurbishment project, and a single site-team member (Emanuel).
// State persists to localStorage; deleting this project flips the app to the 'optisync' phase.
// Captures at /captures/ are direct paths (photoSrc handles the leading-slash form).
import type { AppData } from './types';

export const SEED_CLIENT: AppData = {
  projects: [
    {
      id: 'rv1',
      name: 'Refurbishment',
      sector: 'Residential',
      type: 'Refurbishment',
      location: 'Tabley Rd, Liverpool L15',
      client: 'Private client',
      contractor: 'Cairn Refurbishment Ltd',
      preparedBy: 'Emanuel · Site Supervisor',
      area_m2: 84,
      stage: 'Early',
      overall_coverage: 22,
      status: 'Needs review',
      start_date: '2026-03-10',
      target_handover: '2026-09-30',
      depth: 'deep',
      reviewNote:
        'Our supervisor scanned the front bedroom in minutes — OptiSync flagged a 17 mm lean in the gable wall we\'d otherwise only have caught at final inspection. Saved a re-plaster after decoration. — Cairn Refurbishment Ltd',
      bim: {
        software: 'Autodesk Revit → IFC export',
        file: 'tabley_Refurb_R3.ifc',
        lod: 300,
        disciplines: ['Architectural', 'Structural'],
        last_aligned: '2026-06-13',
      },
      team: ['Emanuel · Site Supervisor'],
      trades: [
        { name: 'Strip-out & first fix', status: 'Done' },
        { name: 'Plastering', status: 'In progress' },
        { name: 'Kitchen install', status: 'In progress' },
        { name: 'Bathroom install', status: 'In progress' },
        { name: 'Joinery / second fix', status: 'Not started' },
        { name: 'Flooring', status: 'Not started' },
        { name: 'Decoration', status: 'Not started' },
        { name: 'Snagging', status: 'Not started' },
      ],
      zones: [
        {
          id: 'z2', name: 'Living room', area_m2: 20, coverage: 25, stage: 'Early',
          note: 'Strip-out done; first fix under way',
          works: [
            { code: 'N-382001', description: 'RAIL: TAKE OFF EXISTING AND MAKE GOOD', unit: 'LM', qty: 5, status: 'Done' },
            { code: 'N-330043', description: 'DOOR: RENEW FD30 FIRE INTERNAL - DECORATE', unit: 'NO', qty: 1, status: 'In progress' },
            { code: 'N-431315', description: 'SCREED: LATEX SELF LEVEL', unit: 'SM', qty: 15, status: 'Outstanding' },
            { code: 'N-305709', description: 'FLOORING: APPLY 2 COATS PRESERVATIVE', unit: 'SM', qty: 15, status: 'Outstanding' },
            { code: 'N-442651', description: 'RADIATOR: PREPARE, PAINT', unit: 'SM', qty: 1, status: 'Outstanding' },
          ],
        },
        {
          id: 'z3', name: 'Kitchen & dining', area_m2: 16, coverage: 23, stage: 'Early',
          note: 'First fix in; partition 38 mm off BIM',
          works: [
            { code: 'N-382001', description: 'RAIL: TAKE OFF EXISTING AND MAKE GOOD', unit: 'LM', qty: 14, status: 'In progress' },
            { code: 'N-330043', description: 'DOOR: RENEW FD30 FIRE INTERNAL - DECORATE', unit: 'NO', qty: 1, status: 'Outstanding' },
          ],
        },
        {
          id: 'z4', name: 'Bathroom', area_m2: 6, coverage: 26, stage: 'Early',
          note: 'Strip-out done; first fix in',
          works: [
            { code: 'N-432251', description: 'FLOOR TILES: HACK UP CERAMIC/QUARRY', unit: 'SM', qty: 3, status: 'Done' },
            { code: 'N-382001', description: 'RAIL: TAKE OFF EXISTING AND MAKE GOOD', unit: 'LM', qty: 1, status: 'In progress' },
            { code: 'N-442651', description: 'RADIATOR: PREPARE, PAINT', unit: 'SM', qty: 1, status: 'Outstanding' },
            { code: 'N-525007', description: 'PANE: REGLAZE 6MM GWPP', unit: 'SM', qty: 1, status: 'Outstanding' },
          ],
        },
        {
          id: 'z5', name: 'Bedroom 1 (front)', area_m2: 14, coverage: 15, stage: 'Early',
          note: 'Stripped; 17 mm plumb deviation flagged',
          works: [
            { code: 'N-305705', description: 'FLOORBOARD: REMOVE AND REFIX SINGLE BOARD', unit: 'LM', qty: 3, status: 'Outstanding' },
            { code: 'N-442651', description: 'RADIATOR: PREPARE, PAINT', unit: 'SM', qty: 1, status: 'Outstanding' },
            { code: 'N-525007', description: 'PANE: REGLAZE 6MM GWPP', unit: 'SM', qty: 1, status: 'Outstanding' },
          ],
        },
      ],
      // Area-weighted check: (20×25 + 16×23 + 6×26 + 14×15) / 56 = 1234 / 56 ≈ 22.04 → 22 ✓
      issues: [
        {
          id: 'RV-01',
          severity: 'Major',
          zone: 'Bedroom 1 (front)',
          title: 'Front wall 17 mm out of plumb over 2.4 m (NHBC limit 8 mm)',
          status: 'Open',
          raised: '2026-06-12',
          appear: 18,
          location_detail: 'Gable wall, north elevation',
          finding: 'Wall measured 17 mm out of plumb over 2.4 m height by OptiSync LiDAR scan.',
          measured: '17 mm deviation over 2.4 m',
          tolerance: 'NHBC Standards 2024: max 8 mm per 3 m height',
          deviation: '+9 mm over NHBC limit',
          impact: 'Within eye/tape tolerance but telegraphs through plasterboard and throws out fitted-wardrobe alignment. Risk of visible bow after boarding.',
          action: 'Review setting-out with site engineer; pack or rebuild before boarding.',
          responsible: 'Joiner',
          thumbnail: '/captures/bonaly_bedroom1.jpg',
        },
        {
          id: 'RV-02',
          severity: 'Minor',
          zone: 'Kitchen & dining',
          title: 'Island partition 38 mm off BIM setting-out line',
          status: 'Open',
          raised: '2026-06-09',
          appear: 14,
          location_detail: 'Island partition, kitchen & dining zone',
          finding: 'Partition built 38 mm off the BIM setting-out line, confirmed by LiDAR scan alignment.',
          measured: '38 mm offset from BIM line',
          tolerance: '±25 mm per project BIM spec',
          deviation: '+13 mm over tolerance',
          impact: 'Tightens worktop overhang and appliance gaps. May affect worktop template fit if not resolved before templating.',
          action: 'Re-set partition to BIM line or confirm revised layout with designer before worktop template.',
          responsible: 'Joiner',
          thumbnail: '/captures/bonaly_kitchen.jpg',
        },
      ],
      scans: [
        // Baseline established geometry + caught the kitchen partition off the BIM line (RV-02).
        { id: 'sc1', date: '2026-06-09', coverage: 0, note: 'Baseline vs BIM', status: 'Ready', newFindings: ['RV-02'] },
        // First progress scan — coverage 0 → 22 and flagged the Bedroom 1 plumb deviation (RV-01).
        { id: 'sc2', date: '2026-06-12', coverage: 22, note: 'First progress scan — structure verified, plumb deviation flagged', status: 'Ready', prevCoverage: 0, newFindings: ['RV-01'] },
      ],
      captures: [
        '/captures/bonaly_garden.jpg',
        '/captures/bonaly_living_room.jpg',
        '/captures/bonaly_kitchen.jpg',
        '/captures/bonaly_kitchen_diner.jpg',
        '/captures/bonaly_bathroom.jpg',
        '/captures/bonaly_bedroom1.jpg',
      ],
    },
  ],
  company: {
    name: 'CK Group of Construction',
    companyNo: '14872301',
    vat: 'GB 438 2291 04',
    registeredOffice: '100a North Birkbeck Road, London E11 4JQ',
    established: '13 Jun 2026',
    monogram: 'CK',
  },
  user: {
    name: 'Clint John',
    role: 'Director',
    email: 'clint.john@ckgroupconstruction.co.uk',
    initials: 'CJ',
  },
  team: [
    { id: 'm-em', name: 'Emanuel', initials: 'EM', role: 'Admin', email: 'emanuel@ckgroupconstruction.co.uk', trade: 'Site supervisor' },
  ],
  subscription: {
    plan: 'Business',
    price: '£49',
    period: '/mo',
    renews: '01 Jul 2026',
    used: 1,
    limit: 10,
    tiers: [
      { id: 'free', name: 'Free', price: '£0', period: '/mo', tagline: 'Try OptiSync', features: ['1 project', 'Watermarked reports', 'Community support'] },
      { id: 'starter', name: 'Starter', price: '£19', period: '/mo', tagline: 'Sole traders', features: ['3 projects', 'Unwatermarked reports', 'Email support'] },
      { id: 'business', name: 'Business', price: '£49', period: '/mo', current: true, tagline: 'Growing contractors', features: ['10 projects', 'PDF export + share links', 'Team access (4 seats)', 'Priority support'] },
      { id: 'pro', name: 'Pro', price: '£99', period: '/mo', tagline: 'Multi-site teams', features: ['30 projects', 'Unlimited seats', 'Custom branding on reports', 'BIM auto-align'] },
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
