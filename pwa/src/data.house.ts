// Bonaly Terrace demo seed — single residential renovation project.
// Default dataset (no VITE_DATASET env). Area-weighted rollup = 22 (verified below).
// Early-stage starting state: a baseline + one progress scan, so the live demo scan is the
// meaningful action that moves the project off 22%.
// Captures at /captures/ are direct paths (photoSrc handles the leading-slash form).
import type { AppData } from './types';

export const SEED_HOUSE: AppData = {
  projects: [
    {
      id: 'rv1',
      name: 'Bonaly Terrace Refurbishment',
      sector: 'Residential',
      type: 'Residential — full refurbishment',
      location: 'Colinton, Edinburgh EH13',
      client: 'Private client',
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
        file: 'Bonaly_Refurb_R3.ifc',
        lod: 300,
        disciplines: ['Architectural', 'Structural'],
        last_aligned: '2026-06-11',
      },
      team: [
        'J. Mackay · Site supervisor',
        'Cairn Refurbishment Ltd · Main contractor',
        'R. Stewart · Joiner',
      ],
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
      // Four scanned rooms (ids kept z2–z5 so ZONE_FEED + capture refs stay valid; each has its own
      // dedicated feed, no fallback). Early stage across the board; Bedroom 1 is the problem zone.
      zones: [
        { id: 'z2', name: 'Living room', area_m2: 20, coverage: 25, stage: 'Early', note: 'Strip-out done; first fix under way' },
        { id: 'z3', name: 'Kitchen & dining', area_m2: 16, coverage: 23, stage: 'Early', note: 'First fix in; partition 38 mm off BIM' },
        { id: 'z4', name: 'Bathroom', area_m2: 6, coverage: 26, stage: 'Early', note: 'Strip-out done; first fix in' },
        { id: 'z5', name: 'Bedroom 1 (front)', area_m2: 14, coverage: 15, stage: 'Early', note: 'Stripped; 17 mm plumb deviation flagged' },
      ],
      // Area-weighted check (rollup is over the four scanned zones, not the 84 m² whole-house GIA):
      // (20×25 + 16×23 + 6×26 + 14×15) / (20+16+6+14)
      // = (500 + 368 + 156 + 210) / 56 = 1234 / 56 ≈ 22.04 → rounds to 22 ✓
      issues: [
        {
          id: 'RV-01',
          severity: 'Major',
          zone: 'Bedroom 1 (front)',
          title: 'Front wall 17 mm out of plumb over 2.4 m (NHBC limit 8 mm)',
          status: 'Open',
          raised: '2026-06-11',
          appear: 18,
        },
        {
          id: 'RV-02',
          severity: 'Minor',
          zone: 'Kitchen & dining',
          title: 'Island partition 38 mm off BIM setting-out line',
          status: 'Open',
          raised: '2026-05-30',
          appear: 14,
        },
      ],
      scans: [
        { id: 'sc1', date: '2026-05-28', coverage: 0, note: 'Baseline vs BIM' },
        { id: 'sc2', date: '2026-06-11', coverage: 22, note: 'First progress scan — structure verified, plumb deviation flagged' },
      ],
      // Direct-path captures — photoSrc passes through paths starting with /
      // Garden leads as the establishing project hero, then the four scanned zones:
      // living→z2, kitchen + kitchen_diner→z3, bathroom→z4, bedroom1→z5.
      // (hall/stairs/landing/bedroom2 images stay unused in public/captures/ after the 7→4 zone cut.)
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
    name: 'Cairn Refurbishment Ltd',
    companyNo: 'SC512347',
    vat: 'GB 412 7785 09',
    registeredOffice: '14 Constitution Street, Leith, Edinburgh, EH6 7BT',
    established: '2014',
  },
  user: {
    name: 'J. Mackay',
    role: 'Site Supervisor',
    email: 'j.mackay@cairnrefurb.co.uk',
    initials: 'JM',
  },
  team: [
    { id: 'm-jm', name: 'J. Mackay', initials: 'JM', role: 'Owner', email: 'j.mackay@cairnrefurb.co.uk', trade: 'Site supervisor' },
    { id: 'm-ma', name: 'M. Ahmed', initials: 'MA', role: 'Admin', email: 'm.ahmed@cairnrefurb.co.uk', trade: 'Scan / tech' },
    { id: 'm-rs', name: 'R. Stewart', initials: 'RS', role: 'Editor', email: 'r.stewart@cairnrefurb.co.uk', trade: 'Joiner' },
    { id: 'm-kd', name: 'K. Dunn', initials: 'KD', role: 'Viewer', email: 'k.dunn@cairnrefurb.co.uk', trade: 'Quantity surveyor' },
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
